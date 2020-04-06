package gw.lob.im.contractorsequip
uses gw.validation.PCValidationContext
uses gw.validation.PCValidationBase
uses java.util.HashSet

@Export
class ContractorsEquipmentPartValidation extends PCValidationBase {
  
  var _equipPart : ContractorsEquipPart
  
  
  construct( valContext : PCValidationContext, signpart : ContractorsEquipPart)
  {
    super( valContext )
    _equipPart = signpart
  }

  override protected function validateImpl() {
    Context.addToVisited( this, "validateImpl" )
    atLeastOneEquipmentOrMiscCoverageExists()
    checkLimitVsDeductible()
    addlInterestDetailUnique()
  }
  
  private function atLeastOneEquipmentOrMiscCoverageExists() {
    Context.addToVisited( this, "atleastOneEquipment" )
    
    var msg = displaykey.Web.Policy.IM.Validation.AtLeastOneEquipmentOrMiscCoverageExists 
    if ( !_equipPart.ContractorsEquipMiscUnscheduledCovExists && _equipPart.ContractorsEquipments.Count == 0 ) {
      if (Context.isAtLeast(ValidationLevel.TC_QUOTABLE)) {      
        Result.addError( _equipPart, ValidationLevel.TC_QUOTABLE, msg)
      } else {
        Result.addWarning(_equipPart, ValidationLevel.TC_DEFAULT, msg)
      }
    }
  }

  function addlInterestDetailUnique() {
    Context.addToVisited(this, "addlInterestDetailUnique")   
    for (equipment in _equipPart.ContractorsEquipments) {
      var thisSet = new HashSet<AddlInterestDetail>(equipment.AdditionalInterestDetails.toList())
      for (detail in equipment.AdditionalInterestDetails) {
        var oldCount = thisSet.Count
        thisSet.removeWhere(\ o -> o.PolicyAddlInterest == detail.PolicyAddlInterest and 
                                   o.AdditionalInterestType == detail.AdditionalInterestType and 
                                   o.ContractNumber == detail.ContractNumber)
        if (thisSet.Count < oldCount - 1) {
          Result.addError(equipment, "default", displaykey.EntityName.PolicyLine.Validation.AddlInterestDetailUnique(detail.DisplayName))
          if (!thisSet.HasElements) {
            return
          }
        }
      }
    }
  }
  
  private function checkLimitVsDeductible() {
    if ( _equipPart.ContractorsEquipMiscUnscheduledCovExists ) {
      if ( _equipPart.ContractorsEquipMiscUnscheduledCov.ContractorsEquipMiscUnscheduledLimitTerm.Value <
           _equipPart.ContractorsEquipMiscUnscheduledCov.ContractorsEquipMiscUnscheduledDeductibleTerm.Value ) {
             Result.addError( _equipPart, "default", 
               displaykey.Web.Policy.IM.Validation.limitcannotbelessthandeductible(_equipPart.ContractorsEquipMiscUnscheduledCov.Pattern.DisplayName))
      }
    }
    if (_equipPart.ContractorsEquipEmployeesToolsExists ) {
      if ( _equipPart.ContractorsEquipEmployeesTools.ContractorsEquipEmployeesToolsLimitTerm.Value <
           _equipPart.ContractorsEquipEmployeesTools.ContractorsEquipEmployeesToolsDeductibleTerm.Value ) {
             Result.addError( _equipPart, "default", displaykey.Web.Policy.IM.Validation.limitcannotbelessthandeductible(_equipPart.ContractorsEquipEmployeesTools.Pattern.DisplayName) )
      }
    }
    if ( _equipPart.ContractorsEquipRentedEquipmentExists ) {
      if ( _equipPart.ContractorsEquipRentedEquipment.ContractorsEquipRentedEquipmentLimitTerm.Value <
           _equipPart.ContractorsEquipRentedEquipment.ContractorsEquipRentedEquipmentDeductibleTerm.Value ) {
             Result.addError( _equipPart, "default", displaykey.Web.Policy.IM.Validation.limitcannotbelessthandeductible(_equipPart.ContractorsEquipRentedEquipment.Pattern.DisplayName) )
      }
    }
    if ( _equipPart.ContractorsEquipRentalReibursementExists ) {
      if ( _equipPart.ContractorsEquipRentalReibursement.ContractorsEquipRentalPolicyLimitTerm.Value <
           _equipPart.ContractorsEquipRentalReibursement.ContractorsEquipRentalReibursementDeductibleTerm.Value ) {
             Result.addError( _equipPart, "default", displaykey.Web.Policy.IM.Validation.limitcannotbelessthandeductible(_equipPart.ContractorsEquipRentalReibursement.Pattern.DisplayName) )
      }
    }
    _equipPart.ContractorsEquipments
                  .where( \ eq -> eq.ContractorsEquipSchedCov.ContractorsEquipSchedCovLimitTerm.Value <
                                  eq.ContractorsEquipSchedCov.ContractorsEquipSchedCovDeductibleTerm.Value )
                  .each( \ eq -> Result.addError( eq, "default", displaykey.Web.Policy.IM.Validation.limitcannotbelessthandeductible("Item " + eq.ContractorsEquipmentNumber) ) )
  }
}
