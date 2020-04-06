package gw.admin
uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext
uses java.util.ArrayList
uses gw.api.database.Query

@Export
class PolicyHoldValidation extends PCValidationBase {
  
  var _policyHold : PolicyHold

  construct(valContext : PCValidationContext, policyHold : PolicyHold) {
    super(valContext)
    _policyHold = policyHold
  }

  override protected function validateImpl() {
    Context.addToVisited(this, "validateImpl")
    atLeastOneHoldRulePerHold()
    noDuplicateHoldRules()
    noSpacesInPolicyHoldCode()
    policyHoldCodeUnique()
  }
  
  function atLeastOneHoldRulePerHold(){
    Context.addToVisited(this, "atLeastOneHoldRulePerHold") 
    if(_policyHold.Rules.IsEmpty){
      Result.addError(_policyHold,"default", displaykey.Validation.PolicyHold.EmptyHoldRules)
    }
  }
  
  function noDuplicateHoldRules(){
    Context.addToVisited(this, "noDuplicateHoldRules")
    
    var ruleList = new ArrayList<PolicyHoldRule>(_policyHold.Rules.toList())
      
    for(rule in _policyHold.Rules){
      var oldCount = ruleList.Count
      ruleList.removeWhere(\ p -> p.PolicyLineType == rule.PolicyLineType and 
                                      p.JobDateType == rule.JobDateType and 
                                      p.JobType == rule.JobType and
                                      p.CovPatternCode == rule.CovPatternCode)

      if(ruleList.Count < oldCount - 1){
        Result.addError(_policyHold, "default", displaykey.Validation.PolicyHold.DuplicateHoldRuleFound)
      }
    }
  }

  function noSpacesInPolicyHoldCode() {
    Context.addToVisited(this, "noSpacesInPolicyHoldCode")
    if (_policyHold.PolicyHoldCode == null) {
      return
    }
    if (_policyHold.PolicyHoldCode.matches(".*\\s+.*")) {
      Result.addError(_policyHold, "default", displaykey.Validation.PolicyHold.CodeHasSpaces(_policyHold.PolicyHoldCode))
    }
  }

  function policyHoldCodeUnique() {
    Context.addToVisited(this, "policyHoldUnique")
    var q = Query.make(PolicyHold)
    q.compare("PolicyHoldCode", Equals, _policyHold.PolicyHoldCode)
    for (var f in q.select()) {
      if (f.ID != _policyHold.ID) {
        Result.addError(_policyHold, "default", displaykey.Validation.PolicyHold.CodeInUse(_policyHold.PolicyHoldCode))
        return
      }
    }
  }

  function newHoldRegionUnique(region : PolicyHoldZone) {
    Context.addToVisited(this, "newHoldRegionUnique")
    if (_policyHold.PolicyHoldZones.hasMatch(\ p -> p.Country.equals(region.Country) and
                                                    p.ZoneType.equals(region.ZoneType) and
                                                    p.Code.equals(region.Code))) {
      Result.addError(region, "default", displaykey.Validation.PolicyHold.RegionCodeInUse(region.ZoneType, region.Code))
    }
  }
      
  static function validatePolicyHold(policyHold : PolicyHold) {
    PCValidationContext.doPageLevelValidation(\ context -> {
      var validation = new PolicyHoldValidation(context, policyHold)
      validation.validate()
    })
  }
  
  static function validatePolicyHoldRegion(policyHold : PolicyHold, region : PolicyHoldZone) {
    PCValidationContext.doPageLevelValidation(\ context -> {
      var validation = new PolicyHoldValidation(context, policyHold)
      validation.newHoldRegionUnique(region)
    })
  }
}


