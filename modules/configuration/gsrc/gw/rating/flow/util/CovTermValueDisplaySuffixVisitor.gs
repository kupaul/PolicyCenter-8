package gw.rating.flow.util

uses gw.api.productmodel.*

/**
 * Return the CovTerm value suffix, based on CovTermPattern subtype.
 * @see CovTermValueVisitor
 */
@Export
class CovTermValueDisplaySuffixVisitor implements CovTermPatternVisitor {
  var _codeSuffix : String
  var _valueSuffix : String
  var _path : String
  var _suffix: String as readonly Suffix

  // Wish we didn't have to pass the codeSuffix and valueSuffix in, but the usages of this
  // visitor are using different display keys (even though they have the same value) so
  // just to be safe, we'll pass the suffixes in
  construct(codeSuffix : String, valueSuffix : String, path : String) {
    _codeSuffix = codeSuffix
    _valueSuffix = valueSuffix
    _path = path
  }

  override function visit(pattern : PackageCovTermPattern) {
    _suffix = _codeSuffix
  }

  override function visit(pattern : OptionCovTermPattern) {
    _suffix = _path.endsWith(".Value") ? _valueSuffix : _codeSuffix
  }

  override function visit(pattern : TypekeyCovTermPattern) {
    _suffix = _valueSuffix
  }

  override function visit(pattern : DirectCovTermPattern) {
    _suffix = _valueSuffix
  }

  override function visit(pattern : GenericCovTermPattern) {
    _suffix = _valueSuffix
  }

}