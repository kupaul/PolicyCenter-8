package gw.plugin.policy.impl

uses gw.plugin.policynumgen.IPolicyNumGenPlugin
uses java.lang.Math
uses java.lang.Integer
uses java.lang.StringBuilder


@Export
class PolicyNumGenPlugin implements IPolicyNumGenPlugin {

  override function genNewPeriodPolicyNumber( policyPeriod: PolicyPeriod ) : String {
    if (policyPeriod.Status == PolicyPeriodStatus.TC_LEGACYCONVERSION) {
      return randomPolicyNumber()
    }
    var job = policyPeriod.Job
    if (job == null) throw "Cannot have null job"

    if (job typeis Submission or job typeis Rewrite or job typeis RewriteNewAccount) {
      return randomPolicyNumber()
    } else {
      return policyPeriod.PolicyNumber
    }
  }

  private function randomPolicyNumber(): String {
    var policyNumber = new StringBuilder()
    for (i in 0..9) {
      var digit = -1
      while (digit < 0 or digit > 9) {
        digit = (Math.random() * 11) as int
      }
      policyNumber.append(digit)
    }
    return policyNumber.toString()
  }

  private function constructNextPolicyNumber(sInitialPolicyNum: String, moduleNumber: Integer) : String {
    if (moduleNumber == null) {
      moduleNumber = 0
    }
    var sReturnVal = sInitialPolicyNum
    if (sReturnVal.endsWith("-CORE")) {
      // strip trailing "-CORE" from policy number
      sReturnVal = sReturnVal.substring(0, sReturnVal.lastIndexOf("-CORE"))
    }
    //the policy number may already have a module number on it, perf actions depend on this behavior
    var lastDashIndex = sReturnVal.lastIndexOf("-")
    if (lastDashIndex >= 0 and lastDashIndex == sReturnVal.length()-3) {
      sReturnVal = sReturnVal.substring(0,lastDashIndex)
    }
    sReturnVal = sReturnVal + "-"
    if (moduleNumber < 10) {
      sReturnVal = sReturnVal + "0" // pad Module # to 2 digits
    }
    sReturnVal = sReturnVal + moduleNumber
    return sReturnVal
  }

}
