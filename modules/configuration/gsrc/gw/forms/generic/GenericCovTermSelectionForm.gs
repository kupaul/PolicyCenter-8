package gw.forms.generic

uses gw.admin.FormPatternValidation
uses gw.api.domain.covterm.BooleanCovTerm
uses gw.api.productmodel. *
uses gw.api.util.StringUtil
uses gw.entity.TypeKey
uses gw.forms.FormData
uses gw.forms.FormInferenceContext
uses gw.forms.GenericFormInference
uses gw.xml.XMLNode

uses java.util. *

/**
 * Generic class that can be used for any form that should be added to a policy whenever the
 * specified covterm value is selected.
 */
@Export
class GenericCovTermSelectionForm extends FormData implements GenericFormInference {
  var _clausePattern : ClausePattern
  var _selectedCovTerm : CovTermPattern
  var _selectedCovTermValues :  List<String>
  var _coverables : Coverable[]
  var _line : PolicyLine

  override property get DisplayName() : String {
    return displaykey.Forms.Generic.GenericCovTermSelectionForm
  }

/**
 * Returns the reference date of coverable's related clause.
 * The lookup date for the form should be the earliest reference date of the clauses that have one of the selected covterm values.
 */
  override function getLookupDates(context : FormInferenceContext) : Map<Jurisdiction, DateTime> {
    _line = getLine(context)
    if(_line == null) {
      return Collections.emptyMap()
    }
    _clausePattern = ClausePatternLookup.getByCode(Pattern.ClausePatternCode)
    _selectedCovTerm = Pattern.SelectedCovTerm
    _selectedCovTermValues =  _selectedCovTerm == null ? null : Pattern.FormPatternCovTerms[0].SelectedCovTermValues.map(\ v  -> v.Code).toList()
    var map = new HashMap<Jurisdiction, DateTime>()
    _coverables = _line.AllCoverables.where(\ cov -> inferredByCoverable(cov))
    for(cov in _coverables) {
      var clause = cov.getCoverageConditionOrExclusion(_clausePattern)
      if (clause.Pattern.OwningEntityType == _line.Pattern.PolicyLineSubtype as String) {
        for ( coveredState in _line.CoveredStates) {
          map.put(coveredState, getEarliestDate(map.get(coveredState), clause.ReferenceDate))
        }
      } else {
        map.put(cov.CoverableState, getEarliestDate(map.get(cov.CoverableState), clause.ReferenceDate))
      }
    }
    return map
  }

  override function populateInferenceData(context : FormInferenceContext, availableStates : Set<Jurisdiction>) {
    for(cov in _coverables) {
      var clause = cov.getCoverageConditionOrExclusion(_clausePattern)
      if (clause.Pattern.OwningEntityType == _line.Pattern.PolicyLineSubtype as String) {
        _coverables = _coverables.where(\ c -> availableStates.intersect(_line.CoveredStates.toSet()) != null)
      } else {
        _coverables = _coverables.where(\ c -> availableStates.contains(c.CoverableState))
      }
    }
  }

 /**
  * If the selected covterm is an option, package, or typekey covterm, then any one of the specific option, package, or typekey values must be chosen on the specified covterm on the policy.
  * If the selected covterm is a generic boolean covterm, then a value of true must be chosen on the specified covterm on the policy.
  * If the selected covterm is any other covterm type, then the covterm must just be selected (non-null) on the coverage and the specific value does not matter.
  * If the selected covterm is an option/package/typekey covterm, but the user did not select any option/package/typekey values within the formpattern, then the covterm must just be selected on the coverage and the specific value does not matter.
  * If the "exists on all" boolean is true, then then the above condition(s) must be met on all instances of the selected coverage on the policy.
  * If the "exists on all" boolean is false, then the above condition(s) need only be met on one instance of the selected coverage on the policy.
  */
  override property get InferredByCurrentData() : boolean {
    if(Pattern.PatternExistsOnAll) { //Covterm must exist on all existing coverages of the given type
      var existingCoverableType = typeof _coverables.first()
      var doesNotHaveClause = _line.AllCoverables.where(\ cov -> typeof cov == existingCoverableType and cov.getCoverageConditionOrExclusion(_clausePattern) != null)
                                                 .firstWhere(\ cov -> not inferredByCoverable(cov))
      return doesNotHaveClause != null? false : true

    } else {
      return _coverables.hasMatch(\ cov -> inferredByCoverable(cov))
    }
  }

