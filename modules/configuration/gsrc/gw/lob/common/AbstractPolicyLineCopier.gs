package gw.lob.common
uses gw.api.copier.AbstractEffDatedCopyable


@Export
abstract class AbstractPolicyLineCopier<T extends PolicyLine> extends AbstractEffDatedCopyable<T> {

  construct(line : T) {
    super(line)
  }

  override function copyBasicFieldsFromBean(line : T) {
    copyLineSpecificFields(line)
  }
  
  protected function copyLineSpecificFields(line : T) {
    // nothing to do by default
  }

}
