package gw.sampledata.search

uses gw.api.builder.AuditBuilder
uses gw.api.builder.CancellationBuilder
uses gw.api.builder.PolicyChangeBuilder
uses gw.api.builder.ReinstatementBuilder
uses gw.api.builder.RenewalBuilder
uses gw.job.OOSConflictTestHelper
uses gw.plugin.policynumgen.IPolicyNumGenPlugin
uses gw.sampledata.AbstractSampleDataCollection
uses gw.sampledata.SampleDataConstants
uses java.lang.IllegalStateException
uses java.lang.Thread
uses java.util.ArrayList
uses java.util.Collections
uses java.util.LinkedHashMap
uses gw.api.system.PLDependenciesGateway
uses gw.integration.plugins.PluginDefMockWrapper

@Export
class SearchSamplePolicyData extends AbstractSampleDataCollection {

  public static var _policyPeriodIDs : List<String> = new ArrayList<String>()

  final static var Underwriters = {"aapplegate", "bbaker"}
  // these have to have the same size as Underwriters
  static var _currentJobNum     = {1,            3}
  static var _jobFmt            = {"J64204%05d", "J36251%05d"}

  static var _firstJobNum = String.format(_jobFmt[0], {_currentJobNum[0]})

  static function getNextJobNum(i : int) : String {
    var num = String.format(_jobFmt[i], {_currentJobNum[i]})
    _currentJobNum[i] += 4
    return num
  }

  static function LastJobNum(s : String) : String {
    var i = Underwriters.indexOf(s)
    return String.format(_jobFmt[i], {_currentJobNum[i]})
  }

  static function NextJobNum(s : String) : String {
    return getNextJobNum(Underwriters.indexOf(s))
  }

  static function NextJobNum(period : PolicyPeriod) : String {
    return NextJobNum(period.Policy.getUserRoleAssignmentByRole(typekey.UserRole.TC_UNDERWRITER).AssignedUser.Credential.UserName)
  }

  static property get PeriodIds() : List<String> {
    return Collections.unmodifiableList(_policyPeriodIDs)
  }

  private function addIDs(periodID : String) : String {
    _policyPeriodIDs.add(periodID)
    return periodID
  }

  override property get CollectionName() : String {
    return "Search Test Policies"
  }

  override property get AlreadyLoaded() : boolean {
    return jobLoaded(_firstJobNum)
  }

  // TODO: must actually loop through makePolicyChanges and create the policies.
  // This probably necessitates adding additional contacts/accounts so as not to
  // break all of the existing tests.

