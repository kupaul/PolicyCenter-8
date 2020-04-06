package gw.pcf.policyfile

/**
 * Helper code to PolicyFileForward.pcf
 */
@Export
class PolicyFileForwardHelper {
  static function validate(period: PolicyPeriod, policyNumber: String) : String{
    if (policyNumber == null && period == null)
      return displaykey.Web.Errors.MissingUrlParameter("PolicyNumber")
    if (period == null)
      return displaykey.Web.Errors.InvalidUrlParameter("PolicyNumber", policyNumber)
    if (not User.util.CurrentUser.canView(period))
      return displaykey.Java.Error.Permission.View("policy")
    return null
  }
}