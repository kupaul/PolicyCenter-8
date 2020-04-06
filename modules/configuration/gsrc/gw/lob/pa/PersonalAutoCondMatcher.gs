package gw.lob.pa

uses gw.entity.ILinkPropertyInfo
uses gw.lob.common.AbstractConditionMatcher

@Export
class PersonalAutoCondMatcher extends AbstractConditionMatcher<PersonalAutoCond>{

  construct(owner : PersonalAutoCond) {
    super(owner)
  }

  override property get Parent() : ILinkPropertyInfo {
    return PersonalAutoCond.Type.TypeInfo.getProperty("PALine") as ILinkPropertyInfo
  }

}
