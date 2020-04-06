package gw.webservice.pc.pc700.ccintegration.lob
uses gw.webservice.pc.pc700.ccintegration.CCBasePolicyLineMapper
uses gw.webservice.pc.pc700.ccintegration.CCPolicyGenerator
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCWCCovEmpRU
uses gw.webservice.pc.pc700.ccintegration.ccentities.CCClassCode
uses java.lang.Integer

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.lob.CCWCPolicyLineMapper instead")
class CCWCPolicyLineMapper extends CCBasePolicyLineMapper {

  var _wcLine : WorkersCompLine;
  var _RUCount : Integer;

  construct(line : PolicyLine, policyGen : CCPolicyGenerator) {
    super(line, policyGen);
    _wcLine = line as WorkersCompLine;
  }

  override function getLineCoverages() : List<entity.Coverage> {
    return _wcLine.WCLineCoverages as List<entity.Coverage>
  }

  override function setLineSpecificFields() {
    _ccPolicy.WCStates = _wcLine.Jurisdictions*.State.sort().join( ", " )
    _ccPolicy.WCOtherStates = _wcLine.WCOtherStatesInsurance.WCIncludedStatesTerm.Value
  }

  override function createRiskUnits() {
    // Keep a count as we add risk units.  This may start > 0 if other lines have been processed first.
    _RUCount = _ccPolicy.RiskUnits.Count;

    // Create all of the class codes
    var coveredEmployees = _wcLine.WCCoveredEmployeeBases
    _ccPolicy.TotalProperties += coveredEmployees.Count
    for( e in coveredEmployees.sort(\ exp1, exp2 -> WCExpOrdering(exp1, exp2)) )
    {
      if (meetsLocationFilteringCriteria(e.Location)) {
        getOrCreateWCCovEmpRU( e )
      }
    }

    // Create a list of all the specifically included or excluded people
    for( inclusionPerson in _wcLine.InclusionPersons )
    {
      var ccPerson = _contactGen.getOrCreatePersonFromInclusionPerson( inclusionPerson )
      if( Inclusion.TC_EXCL == inclusionPerson.Inclusion )
      {
        _ccPolicy.addToExcludedParty( ccPerson )
      }
      else if( Inclusion.TC_INCL == inclusionPerson.Inclusion )
      {
        _ccPolicy.addToCoveredParty( ccPerson )
      }
    }
  }

  // Function for deciding whether exp1 should be sorted ahead of exp2 so that WC class codes are created in a standard sort order.
  // Implements a sort by location # first, then by class code.
  private function WCExpOrdering(exp1 : WCCoveredEmployeeBase, exp2 : WCCoveredEmployeeBase) : boolean {
    if (exp1.Location.LocationNum == exp2.Location.LocationNum) {
      return (exp1.ClassCode.Code <= exp2.ClassCode.Code)  // if same location number, then sort by class code
    } else {
      return (exp1.Location.LocationNum < exp2.Location.LocationNum)
    }
  }

  protected function getOrCreateWCCovEmpRU( coveredEmployee : WCCoveredEmployeeBase ) : CCWCCovEmpRU
  {
    if( coveredEmployee == null )
    {
      return null
    }

    var wcCovEmpRU = _mappedObjects.get( coveredEmployee.ID ) as CCWCCovEmpRU
    if( wcCovEmpRU != null )
    {
      return wcCovEmpRU
    }
    wcCovEmpRU = new CCWCCovEmpRU()
    _mappedObjects.put( coveredEmployee.ID, wcCovEmpRU )

    wcCovEmpRU.PolicyLocation = _policyGen.getOrCreateCCLocation( coveredEmployee.Location )
    _RUCount = _RUCount + 1
    wcCovEmpRU.RUNumber = _RUCount
    wcCovEmpRU.ClassCode = getOrCreateCCClassCode( coveredEmployee.ClassCode )
    wcCovEmpRU.PolicySystemID = coveredEmployee.TypeIDString

    _ccPolicy.addToRiskUnits( wcCovEmpRU )
    return wcCovEmpRU
  }

  protected function getOrCreateCCClassCode( pcClassCode : WCClassCode ) : CCClassCode
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
    ccClassCode.Description = pcClassCode.ShortDesc

    _ccPolicy.addToClassCodes( ccClassCode )
    return ccClassCode
  }

}
