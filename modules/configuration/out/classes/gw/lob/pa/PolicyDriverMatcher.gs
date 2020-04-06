package gw.lob.pa

uses gw.contact.AbstractPolicyContactRoleMatcher

/**
 * Matches {@link PolicyDriver}s based on the properties defined in {@link AbstractPolicyContactRoleMatcher}.
 */
@Export
class PolicyDriverMatcher extends AbstractPolicyContactRoleMatcher<PolicyDriver> {

  construct(driver : PolicyDriver) {
    super(driver)
  }

}
