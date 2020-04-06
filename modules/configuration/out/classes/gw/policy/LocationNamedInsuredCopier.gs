package gw.policy
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class LocationNamedInsuredCopier extends AbstractEffDatedCopyable<LocationNamedInsured> {

  construct(locNamedInsured : LocationNamedInsured) {
    super(locNamedInsured)
  }

  override function copyBasicFieldsFromBean(p0 : LocationNamedInsured) {
    //nothing to do
  }

}
