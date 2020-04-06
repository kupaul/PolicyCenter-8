package gw.webservice.pc.pc700.reinsurance

uses java.math.BigDecimal
uses java.util.Date

/**
 * External representation of reinsurance agreement information associated with risk for API methods.
 */
@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.reinsurance.RIAgreementInfo instead")
@gw.xml.ws.annotation.WsiExportable("http://guidewire.com/pc/ws/gw/webservice/pc/pc700/reinsurance/RIAgreementInfo")
final class RIAgreementInfo {

 /**
   * agreement number
   */
  var _agreementNumber : String as AgreementNumber

  /**
   * agreement name
   */
  var _name : String as Name

  /**
   * agreement type (Quota share, Surplus, etc.)
   */
  var _subtype : typekey.RIAgreement as Type

  /**
   * Share %
   */
  var _cededShare : BigDecimal as CededShare

  /**
   * percentage of ceded amount among proportional agreements (null where not applicable)
   */
  var _propPercentage : BigDecimal as ProportionalPercentage

  /**
   * agreement attachment point
   */
  var _attachmentPoint : BigDecimal as AttachmentPoint

  /**
   * agreement coverage limit
   */
  var _coverageLimit : BigDecimal as TopOfLayer

  /**
   * true when attachment point is indexed
   */
  var _attachmentPointIndexed : Boolean as AttachmentPointIndexed

  /**
   * true when coverage limit is indexed
   */
  var _coverageLimitIndexed : Boolean as TopOfLayerIndexed

  /**
   * Amount ceded to agreement - For prop agreements, send ceded amount. For other types, send the Amount of Reinsurance field.
   */
  var _amountOfCoverage : BigDecimal as RecoveryLimit

  /**
   * agreement notification threshold
   */
  var _notificationThreshold : BigDecimal as NotificationThreshold

  /**
   * agreement effective date
   */
  var _effectiveDate : Date as EffectiveDate

  /**
   * agreement expiration date, returns cancelation date if cancelation date is not null
   */
  var _expirationDate : Date as ExpirationDate

  /**
   * true if the RI program that the agreement is part of is not yet active
   */
  var _draft : Boolean as Draft

  /**
   * comment lines associated with each agreement
   */
  var _comment : String as Comments

  construct() {
  }

  override function equals(a : Object) : boolean {
    if (this === a) {
      return true
    }
    if (a typeis RIAgreementInfo) {
      if (this.AgreementNumber.equals(a.AgreementNumber) and
          this.Name == a.Name and
          this.Type == a.Type and
          this.ProportionalPercentage == a.ProportionalPercentage and
          this.CededShare == a.CededShare and
          this.AttachmentPoint == a.AttachmentPoint and
          this.TopOfLayer == a.TopOfLayer and
          this.AttachmentPointIndexed == a.AttachmentPointIndexed and
          this.TopOfLayerIndexed == a.TopOfLayerIndexed and
          this.RecoveryLimit == a.RecoveryLimit and
          this.NotificationThreshold == a.NotificationThreshold and
          this.EffectiveDate == a.EffectiveDate and
          this.ExpirationDate == a.ExpirationDate and
          this.Draft == a.Draft and
          this.Comments == a.Comments) {
        return true
      }
    }
    return false
  }

  override function hashCode() : int {
     var code = (hashCode(this.AgreementNumber) >> 1)
           ^ (hashCode(this.Name) >> 2)
           ^ (this.Type.hashCode() >> 3)
           ^ (hashCode(this.ProportionalPercentage) >> 4)
           ^ (hashCode(this.AttachmentPoint) >> 5)
           ^ (hashCode(this.TopOfLayer) >> 6)
           ^ (hashCode(this.NotificationThreshold) >> 7)
           ^ (this.EffectiveDate.hashCode() >> 8)
           ^ (this.ExpirationDate.hashCode() >> 9)
           ^ (hashCode(this.CededShare) >> 10)
           ^ (hashCode(this.AttachmentPointIndexed) << 1)  // true ? 1231 : 1237 is the
           ^ (hashCode(this.TopOfLayerIndexed) << 2)       // value of hashCode() on
           ^ (hashCode(this.Draft) << 3)                   // java.lang.Boolean.  For some
                                                                 // reason, gosu doesn't see it....
     return code
   }

  private function hashCode(o : Object) : int{
    if (o typeis Boolean) {
      return o == null ? 0 : (o ? 1231 : 1237)
    } else {
      return o == null ? 0 : o.hashCode()
    }
  }

  /**
   * Convert an array of information structures of <code>RIAgreements</code>
   *    to an array of exportable versions.
   */
  static function of(agreements : gw.reinsurance.agreement.RIAgreementInfo[]) : RIAgreementInfo[] {
    var convertedAgreements = new RIAgreementInfo[agreements.Count]

    for (info in agreements index i) {
      var convertedInfo = new RIAgreementInfo()

      convertedInfo._agreementNumber = info.AgreementNumber
      convertedInfo._name = info.Name
      convertedInfo._subtype = info.Type
      convertedInfo._attachmentPoint = info.AttachmentPoint?.Amount
      convertedInfo._coverageLimit = info.TopOfLayer?.Amount
      convertedInfo._effectiveDate = info.EffectiveDate
      convertedInfo._expirationDate = info.ExpirationDate
      convertedInfo._comment = info.Comments
      convertedInfo._cededShare = info.CededShare

      convertedInfo._attachmentPointIndexed = info.AttachmentPointIndexed
      convertedInfo._coverageLimitIndexed = info.TopOfLayerIndexed
      convertedInfo._amountOfCoverage = info.RecoveryLimit?.Amount
      convertedInfo._propPercentage = info.ProportionalPercentage

      convertedInfo._notificationThreshold = info.NotificationThreshold?.Amount

      convertedInfo._draft = info.Draft

      convertedAgreements[i] = convertedInfo
    }
    return convertedAgreements
  }
}