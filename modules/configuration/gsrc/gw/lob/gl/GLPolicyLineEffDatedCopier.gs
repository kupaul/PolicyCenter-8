package gw.lob.gl
uses gw.lob.common.AbstractPolicyLineCopier

@Export
class GLPolicyLineEffDatedCopier extends AbstractPolicyLineCopier<GLLine> {

  construct(line : GLLine) {
    super(line)
  }
  
  override protected function copyLineSpecificFields(line : GLLine) {
    _bean.LocationLimits = line.LocationLimits
    _bean.PollutionCleanupExp = line.PollutionCleanupExp
    _bean.ClaimsMadeOrigEffDate = line.ClaimsMadeOrigEffDate
    _bean.RetroactiveDate = line.RetroactiveDate
    _bean.SplitLimits = line.SplitLimits
  }

}
