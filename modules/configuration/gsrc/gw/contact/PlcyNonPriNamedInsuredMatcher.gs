package gw.contact

/**
 * Concrete implementation of {@link AbstractPolicyContactRoleMatcher} for {@link PlcyNonPriNamedInsured}s.
 * PlcyNonPriNamedInsuredMatcher can match directly on the AccountContactRole FK, so this does not specify
 * any additional fields to match on.
 */
@Export
class PlcyNonPriNamedInsuredMatcher extends AbstractPolicyContactRoleMatcher<PlcyNonPriNamedInsured> {

  construct(role : PlcyNonPriNamedInsured) {
    super(role)
  }

}
