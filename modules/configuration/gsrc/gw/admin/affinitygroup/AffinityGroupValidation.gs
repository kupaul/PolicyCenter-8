package gw.admin.affinitygroup

uses gw.validation.PCValidationBase
uses gw.validation.PCValidationContext
uses gw.validation.ValidationUtil

@Export
class AffinityGroupValidation extends PCValidationBase {

  var _affinityGroup : AffinityGroup as AffinityGroup

  construct(valContext : PCValidationContext, anAffinityGroup : AffinityGroup) {
    super(valContext)
    _affinityGroup = anAffinityGroup
  }
  
  override protected function validateImpl() {
    Context.addToVisited(this, "validateImpl")
    validateAffinityGroupProducerCodes()
    checkDuplicateJurisdictions()
    validateAffinityGroupDates()
    validateOrganizationOnAffinityGroup()
  }

  /**
   * Validates the producer affinity group producer codes to check that the codes are valid based on affinity group type
   *
   * @param group - the affinity group to use.
   */  
  function validateAffinityGroupProducerCodes() {
    Context.addToVisited(this, "validateAffinityGroupProducerCodes")
    if (AffinityGroup.AffinityGroupType == AffinityGroupType.TC_CLOSED) {
      if (AffinityGroup.AffinityGroupProducerCodes.IsEmpty) {
        Result.addError(AffinityGroup, ValidationLevel.TC_DEFAULT, displaykey.Web.Admin.ProducerCodeRequired)
      } else {
        var producerCodesNotMatchingOrganization = AffinityGroup.AffinityGroupProducerCodes.where(\ code -> code.ProducerCode.Organization != AffinityGroup.Organization)
        if (producerCodesNotMatchingOrganization.HasElements) {                                                                       
          var displayableString = producerCodesNotMatchingOrganization.map(\ code -> code.ProducerCode.Code).join(",")
          Result.addError(AffinityGroup, ValidationLevel.TC_DEFAULT, displaykey.Web.Admin.ProducerCodesNotMatchingOrganization(displayableString, AffinityGroup.Organization.DisplayName))
        }
      }
    }
    if (AffinityGroup.AffinityGroupType == AffinityGroupType.TC_OPEN and not AffinityGroup.AffinityGroupProducerCodes.IsEmpty) {
      Result.addError(AffinityGroup, ValidationLevel.TC_DEFAULT, displaykey.Web.Admin.AffinityGroupProducerCodesNotAllowed)
    }
  }

  /**
   * Validates whether organization is allowed on an affinity group based on affinity group type
   *
   */
  function validateOrganizationOnAffinityGroup() {
    Context.addToVisited(this, "validateOrganizationOnAffinityGroup")
    if (AffinityGroup.AffinityGroupType == AffinityGroupType.TC_OPEN and AffinityGroup.Organization != null) {
      Result.addError(AffinityGroup, ValidationLevel.TC_DEFAULT, displaykey.Web.Admin.AffinityGroupOrganizationNotAllowed)
    }
  }

  function checkDuplicateJurisdictions() {
    Context.addToVisited(this, "checkDuplicateJurisdictions")
    // Ensure there are no duplicate jurisdictions
    AffinityGroup.Jurisdictions
      .partition(\ jur -> "${jur.Jurisdiction}")  
      .filterByValues(\ l -> l.Count > 1)
      .eachValue(\ dup -> { 
         Result.addError(AffinityGroup, ValidationLevel.TC_DEFAULT,
           displaykey.Web.Admin.JurisdictionExists(dup.first().Jurisdiction.Description))                           
         })
  }
    
  static function validate(anAffinityGroup : AffinityGroup) {
    var context = ValidationUtil.createContext(ValidationLevel.TC_DEFAULT)
    new AffinityGroupValidation(context, anAffinityGroup).validate()
    context.raiseExceptionIfProblemsFound()
  }

  /**
   * Validates affinity group's start and end date
   * We display a warning if start and end date are the same. If start date is later than end date, display an error.
   */
  function validateAffinityGroupDates() {
    Context.addToVisited(this, "validateAffinityGroupDates")
    var startDate = AffinityGroup.StartDate
    var endDate = AffinityGroup.EndDate

    if (startDate != null and endDate != null){
      if(startDate.compareTo(endDate) == 0) {
        Result.addWarning(AffinityGroup, ValidationLevel.TC_DEFAULT, displaykey.Web.Admin.AffinityGroupSameStartAndEndDates)
      } else if (startDate.compareTo(endDate) > 0 ) {
        Result.addError(AffinityGroup, ValidationLevel.TC_DEFAULT, displaykey.Web.Admin.AffinityGroupEndDateBeforeStartDate)
      }
    }
  }
}
