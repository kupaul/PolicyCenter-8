package gw.api.databuilder

uses java.util.Date
uses gw.api.databuilder.wc.WCSubmissionBuilder

@Export
public class PolicyExceptionBuilder extends DataBuilder<PolicyException, PolicyExceptionBuilder> {  
  construct() {
    super(PolicyException)
    withPolicyPeriod(new WCSubmissionBuilder().issuePolicy().create())
    withExCheckTime(Date.Today)
  }

  final function withPolicyPeriod(period : PolicyPeriod) : PolicyExceptionBuilder {
    set(PolicyException.Type.TypeInfo.getProperty("PolicyPeriod"), period)
    return this
  }

  final function withExCheckTime(time : Date) : PolicyExceptionBuilder {
    set(PolicyException.Type.TypeInfo.getProperty("ExCheckTime"), time)
    return this
  }
}