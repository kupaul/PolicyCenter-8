package gw.webservice.pc.pc700.reinsurance

uses gw.api.productmodel.ClausePatternLookup
uses gw.api.util.Logger
uses gw.api.webservice.exception.BadIdentifierException
uses gw.api.webservice.exception.FieldConversionException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.api.webservice.exception.SOAPException
uses gw.lang.reflect.TypeSystem
uses gw.plugin.Plugins
uses gw.plugin.reinsurance.IReinsurancePlugin
uses gw.webservice.SOAPUtil

uses java.lang.Exception
uses java.util.Date

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.reinsurance.RICoverageAPI instead")
@gw.xml.ws.annotation.WsiWebService("http://guidewire.com/pc/ws/gw/webservice/pc/pc700/reinsurance/RICoverageAPI" )
class RICoverageAPI {

  construct() {
  }

  /**
   * Reinsurance API.
   *
   * @param policyNumber the number of the policy
   * @param coverableID public ID of coverable
   * @param coverageCode coverage code for coverage pattern associated with coverableID
   * @param date the date to check what reinsurance information is applicable
   *
   * @return RIRiskInfo which contains RIRisk ID & Description + array of attachments if found, else returns null
   * Description: "[RICovGroup Name] coverage for [Display name of ReinsurableRisk]" which looks something like "Property coverage for Location 1" or "Auto liability coverage for Personal Auto line".
   * Exclude any agreement that is specifically excluded and any prop agreement with 0% share. Do send all non-prop.
   *
   * For each agreement, include the following fields:
   * Agreement # - agreement number
   * Name - agreement name
   * Type (Quota share, Surplus, etc.)
   * Share % - For proportional agreements, share % is the proporational percentage of the risk that the attachment takes
   *           For non proportional agreements, share % is the ceded share percentage of the attachment
   * Attachment point & Top of layer (Limit) & whether each of these is indexed [for non-prop only]
   * Recovery Limit - For proportional agreements, the risk amount ceded to the attachment is used
   *                  For non proportional agreements, send the Amount of Reinsurance specified by the agreement is used.
   * Notification threshold - notification threshold on agreement for per risk agreements
   * Effective and Expiration dates for the agreement (If cancellation date is not null, then send cancellation date rather than exp date)
   * Draft (Boolean) - For treaties, true if the RI program that the agreement is part of is not yet active.
   *                   For facultative agreements, true if the facultative agreement is not yet active
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If policyNumber, coverableID, coverageCode, or date is not set")
  @Throws(FieldConversionException, "If there is no coverage pattern with the given coverageCode")
  @Throws(BadIdentifierException, "If there is no Coverable with the given coverableID")
  public function findRIRiskByCoverableID(policyNumber : String, coverableID : String, coverageCode : String, date : Date) : RIRiskInfo {
    SOAPUtil.require(policyNumber, "Policy Number")
    SOAPUtil.require(coverableID, "Coverable ID")
    SOAPUtil.require(coverageCode, "Coverage Code")
    SOAPUtil.require(date, "As of Date")

    var covPattern = ClausePatternLookup.getCoveragePatternByCode(coverageCode)
    SOAPUtil.notNull(covPattern, displaykey.ReinsuranceAPI.Error.InvalidCoverageCode)
    var riCovGroup = covPattern.RICoverageGroupType

    var period = Policy.finder.findPolicyPeriodByPolicyNumberAndAsOfDate(policyNumber, date)
    SOAPUtil.notNull(period, displaykey.ReinsuranceAPI.Error.CannotFindPolicyPeriod(policyNumber, date.Time))
    var coverableType = TypeSystem.getByFullName("entity." + covPattern.OwningEntityType)

    var coverable : Coverable
    try {
      coverable = period.AllCoverables.singleWhere(\ c -> c.TypeIDString == coverableID and coverableType.isAssignableFrom(typeof c))
    } catch (e : Exception) {
      var message = displaykey.Webservice.Error.CannotFindEntity("Coverable", coverableID)
      Logger.logError(message, e)
      throw new BadIdentifierException(message)
    }

    var coverage = coverable.getCoverage(covPattern)
    var risks = coverage.ReinsurableCoverable.Reinsurables

    var plugin = Plugins.get(IReinsurancePlugin)
    return RIRiskInfo.of(plugin.findReinsuranceRiskInfo(risks, riCovGroup, date))
  }


  /**
   * Reinsurance API for line level RIRisk.
   *
   * @param policyNumber the number of the policy
   * @param coverageCode coverage code for coverage pattern associated with coverableID
   * @param date the date to check what reinsurance information is applicable
   *
   * @return RIRiskInfo which contains RIRisk ID & Description + array of attachments if found, else returns null
   * Description: "[RICovGroup Name] coverage for [Display name of ReinsurableRisk]" which looks something like "Property coverage for Location 1" or "Auto liability coverage for Personal Auto line".
   * Exclude any agreement that is specifically excluded and any prop agreement with 0% share. Do send all non-prop.
   *
   * For each agreement, include the following fields:
   * Agreement # - agreement number
   * Name - agreement name
   * Type (Quota share, Surplus, etc.)
   * Share % - For proportional agreements, share % is the proporational percentage of the risk that the attachment takes
   *           For non proportional agreements, share % is the ceded share percentage of the attachment
   * Attachment point & Top of layer (Limit) & whether each of these is indexed [for non-prop only]
   * Recovery Limit - For proportional agreements, the risk amount ceded to the attachment is used
   *                  For non proportional agreements, send the Amount of Reinsurance specified by the agreement is used.
   * Notification threshold - notification threshold on agreement for per risk agreements
   * Effective and Expiration dates for the agreement (If cancellation date is not null, then send cancellation date rather than exp date)
   * Draft (Boolean) - For treaties, true if the RI program that the agreement is part of is not yet active.
   *                   For facultative agreements, true if the facultative agreement is not yet active
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  @Throws(FieldConversionException, "If there is no coverage pattern with the given coverageCode")
  public function findRIPolicyRisk(policyNumber : String, coverageCode : String, date : Date) : RIRiskInfo {
    SOAPUtil.require(policyNumber, "Policy Number")
    SOAPUtil.require(coverageCode, "Coverage Code")
    SOAPUtil.require(date, "As of Date")

    var covPattern = ClausePatternLookup.getCoveragePatternByCode(coverageCode)
    SOAPUtil.notNull(covPattern, displaykey.ReinsuranceAPI.Error.InvalidCoverageCode)
    var riCovGroup = covPattern.RICoverageGroupType

    var period = Policy.finder.findPolicyPeriodByPolicyNumberAndAsOfDate(policyNumber, date)
    SOAPUtil.notNull(period, displaykey.ReinsuranceAPI.Error.CannotFindPolicyPeriod(policyNumber, date.Time))
    var plugin = Plugins.get(IReinsurancePlugin)
    return RIRiskInfo.of(plugin.findReinsuranceRiskInfo(period.PolicyRisks, riCovGroup, date))
  }

}