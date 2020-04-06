package gw.lob.im
uses gw.api.copier.AbstractEffDatedCopyable

@Export
class IMCoveragePartCopier extends AbstractEffDatedCopyable<IMCoveragePart> {

  construct(part : IMCoveragePart) {
    super(part)
  }

  override function copyBasicFieldsFromBean(p0 : IMCoveragePart) {
    //nothing to do
  }

}
