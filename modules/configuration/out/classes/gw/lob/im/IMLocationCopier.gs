package gw.lob.im
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class IMLocationCopier extends AbstractEffDatedCopyable<IMLocation> {

  construct(loc : IMLocation) {
    super(loc)
  }

  override function copyBasicFieldsFromBean(p0 : IMLocation) {
    //nothing to do
  }

}
