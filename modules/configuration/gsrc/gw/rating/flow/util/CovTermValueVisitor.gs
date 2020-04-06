package gw.rating.flow.util

uses gw.api.productmodel.*
uses gw.api.domain.covterm.*
uses gw.lang.reflect.IType

/**
 * Returns details about the CovTerm's value, based on the CovTermPattern subtype.
 */
@Export
class CovTermValueVisitor implements CovTermPatternVisitor {
  /**
   * The bean path to the CovTerm's primitive value.
   */
  var _beanPath : String as readonly BeanPath

  var _getValueAsStringBlock : block(covTerm : CovTerm) : String

  /**
   * The IType of the CovTerm's value.
   */
  var _type: IType as readonly Type

  override function visit(pattern : PackageCovTermPattern) {
    _beanPath = "${pattern.Code}Term.PackageValue.PackageCode"
    _getValueAsStringBlock = \ covTerm : CovTerm -> (covTerm as PackageCovTerm).PackageValue.PackageCode
    _type = CovTermPack
  }

  override function visit(pattern : OptionCovTermPattern) {
    _beanPath = "${pattern.Code}Term.OptionValue.OptionCode"
    _getValueAsStringBlock = \ covTerm : CovTerm ->(covTerm as OptionCovTerm).OptionValue.OptionCode
    _type = java.lang.String
  }

  override function visit(pattern : TypekeyCovTermPattern) {
    _beanPath = "${pattern.Code}Term.Value.Code"
    _getValueAsStringBlock = \ covTerm : CovTerm ->(covTerm as TypekeyCovTerm).Value.Code
    _type = pattern.TypeList
  }

  override function visit(pattern : DirectCovTermPattern) {
    _beanPath = "${pattern.Code}Term.Value"
    _getValueAsStringBlock = \ covTerm : CovTerm ->(covTerm as DirectCovTerm).ValueAsString
    _type = java.math.BigDecimal
  }

  override function visit(pattern : GenericCovTermPattern) {
    _beanPath = "${pattern.Code}Term.Value"
    _getValueAsStringBlock = \ covTerm : CovTerm ->(covTerm as GenericCovTerm).Value.toString()
    _type = pattern.CoverageColumnProperty.FeatureType
  }

  /**
   * Return the covTerm value as a string.
   */
  function getValueAsString(covTerm : CovTerm) : String {
    return _getValueAsStringBlock(covTerm)
  }

}