  function inferredByCoverable(cov : Coverable) : boolean {
    var existingClause = cov.getCoverageConditionOrExclusion(_clausePattern)
    if (existingClause == null) {
      return false
    }
    var existingCovTerm = existingClause.getCovTerm(_selectedCovTerm)
    if (existingCovTerm == null || existingCovTerm.ValueAsString == null || existingCovTerm.ValueAsString == "") {
      return false
    }
    if (isACovTermTypeRequiringAValue(_selectedCovTerm)) {
      if (_selectedCovTermValues != null and _selectedCovTermValues.Count  > 0  //values were selected
         and not _selectedCovTermValues.contains(existingCovTerm.ValueAsString)) {
        return false
      }
    } else if (_selectedCovTerm typeis GenericCovTermPattern and _selectedCovTerm.PropertyType == BooleanCovTerm) {
      return (existingCovTerm as BooleanCovTerm).Value
    }
    return true
  }

  private function isACovTermTypeRequiringAValue(covTermPattern : CovTermPattern) : boolean {
    return (covTermPattern typeis OptionCovTermPattern)
        or (covTermPattern typeis PackageCovTermPattern)
        or (covTermPattern typeis TypekeyCovTermPattern)
  }

  override function addDataForComparisonOrExport(contentNode : XMLNode) {
    //Add the coverables on which the clause exists
    var allCoverableNode = new XMLNode("Coverables")
    contentNode.addChild(allCoverableNode)

    for (cov in _coverables) { //for each coverable that satisfies inference conditions
      var clause = cov.getCoverageConditionOrExclusion(_clausePattern)
      // Add the coverable and the clause pattern
      var coverableNode = new XMLNode("Coverable")
      allCoverableNode.addChild(coverableNode)
      coverableNode.addChild(createTextNode("FixedId", cov.TypeIDString))
      coverableNode.addChild(createTextNode("ClausePattern", _clausePattern.Code))

      var covTermNode = new XMLNode("CovTerm")
      coverableNode.addChild(covTermNode)
      covTermNode.addChild(createTextNode("CovTermPattern",Pattern.FormPatternCovTerms[0].CovTermPatternCode))

      for (formPatternCoverableProp in Pattern.FormPatternCoverableProperties) {
        var coverablePropNode = new XMLNode("CoverableProperty")
        coverableNode.addChild(coverablePropNode)
        var coverablePropValue = cov[formPatternCoverableProp.Name]
        coverablePropNode.addChild(createTextNode("CoverablePropertyName", formPatternCoverableProp.Name))
        if (coverablePropValue != null) {
          if (coverablePropValue typeis Date) {
            coverablePropNode.addChild(createTextNode("CoverablePropertyValue", formatDateTime(coverablePropValue)))
          } else if (coverablePropValue typeis TypeKey) {
            coverablePropNode.addChild(createTextNode("CoverablePropertyValue", coverablePropValue.Code))
          } else {
            coverablePropNode.addChild(createTextNode("CoverablePropertyValue", coverablePropValue.toString()))
          }
        }
      }
    }
  }

  function formatDateTime(date : Date) : String {
    return StringUtil.formatDate(date, "yyyy-MM-dd HH:mm:ss.SSS")
  }

  override property get ValidPolicylines() : List<PolicyLinePattern> {
    return PolicyLinePatternLookup.getAll()
  }

  function getEarliestDate(d1 : Date, d2 : Date) : Date {
    if(d1 == null) {
      return d2
    } else if(d2 == null) {
      return d1
    } else if(d2.before(d1)) {
      return d2
    } else {
      return d1
    }
  }

  override property get PolicyLineRequired() : boolean {
    return true
  }

  override function validateCustomFields(formPattern : FormPattern, validation : FormPatternValidation) {
  }

  override function clearCustomFields(formPattern : FormPattern) {
    formPattern.ClausePattern = null
    formPattern.PatternExistsOnAll = false
    formPattern.clearDependentClausePatternSelections()
  }

}