  /*
   * Jobs that need to be created and checked for slicing issues:
   *
   *  •	Changing data on an entity vs. changing foreign key to that entity
   *    o	Probably need to try several instances of this because of all the traversals we do
   *    o	Especially need to validate EffDated-to-EffDated joins
   *  •	PolicyChange that overwrites full period as well as "conventional" PolicyChange
   *  •	Back-dated change (EditEffectiveDate < Date.Today)
   *  •	Midterm addition
   *  •	Midterm removal and later midterm re-addition
   *  •	Change EditEffectiveDate
   *  •	OOS change that overwrites full period
   *  •	OOS conflict, resolved both ways (overwrite vs keep future result)
   *  •	Midterm addition with OOS re-addition (backward-growing slice)
   *  •	Pre-emption and OOS pre-emption
   *
   * To implement one of these test cases, replace {throw "Not yet implemented"} with a call
   * to a method that creates the desired policy change(s).
   */
  private var makePolicyChanges : LinkedHashMap<String, block(testName : String, basedOn : PolicyPeriod)> = {
    "Change name data on PNI, at PolicyStart"                -> \ l, p -> {changePNINameAtPolicyStart(l, p)},
    "Change foreign key to PNI, at PolicyStart"              -> \ l, p -> {changePNIAtPolicyStart(l, p)},
    "Change name data on PNI, mid-term"                      -> \ l, p -> {changePNINameAtMidTerm(l, p)},
    "Change foreign key to PNI, mid-term"                    -> \ l, p -> {changePNIAtMidTerm(l, p)},  // loses initial slice?
    "Change name data on ANI, at PolicyStart"                -> \ l, p -> {changeANINameAtPolicyStart(l, p)},
    "Change foreign key to ANI, at PolicyStart"              -> \ l, p -> {changeANIAtPolicyStart(l, p)},
    "Change name data on ANI, mid-term"                      -> \ l, p -> {changeANINameAtMidTerm(l, p)},
    "Change foreign key to ANI, mid-term"                    -> \ l, p -> {changeANIAtMidTerm(l, p)},
    "Change AddressLine1, at PolicyStart before today"       -> \ l, p -> {changeAddressLine1AtPolicyStart(l, p)},
    "Change AddressLine1, mid-term but before today"         -> \ l, p -> {changeAddressLine1AtMidTerm(l, p)},
    "Add new ANI mid-term"                                   -> \ l, p -> {addANIMidTerm(l, p)},
    "At three mid-term dates, add/remove/re-add ANI"         -> \ l, p -> {addRemoveReaddANIMidTerm(l, p)},
    "Start a change, CEED, Change name data on PNI"          -> \ l, p -> {changeEEDAndNameOnPNI(l, p)},
    "OOS change at PeriodStart overriding change of PNI"     -> \ l, p -> {LateChangeOnPNIOOSChangeAtStart(l, p, true)}, // gives invalid slice date?
    "OOS change at PeriodStart keeping later change of PNI"  -> \ l, p -> {LateChangeOnPNIOOSChangeAtStart(l, p)},
    "OOS conflict on City, resolve by overwrite"             -> \ l, p -> {OOSChangesOnCity(l, p, true)},
    "OOS conflict on City, resolve by keeping future result" -> \ l, p -> {OOSChangesOnCity(l, p)},
    "Add an ANI mid-term, then re-add in an OOS change"      -> \ l, p -> {addANIMidTermReAddInOOS(l, p)},
    "Two simultaneous policy changes (preemption)"           -> \ l, p -> {createPreemptionEarlyFirst(l, p)},
    "Two simultaneous policy changes (OOS preemption)"       -> \ l, p -> {createPreemptionLateFirst(l, p)},
    "Two simultaneous policy changes (Same Date preemption)" -> \ l, p -> {createPreemptionSameDate(l, p)},
    "Two unbound policy change"                              -> \ l, p -> {createTwoUnboundPolicyChanges(l, p)}
  }

 private function changePNINameAtPolicyStart(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)

   var pChangeBuilder = new PolicyChangeBuilder()
                      .withBasedOnPeriod(basedOn).withDesc(testName)
                      .withJobNumber(changeNum)
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .withEffectiveDate( basedOn.PolicyStartDate)
                      .isDraft()
   var pChange = pChangeBuilder.create(basedOn.Bundle)

