package gw.reinsurance.agreement

uses gw.pl.currency.MonetaryAmount
uses gw.reinsurance.NullSafeMath

uses java.math.BigDecimal

enhancement SurplusRITreatyEnhancement : entity.SurplusRITreaty {

  property get LinesOfCoverage() : BigDecimal {
    return nsDiv(nsSub(this.CoverageLimit, this.AttachmentPoint), this.MaxRetention)
  }

  property get StartLine() : BigDecimal {
    return nsDiv(this.AttachmentPoint, this.MaxRetention)
  }

  property get StopLine() : BigDecimal {
    return nsDiv(this.CoverageLimit, this.MaxRetention)
  }

  function setDefaultMaxRetention() {
    if (this.MaxRetention == null) {
      this.MaxRetention = this.AttachmentPoint
    }
  }

  function setDefaultAttachmentPoint() {
    if (this.AttachmentPoint == null) {
      this.AttachmentPoint = this.MaxRetention
    }
  }

  static function nsSub(arg1 : MonetaryAmount, arg2 : MonetaryAmount) : BigDecimal {
    return NullSafeMath.nsSub(arg1, arg2)
  }

  static function nsDiv(arg1 : BigDecimal, arg2 : BigDecimal) : BigDecimal {
    return NullSafeMath.nsDiv(arg1, arg2)
  }

}
