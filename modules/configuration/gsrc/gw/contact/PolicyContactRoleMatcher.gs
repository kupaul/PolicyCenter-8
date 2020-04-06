package gw.contact

/**
 * Basic concrete implementation of {@link AbstractPolicyContactRoleMatcher} for matching {@link PolicyContactRole}s.
 * This implementation adds no additional columns for matching, and can be used for PolicyContactRoles that
 * can simply match on the AccountContactRole FK.
 */
@Export
class PolicyContactRoleMatcher extends AbstractPolicyContactRoleMatcher<PolicyContactRole> {

  construct(role : PolicyContactRole) {
    super(role)
  }

}
