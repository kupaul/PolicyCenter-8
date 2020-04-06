package gw.webservice.pc.pc700.ccintegration.lob
uses gw.webservice.pc.pc700.ccintegration.CCBasePolicyLineMapper
uses java.lang.Integer
uses gw.webservice.pc.pc700.ccintegration.CCPolicyGenerator
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCGeneralLiabilityRU
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCClassCode
uses gw.api.util.Logger
uses java.util.Date

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.lob.CCGLPolicyLineMapper instead")
class CCGLPolicyLineMapper extends CCBasePolicyLineMapper {

  var _glLine : GLLine;
  var _RUCount : Integer;

  construct(line : PolicyLine, policyGen : CCPolicyGenerator) {
    super(line, policyGen);
    _glLine = line as GLLine;
  }

  override function getLineCoverages() : List<entity.Coverage> {
    return _glLine.GLLineCoverages as List<entity.Coverage>
  }

  override function setLineSpecificFields() {
    // Handle claims made vs occurrence mapping
    switch (_glLine.GLCoverageForm.Code) {
      case "ClaimsMade":
        if (extendedReporting()) {
          if (retroactive()) { _ccPolicy.CoverageForm = "ClmsMdRtrExt"; }
          else { _ccPolicy.CoverageForm = "ClmsMdNoRtrExt"; }
          _ccPolicy.ReportingDate = extendedReportingDate();
        } else {  // No extended reporting
          if (retroactive()) { _ccPolicy.CoverageForm = "ClmsMdRtr"; }
          else { _ccPolicy.CoverageForm = "ClmsMdNoRtr"; }
        }
        // Set the retro date for Claims Made policies only
        _ccPolicy.RetroactiveDate = _glLine.RetroactiveDate;
        break;
      case "Occurrence":
        _ccPolicy.CoverageForm = "Occurrence";
        break;
      default:
        Logger.logWarning("CCGLPolicyLineMapper: Unknown GLCoverageForm code encountered: " + _glLine.GLCoverageForm.Code)
    }

  }

  override function createRiskUnits() {
    // Keep a count as we add risk units.  This may start > 0 if other lines have been processed first.
    _RUCount = _ccPolicy.RiskUnits.Count;

    _ccPolicy.TotalProperties += _glLine.Exposures.Count

    // Loop over all the class codes and create CC Risk units for these
    // Sort by location and class code (<Loc #>-<class code> alphabetically)
    for (exp in _glLine.Exposures.sort(\ exp1, exp2 -> GLExpOrdering(exp1, exp2))) {
      if (meetsLocationFilteringCriteria(exp.Location)) {
        var ru = new CCGeneralLiabilityRU();
        _ccPolicy.addToRiskUnits(ru);

        _RUCount = _RUCount + 1;
        ru.RUNumber = _RUCount;
        ru.PolicyLocation = _policyGen.getOrCreateCCLocation(exp.Location);
        ru.ClassCode = getOrCreateCCClassCode(exp.ClassCode);
        ru.Description = trimRUDescription(exp.ClassCode.Code + " - " + exp.ClassCode.Classification);
        ru.PolicySystemID = exp.TypeIDString;

        // There are no risk unit level coverages in GL, so we can skip that common step
      }
    }

  }

  // Function for deciding whether exp1 should be sorted ahead of exp2 so that GL Exposures are created in a standard sort order.
  // Implements a sort by location # first, then by class code.
  private function GLExpOrdering(exp1 : GLExposure, exp2 : GLExposure) : boolean {
    if (exp1.Location.LocationNum == exp2.Location.LocationNum) {
      return (exp1.ClassCode.Code <= exp2.ClassCode.Code)  // if same location number, then sort by class code
    } else {
      return (exp1.Location.LocationNum < exp2.Location.LocationNum)
    }
  }

  private function getOrCreateCCClassCode( pcClassCode : GLClassCode ) : CCClassCode
  {
    if( pcClassCode == null )
    {
      return null
    }
    var ccClassCode = _mappedObjects.get( pcClassCode.ID ) as CCClassCode
    if( ccClassCode != null )
    {
      return ccClassCode
    }
    ccClassCode = new CCClassCode()
    ccClassCode.Code = pcClassCode.Code
    ccClassCode.Description = pcClassCode.Classification

    _ccPolicy.addToClassCodes( ccClassCode )
    return ccClassCode
  }

//  override function handleCovTermSpecialCases(pcCov : Coverage, pcCovTerm : CovTerm, ccCov : CCCoverage, ccCovTerms : CCCovTerm[]) {
//    super.handleCovTermSpecialCases(pcCov, pcCovTerm, ccCov, ccCovTerms);
//  }

  private function extendedReporting() : boolean {
    return _glLine.ClaimsMadeExtendedSpecificRptingExists
  }

  private function extendedReportingDate() : Date {
    // Determine which of the 2 dates to set on the policy.  In most cases, only 1 of these terms would be set
    // for the extended reporting Condition.
    if (_glLine.ClaimsMadeExtendedSpecificRpting.ExtRptAccDateTerm.Value != null) {
      return _glLine.ClaimsMadeExtendedSpecificRpting.ExtRptAccDateTerm.Value
    } else {
      return _glLine.ClaimsMadeExtendedSpecificRpting.ExtRptngProductDateTerm.Value
    }
  }

  private function retroactive() : boolean {
    return ((_glLine.RetroactiveDate != null) and (_glLine.RetroactiveDate < _glLine.Branch.PeriodStart))
  }

}
