package gw.pcf.coverage

uses com.guidewire.pl.system.util.NumberFormatUtil
uses gw.api.domain.covterm.DirectCovTerm

uses java.lang.Double

@Export
class CovTermDirectInputSetHelper {

  public static function validate(covTerm : DirectCovTerm): String {
    if (covTerm == null) {
      return displaykey.Java.Validation.NonNullable(new Object[]{"Term"})
    } else {
      return covTerm.validateValueInRange(covTerm.Value);
    }
  }

  public static function convertFromString(value: String): Object {
    return NumberFormatUtil.parse(value)
  }

  public static function convertToString(value: Object): String {
    return NumberFormatUtil.render(value as Number)
  }
}
