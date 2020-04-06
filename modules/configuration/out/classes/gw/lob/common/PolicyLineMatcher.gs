package gw.lob.common

/**
 * Concrete implementation of {@link AbstractPolicyLineMatcher} that utilizes default behavior of
 * matching based on the PatternCode of the line.
 */
@Export
class PolicyLineMatcher extends AbstractPolicyLineMatcher<PolicyLine> {

  construct(line : PolicyLine) {
    super(line)
  }

}
