package gw.lob.pa

uses gw.api.copy.Copier

/**
 * Copies a {@link PolicyDriver} into a {@link PersonalAutoLine}
 */
@Export
class PolicyDriverCopier extends Copier<PersonalAutoLine> {

  var _sourcePolicyDriver : PolicyDriver

  construct(sourcePolicyDriver : PolicyDriver) {
    _sourcePolicyDriver = sourcePolicyDriver
  }
  

  override property get Source() : PolicyDriver {
    return _sourcePolicyDriver
  }

  override function findMatch(targetLine : PersonalAutoLine) : PolicyDriver[] {
    var matches = Source.findMatchesInPeriodUntyped(targetLine.Branch, false)
    var match = matches.firstWhere(\ m -> m.EffectiveDateRange.includes(targetLine.Branch.EditEffectiveDate)) as PolicyDriver
    return (match != null) ? new PolicyDriver[]{match} : null
  }

  override function copy(targetLine : PersonalAutoLine) {
    var sourceContact = Source.AccountContactRole.AccountContact.Contact
    var sourceDriver = Source.AccountContactRole as Driver
    
    var targetPolicyDriver : PolicyDriver
    
    var match = findMatch(targetLine)
    if (match != null){
      targetPolicyDriver = match.single().getSlice(targetLine.Branch.EditEffectiveDate)
    } else {
      targetPolicyDriver = targetLine.addNewPolicyDriverForContact(sourceContact)      
      //Copy Contact
      targetPolicyDriver.ContactDenorm = targetPolicyDriver.AccountContactRole.AccountContact.Contact
    }
    
    //PolicyDriver Fields
    // Excludes: QuickQuoteNumber, DoNotOrderMVR, PolicyMotorVehicleRecord
    targetPolicyDriver.ApplicableGoodDriverDiscount = Source.ApplicableGoodDriverDiscount
    targetPolicyDriver.Excluded = Source.Excluded
    
    //Copy Account Driver Fields
    //  Excludes: GoodDriverDiscount, DateCompletedTrainingClass, Student, TrainingClassType, 
    //            NumberofAccidents, NumberofViolations
    var targetAcctDriver = targetPolicyDriver.AccountContactRole as Driver
    targetAcctDriver.YearLicensed = sourceDriver.YearLicensed
  }
}
