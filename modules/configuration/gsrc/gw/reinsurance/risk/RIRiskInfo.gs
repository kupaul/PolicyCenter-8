package gw.reinsurance.risk

uses gw.reinsurance.agreement.RIAgreementInfo
uses gw.plugin.reinsurance.IRIRiskInfo

uses java.util.Arrays

/**
 * Structure representing reinsurance risk information for API methods.
 */
@Export
final class RIRiskInfo implements IRIRiskInfo {

  /**
   * risk identifier
   */
  var _riRiskID : String as RIRiskID

  /**
   * Structure representing reinsurance risk information for API methods.
   * Format: "[RICovGroup Name] coverage for [Display name of ReinsurableRisk]"
   */
  var _description : String as Description

  /**
   * Array of structures representing agreements applied to risk
   * does not include attachments that are specifically excluded and proportional agreements with 0% share
   * all non-proportional agreements are included
   */
  var _agreements : RIAgreementInfo[] as Agreements

  construct() {
  }

  override function equals(a : Object) : boolean {
    if (this === a) {
      return true
    }
    if (a typeis RIRiskInfo) {
      if (this.Description == a.Description and
          this.RIRiskID == a.RIRiskID and
          Arrays.equals(this.Agreements, a.Agreements))
        return true
    }
    return false
  }

  override function hashCode() : int {
    var hc = (Description.hashCode() >> 1) ^ RIRiskID.hashCode()
    return Agreements.reduce(hc, \ v, r ->  (v >> 1) ^ r.hashCode())
  }

}