   pChange.PrimaryNamedInsured.LastName= "Gisi"
   pChangeBuilder.requestQuote()
   pChangeBuilder.bind()
 }

 private function changePNIAtPolicyStart(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)

   var pChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName).withJobNumber(changeNum)
                      .withEffectiveDate( basedOn.PolicyStartDate)
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange = pChangeBuilder.create(basedOn.Bundle)

   var accountContact = basedOn.Policy.Account.AccountContacts.firstWhere(\ ac -> ac.Contact != basedOn.PNIContactDenorm)
   pChange.changePrimaryNamedInsuredTo(accountContact.Contact)

   pChangeBuilder.requestQuote()
   pChangeBuilder.bind()
 }

 private function changePNINameAtMidTerm(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var pChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName).withJobNumber(changeNum)
                          .withEffectiveDate(basedOn.PolicyStartDate.addMonths(2))
                          .withPublicId(addIDs("solr:" + changeNum + "C"))
                          .isDraft()
   var pChange = pChangeBuilder.create(basedOn.Bundle)

   pChange.PrimaryNamedInsured.LastName= "Zielke"

   pChangeBuilder.requestQuote()
   pChangeBuilder.bind()
 }

 private function changePNIAtMidTerm(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var pChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName).withJobNumber(changeNum)
                        .withEffectiveDate( basedOn.PolicyStartDate.addMonths(2))
                        .withPublicId(addIDs("solr:" + changeNum + "C"))
                        .isDraft()
   var pChange = pChangeBuilder.create(basedOn.Bundle)

   var accountContact = basedOn.Policy.Account.AccountContacts.firstWhere(\ ac -> ac.Contact != basedOn.PNIContactDenorm
                                                                                  and not ac.Roles.hasMatch(\ r -> r.Subtype == "NamedInsured"))
   pChange.changePrimaryNamedInsuredTo(accountContact.Contact)

   pChangeBuilder.requestQuote()
   pChangeBuilder.bind()
 }

 private function findAddlInsureds(p : PolicyPeriod)  : PolicyContactRole[] {
   return p.PolicyContactRoles.where(\ pcr -> pcr typeis PolicyAddlNamedInsured or pcr typeis PolicySecNamedInsured)
 }

 private function changeANINameAtPolicyStart(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var pChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName).withJobNumber(changeNum)
                      .withEffectiveDate(basedOn.PolicyStartDate)
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange = pChangeBuilder.create(basedOn.Bundle)

   findAddlInsureds(pChange).firstWhere(\ pcr -> pcr.AccountContactRole.AccountContact.Contact typeis Person).LastName= "Mole"

   pChangeBuilder.requestQuote()
   pChangeBuilder.bind()
 }

 private function changeANINameAtMidTerm(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var pChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName).withJobNumber(changeNum)
                      .withEffectiveDate(basedOn.PolicyStartDate.addMonths(2))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange = pChangeBuilder.create(basedOn.Bundle)

   findAddlInsureds(pChange).firstWhere(\ pcr -> pcr.AccountContactRole.AccountContact.Contact typeis Person).LastName= "Nickle"

   pChangeBuilder.requestQuote()
   pChangeBuilder.bind()
 }

 private function changeANIAtPolicyStart(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var pChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName).withJobNumber(changeNum)
                      .withEffectiveDate( basedOn.PolicyStartDate)
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange = pChangeBuilder.create(basedOn.Bundle)

   var aniCandidate = pChange.AdditionalNamedInsuredOtherCandidates.first()
   var oldANI = findAddlInsureds(pChange).first()
   pChange.removeFromPolicyContactRoles(oldANI)
   pChange.addNewPolicyAddlNamedInsuredForContact(aniCandidate.Contact)

   pChangeBuilder.requestQuote()
   pChangeBuilder.bind()
 }

 private function changeANIAtMidTerm(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var pChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName).withJobNumber(changeNum)
                      .withEffectiveDate( basedOn.PolicyStartDate.addMonths(1))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange = pChangeBuilder.create(basedOn.Bundle)

   var aniCandidate = pChange.AdditionalNamedInsuredOtherCandidates.first()
   var oldANI = findAddlInsureds(pChange).first()
   pChange.removeFromPolicyContactRoles(oldANI)
   pChange.addNewPolicyAddlNamedInsuredForContact(aniCandidate.Contact)

   pChangeBuilder.requestQuote()
   pChangeBuilder.bind()
 }

 private function changeAddressLine1AtPolicyStart(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var pChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName).withJobNumber(changeNum)
                      .withEffectiveDate(basedOn.PolicyStartDate)
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange = pChangeBuilder.create(basedOn.Bundle)

   pChange.PolicyAddress.AddressLine1 = "858 Allie Lane"

   pChangeBuilder.requestQuote()
   pChangeBuilder.bind()
 }

 private function changeAddressLine1AtMidTerm(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var pChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName).withJobNumber(changeNum)
                      .withEffectiveDate(basedOn.PolicyStartDate.addBusinessDays(20))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange = pChangeBuilder.create(basedOn.Bundle)

   pChange.PolicyAddress.AddressLine1 = "241 Dona Lane"

   pChangeBuilder.requestQuote()
   pChangeBuilder.bind()
 }

 private function addANIMidTerm(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var pChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName).withJobNumber(changeNum)
                      .withEffectiveDate( basedOn.PolicyStartDate.addMonths(1))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange = pChangeBuilder.create(basedOn.Bundle)

   var aniCandidate = pChange.AdditionalNamedInsuredOtherCandidates.first()
   pChange.addNewPolicyAddlNamedInsuredForContact(aniCandidate.Contact)

   pChangeBuilder.requestQuote()
   pChangeBuilder.bind()
 }

 private function addRemoveReaddANIMidTerm(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var pChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName).withJobNumber(changeNum)
                      .withEffectiveDate( basedOn.PolicyStartDate.addDays(25))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange = pChangeBuilder.create(basedOn.Bundle)

   var aniCandidate = pChange.AdditionalNamedInsuredOtherCandidates.first()
   pChange.addNewPolicyAddlNamedInsuredForContact(aniCandidate.Contact)

   pChangeBuilder.requestQuote()
   pChangeBuilder.bind()

   //Remove aniCandidate
   changeNum = NextJobNum(basedOn)
   var pChangeBuilder2 = new PolicyChangeBuilder().withBasedOnPeriod(pChange).withDesc(testName + " removal").withJobNumber(changeNum)
                      .withEffectiveDate( basedOn.PolicyStartDate.addDays(40))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange2 = pChangeBuilder2.create(basedOn.Bundle)

   var oldANI = findAddlInsureds(pChange2).firstWhere(\ pcr -> pcr.AccountContactRole.AccountContact.Contact == aniCandidate.Contact)
   pChange2.removeFromPolicyContactRoles(oldANI)

   pChange2.PolicyChangeProcess.requestQuote()
   pChange2.PolicyChangeProcess.bind()

   //ReAdd aniCandidate
   changeNum = NextJobNum(basedOn)
   var pChangeBuilder3 = new PolicyChangeBuilder().withBasedOnPeriod(pChange2).withDesc(testName + " re-addition").withJobNumber(changeNum)
                      .withEffectiveDate( basedOn.PolicyStartDate.addDays(45))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange3 = pChangeBuilder3.create(basedOn.Bundle)
   pChange3.addNewPolicyAddlNamedInsuredForContact(aniCandidate.Contact)

   pChangeBuilder3.requestQuote()
   pChangeBuilder3.bind()
 }

