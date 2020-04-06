package gw.webservice.pc.pc700.reinsurance

uses gw.plugin.reinsurance.IRIRiskInfo
uses java.util.Arrays

/**
 * External representation of reinsurance risk information for API methods.
 */
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.reinsurance.RIRiskInfo instead")
@gw.xml.ws.annotation.WsiExportable("http://guidewire.com/pc/ws/gw/webservice/pc/pc700/reinsurance/RIRiskInfo")
final class RIRiskInfo implements IRIRiskInfo {

  /**
   * risk identifier
   */
  var _riRiskID : String as RIRiskID

  /**
   * External representation of reinsurance risk information for API methods.
   * Format: "[RICovGroup Name] coverage for [Display name of ReinsurableRisk]"
   */
  var _description : String as Description

  /**
   * list of external representations of agreements applied to risk
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
      if (this.Description.equals(a.Description) and
          this.RIRiskID.equals(a.RIRiskID) and
          Arrays.equals(this.Agreements, a.Agreements))
        return true
    }
    return false
  }

  override function hashCode() : int {
    var hc = (Description.hashCode() >> 1) ^ RIRiskID.hashCode()
    return Agreements.reduce(hc, \ v, r ->  (v >> 1) ^ r.hashCode())
  }

  /**
   * Convert an information structure for a <code>RIRisk</code>
   *    to a version-specific copy.
   */
  static function of(iRiskInfo : IRIRiskInfo) : RIRiskInfo {
    if (iRiskInfo == null) {
      return null
    }
    var riskInfo = iRiskInfo as gw.reinsurance.risk.RIRiskInfo
    var riskData = new RIRiskInfo()

    riskData._riRiskID = riskInfo.RIRiskID
    riskData._description = riskInfo.Description

    riskData._agreements = RIAgreementInfo.of(riskInfo.Agreements)

    return riskData
  }
}