package gw.policy

uses gw.api.logicalmatch.AbstractEffDatedPropertiesMatcher
uses gw.entity.IEntityPropertyInfo

uses java.lang.Iterable

/**
 * Matches {@link UWIssue}s based on the IssueType and IssueKey properties.
 */
@Export
class UWIssueMatcher extends AbstractEffDatedPropertiesMatcher<UWIssue> {

  construct(uwIssue : UWIssue) {
    super(uwIssue)
  }

  override property get IdentityColumns() : Iterable<IEntityPropertyInfo> {
    return {UWIssue.Type.TypeInfo.getProperty("IssueType") as IEntityPropertyInfo,
            UWIssue.Type.TypeInfo.getProperty("IssueKey") as IEntityPropertyInfo  }
  }

}