/** --- COMMENTED OUT AS THESE WILL NOT WORK IN CUSTOMER ONLY MODE --- */

 private function changeEEDAndNameOnPNI(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var iDay = basedOn.PolicyStartDate

   var pChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName).withJobNumber(changeNum)
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .withEffectiveDate(iDay.addMonths(1))
                      .isDraft()

   var pChange = pChangeBuilder.create(basedOn.Bundle)

   pChange.PrimaryNamedInsured.LastName= "Wiedemann"
   pChange = pChange.PolicyChangeProcess.changeEditEffectiveDate(iDay.addMonths(2))

   pChange.PolicyChangeProcess.requestQuote()
   pChange.PolicyChangeProcess.bind()
 }

 private function LateChangeOnPNIOOSChangeAtStart(testName : String, basedOn : PolicyPeriod, shouldOverride : boolean = false) {
   var changeNum = NextJobNum(basedOn)
   var pChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName).withJobNumber(changeNum)
                      .withEffectiveDate( basedOn.PolicyStartDate.addMonths(2))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange = pChangeBuilder.create(basedOn.Bundle)

   pChange.PrimaryNamedInsured.LastName = shouldOverride ? "Dyment" :  "Joaquin"

   pChangeBuilder.requestQuote()
   pChangeBuilder.bind()

   changeNum = NextJobNum(basedOn)
   var pChangeBuilder2 = new PolicyChangeBuilder().withBasedOnPeriod(pChange).withDesc(testName + " OOS change").withJobNumber(changeNum)
                      .withEffectiveDate( basedOn.PeriodStart)
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange2 = pChangeBuilder2.create(basedOn.Bundle)

   pChange2.PrimaryNamedInsured.LastName = shouldOverride ? "Krall" : "Schlottmann"

   //OOS happen here
   OOSConflictTestHelper.quoteAndMergeOOSConflictsIfNecessary(\ p -> pChangeBuilder2.requestQuote(), pChange2, shouldOverride)
   pChangeBuilder2.bind()
 }

 private function OOSChangesOnCity(testName : String, basedOn : PolicyPeriod, shouldOverride : boolean = false) {
   var changeNum = NextJobNum(basedOn)
   var pChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName).withJobNumber(changeNum)
                      .withEffectiveDate( basedOn.PolicyStartDate.addMonths(1))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange = pChangeBuilder.create(basedOn.Bundle)

   pChange.PolicyAddress.City = "SomeCity"

   pChangeBuilder.requestQuote()
   pChangeBuilder.bind()

   changeNum = NextJobNum(basedOn)
   var pChangeBuilder2 = new PolicyChangeBuilder().withBasedOnPeriod(pChange).withDesc(testName + " OOS change").withJobNumber(changeNum)
                      .withEffectiveDate( basedOn.PolicyStartDate.addDays(10))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange2 = pChangeBuilder2.create(basedOn.Bundle)

   pChange2.PolicyAddress.City = "SomeOtherCity"

   //OOS happen here
   OOSConflictTestHelper.quoteAndMergeOOSConflictsIfNecessary(\ p -> pChangeBuilder2.requestQuote(), pChange2, shouldOverride)
   pChangeBuilder2.bind()
 }

 private function addANIMidTermReAddInOOS(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var pChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName).withJobNumber(changeNum)
                      .withEffectiveDate( basedOn.PolicyStartDate.addMonths(1))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange = pChangeBuilder.create(basedOn.Bundle)

   var aniCandidate = pChange.AdditionalNamedInsuredOtherCandidates.first()
   pChange.addNewPolicyAddlNamedInsuredForContact(aniCandidate.Contact)

   pChangeBuilder.requestQuote()
   pChangeBuilder.bind()

   changeNum = NextJobNum(basedOn)
   var pChangeBuilder2 = new PolicyChangeBuilder().withBasedOnPeriod(pChange).withDesc(testName + " OOS change").withJobNumber(changeNum)
                      .withEffectiveDate( basedOn.PolicyStartDate.addDays(10))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var pChange2 = pChangeBuilder2.create(basedOn.Bundle)

   pChange2.addNewPolicyAddlNamedInsuredForContact(aniCandidate.Contact)

   //OOS happen here
   OOSConflictTestHelper.quoteAndMergeOOSConflictsIfNecessary(\ p -> pChangeBuilder2.requestQuote(), pChange2, true)
   pChangeBuilder2.bind()

 }
 /* --- END OF COMMENTED OUT HELPER TEST METHODS */

 private function createPreemptionLateFirst(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var preemptedChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName + " preempted period").withJobNumber(changeNum)
                      .withEffectiveDate(basedOn.PolicyStartDate.addDays(15))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var preemptedChange = preemptedChangeBuilder.create(basedOn.Bundle)
   preemptedChange.PrimaryNamedInsured.LastName= "Kifer"

   changeNum = NextJobNum(basedOn)
   var preemptingChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName + " preempting period").withJobNumber(changeNum)
                      .withEffectiveDate(basedOn.PolicyStartDate.addDays(18))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var preemptingChange = preemptingChangeBuilder.create(basedOn.Bundle)
   preemptingChange.PrimaryNamedInsured.LastName= "Walworth"

   preemptingChange.PolicyChangeProcess.requestQuote()
   preemptingChange.PolicyChangeProcess.bind()

   var results = preemptedChange.PolicyChangeProcess.handlePreemptions()
   var conflicts = results.Conflicts
   conflicts.each(\ cf -> { cf.ShouldOverride = true })

   //OOS happen here
   OOSConflictTestHelper.quoteAndMergeOOSConflictsIfNecessary(\ p -> p.PolicyChangeProcess.requestQuote(), results.Branch, true)
   results.Branch.PolicyChangeProcess.bind()
 }

 private function createPreemptionEarlyFirst(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var preemptedChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName + " preempted period").withJobNumber(changeNum)
                      .withEffectiveDate(basedOn.PolicyStartDate.addMonths(2))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var preemptedChange = preemptedChangeBuilder.create(basedOn.Bundle)
   preemptedChange.PrimaryNamedInsured.LastName= "Broce"

   changeNum = NextJobNum(basedOn)
   var preemptingChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName + " preempting period").withJobNumber(changeNum)
                      .withEffectiveDate(basedOn.PolicyStartDate.addMonths(1))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var preemptingChange = preemptingChangeBuilder.create(basedOn.Bundle)
   preemptingChange.PrimaryNamedInsured.LastName= "Bonavita"

   preemptingChange.PolicyChangeProcess.requestQuote()
   preemptingChange.PolicyChangeProcess.bind()

   var results = preemptedChange.PolicyChangeProcess.handlePreemptions()
   var conflicts = results.Conflicts
   conflicts.each(\ cf -> { cf.ShouldOverride = true })

   results.Branch.PolicyChangeProcess.requestQuote()
   results.Branch.PolicyChangeProcess.bind()
 }

 private function createPreemptionSameDate(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var iDay = basedOn.PolicyStartDate.addDays(31)
   var preemptedChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName + " preempted period").withJobNumber(changeNum)
                      .withEffectiveDate(iDay)
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var preemptedChange = preemptedChangeBuilder.create(basedOn.Bundle)
   preemptedChange.PrimaryNamedInsured.LastName= "Kadel"

   changeNum = NextJobNum(basedOn)
   var preemptingChangeBuilder = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName + " preempting period").withJobNumber(changeNum)
                      .withEffectiveDate(iDay)
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var preemptingChange = preemptingChangeBuilder.create(basedOn.Bundle)
   preemptingChange.PrimaryNamedInsured.LastName= "Prestwich"

   preemptingChange.PolicyChangeProcess.requestQuote()
   preemptingChange.PolicyChangeProcess.bind()

   var results = preemptedChange.PolicyChangeProcess.handlePreemptions()
   var conflicts = results.Conflicts
   conflicts.each(\ cf -> { cf.ShouldOverride = true })

   results.Branch.PolicyChangeProcess.requestQuote()
   results.Branch.PolicyChangeProcess.bind()
 }

  private function createTwoUnboundPolicyChanges(testName : String, basedOn : PolicyPeriod) {
   var changeNum = NextJobNum(basedOn)
   var unboundChangeBuilder1 = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName + " unbound period one").withJobNumber(changeNum)
                      .withEffectiveDate(basedOn.PolicyStartDate.addMonths(2))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var unboundChange1 = unboundChangeBuilder1.create(basedOn.Bundle)
   unboundChange1.PrimaryNamedInsured.LastName= "Moore"

   changeNum = NextJobNum(basedOn)
   var unboundChangeBuilder2 = new PolicyChangeBuilder().withBasedOnPeriod(basedOn).withDesc(testName + " unbound period two").withJobNumber(changeNum)
                      .withEffectiveDate(basedOn.PolicyStartDate.addMonths(3))
                      .withPublicId(addIDs("solr:" + changeNum + "C"))
                      .isDraft()
   var unboundChange2 = unboundChangeBuilder2.create(basedOn.Bundle)
   unboundChange2.PrimaryNamedInsured.LastName= "Lillard"
 }

  private class AccountBasedPolicyNumPlugin implements IPolicyNumGenPlugin {
    override function genNewPeriodPolicyNumber(period : PolicyPeriod) : String {
      var accountContact = period.PrimaryNamedInsured.AccountContactRole.AccountContact
      var accountNumber = accountContact.Account.AccountNumber

      return (accountContact.Contact typeis Person ? "P" : "C") + accountNumber.substring(1)
    }
  }

  override function load() {
    var wcPolicies : List<String> = {}

    // create policies from the list generated in SearchSampleAccountData
    if (SearchSampleAccountData.PersonalAccounts.Empty) {
      throw new IllegalStateException("Accounts have not been loaded")
    }

    var config = PLDependenciesGateway.getPluginConfig()
    var existingPluginDef = config.getPluginDef(IPolicyNumGenPlugin)
    try {
      var newPluginDef = new PluginDefMockWrapper (IPolicyNumGenPlugin, new AccountBasedPolicyNumPlugin())
      config.addPluginDef(newPluginDef)

      for (underwriter in Underwriters) {
        var policyChangeTests : LinkedHashMap<String, block(testName : String, basedOn : PolicyPeriod)> = null
        var accounts = (underwriter == "bbaker") ? SearchSampleAccountData.CommercialAccounts : SearchSampleAccountData.PersonalAccounts
        for (account in accounts index ix) {
          var i = (underwriter == "bbaker") ? (ix + 11) : ix
          runBlockAsUser(underwriter, "SearchSamplePolicyData -- ${underwriter}", \ -> {
            var jobNum = NextJobNum(underwriter)
            var acct = findAccount(account)
            if (account == SearchSampleAccountData.FirstPolicyChangeAccount) {
              policyChangeTests = makePolicyChanges
            }

            var namedInsureds = acct.getAccountContactsWithRole(TC_NAMEDINSURED).map(\ ni -> ni.DisplayName)

            if (underwriter == "aapplegate") {
              if (i % 4 != 0) {
                // 3 out of 4 personal policies should be personal auto
                loadSubmission(jobNum, account, "PersonalAuto", SampleDataConstants.getBaseDateMinus(0, 3, 0), namedInsureds, true, addIDs("solr:" + jobNum))
              } else {
                loadSubmission(jobNum, account, "BusinessOwners", SampleDataConstants.getBaseDateMinus(0, 9, 0), namedInsureds, true, addIDs("solr:" + jobNum))
              }
            } else {
              switch (i % 4) {
                case 0:
                case 1:
                  loadSubmission(jobNum, account, "BusinessOwners", SampleDataConstants.getBaseDateMinus(0, 4, 0), namedInsureds, true, addIDs("solr:" + jobNum))
                  break
                case 2:
                  loadSubmission(jobNum, account, "BusinessAuto", SampleDataConstants.getBaseDateMinus(0, 5, 0), namedInsureds, true, addIDs("solr:" + jobNum))
                  break
                case 3:
                  loadSubmission(jobNum, account, "WorkersComp", SampleDataConstants.getBaseDateMinus(0, 7, 0), namedInsureds, true, addIDs("solr:" + jobNum))
                  wcPolicies.add(jobNum)
                  break
              }
            }
            if (policyChangeTests != null and !policyChangeTests.Empty) {
              var testName = policyChangeTests.Keys.first()
              var testBody = policyChangeTests.get(testName)
              policyChangeTests.remove(testName)
              runTransactionAsUser(null, "PolicyChange for " +testName, \ bundle -> {
                testBody(testName, findPeriodByJobNumber(jobNum, bundle))
              })
             } else switch (i % 3) {
              case 0:
                break  // just do a submission
              case 1:  // do a submission plus a policychange
                var changeNum = NextJobNum(underwriter)
                runTransactionAsUser(null, "PolicyChange ${changeNum}", \ bundle -> {
                    new PolicyChangeBuilder()
                      .withJobNumber(changeNum)
                      .withBasedOnPeriod(findPeriodByJobNumber(jobNum, bundle))
                      .withPublicId(addIDs("solr:" + changeNum))
                      .create(bundle)
                })

                if (i % 6 == 4) {
                  // Every other change proceeds to the renew/cancel/reinstate chain below
                  jobNum = changeNum
                } else {
                  break
                }
                // SOMETIMES FALL THROUGH

              case 2: // do a renewal, and possibly a cancel/reinstate
                var renewalNum = NextJobNum(underwriter)
                runTransactionAsUser(null, "Renewal ${renewalNum}", \ bundle -> {
                  var basedOn = findPeriodByJobNumber(jobNum, bundle)
                  var builder = new RenewalBuilder()
                      .withJobNumber(renewalNum)
                      .withBasedOnPeriod(basedOn)
                      .withPolicyNumber(basedOn.PolicyNumber + "R")
                      .withPublicId(addIDs("solr:" + renewalNum))
                  if (i % 8 == 0) {
                    builder.isQuoted() // leave unbound some of the time
                  }
                  builder.create(bundle)
                })

                // i at this point is {2, 5, 8, 11, 14, 17} U {4, 10, 16}
                if (i % 4 == 0) {
                  break // stop with just a renewal some of the time
                }
                var cancelNum = NextJobNum(underwriter)
                runTransactionAsUser(null, "Cancellation ${cancelNum}", \ bundle -> {
                  var builder = new CancellationBuilder()
                      .withJobNumber(cancelNum)
                      .withBasedOnPeriod(findPeriodByJobNumber(renewalNum, bundle))
                      .withPublicId(addIDs("solr:" + cancelNum))
                  if (i % 5 == 0) {
                    // leave the cancellation unbound
                    builder.isQuoted()
                  }
                  builder.create(bundle)
                })
                if ({5, 10, 11, 16}.contains(i)) {
                  break // stop with cancellation some of the time
                }

                var reinstNum = NextJobNum(underwriter)
                runTransactionAsUser(null, "Reinstatement ${reinstNum}", \ bundle -> {
                  var builder = new ReinstatementBuilder()
                      .withJobNumber(reinstNum)
                      .withBasedOnPeriod(findPeriodByJobNumber(cancelNum, bundle))
                      .withPublicId(addIDs("solr:" + reinstNum))

                  if (i == 17) {
                    builder.isQuoted() // leave one reinstatement unbound
                  }

                  builder.create(bundle)

                })
                break
            }
         })

          Thread.sleep(1000) // leave some space between these to help mitigate deadlock
        }
print("#### last policy for underwriter ${underwriter} had jobnum ${LastJobNum(underwriter)}")
      }

      for (jobNum in wcPolicies) {
        // TODO: figure out why only su has all the permissions needed to do this
        runBlockAsUser("su", "Create audits for WC submissions", \ -> {
          runTransactionAsUser(null, "Audit for WC submission", \ bundle -> {
            var period = findPeriodByJobNumber(jobNum, bundle)
            var info = period.AuditInformations.singleWhere(\a -> a.IsFinalAudit and a.IsScheduled)
            var audit = new AuditBuilder().withAuditInformation(info).isDraft().create(bundle)
            audit.WorkersCompLine.WCCoveredEmployeeBases*.Unsliced.each(\ w -> {w.AuditedAmount = w.BasisAmount})
            audit.AuditProcess.requestQuote()
            audit.AuditProcess.complete()
           })
        })

        Thread.sleep(1000) // leave some space between these to help mitigate deadlock
      }
    } finally {
      config.addPluginDef(existingPluginDef)
    }
  }

}
