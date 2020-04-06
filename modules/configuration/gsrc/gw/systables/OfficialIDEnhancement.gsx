package gw.systables

uses gw.api.util.DateUtil
uses gw.validation.PCValidationResult
uses gw.api.util.StringUtil
uses gw.api.util.StateJurisdictionMappingUtil

enhancement OfficialIDEnhancement : OfficialID {

  function validateOfficialID(period : PolicyPeriod, result: PCValidationResult) {
    if (this.OfficialIDType == null) { 
      return
    }   
    var IdInfoResults : OfficialIDValidationInfoQuery =
      OfficialIDValidationInfo.finder.findOfficialIDValidationInfosByOfficialIDTypeAndStateAndEffectiveOnDate(this.OfficialIDType,
          StateJurisdictionMappingUtil.getStateMappingForJurisdiction(this.State), DateUtil.currentDate())
    
    if (this.OfficialIDValue == null) {  // validate requiredness
      for (validationInfo in IdInfoResults) {
        if (validationInfo.OfficialIdRequiredType != "optional") {
          var level: ValidationLevel
          if (validationInfo.OfficialIdRequiredType == "mandatoryissue") {
            level = "readyforissue"
          } else {
            level = "bindable"
          }
          result.addError(period, level,
              displaykey.Validation.OfficialID.ValueRequired(this.State, validationInfo.OfficialIDType.Description, validationInfo.OfficialIdRequiredType.Description))

        }
      }
    } else { // validate value correctness
      var error = validateValue(IdInfoResults)
      if (error != null) {
        result.addError(period, "default", error)
      }
    }
  }

  function validateValue(): String {
    var IdInfoResults = OfficialIDValidationInfo.finder.findOfficialIDValidationInfosByOfficialIDTypeAndStateAndEffectiveOnDate(
        this.OfficialIDType, StateJurisdictionMappingUtil.getStateMappingForJurisdiction(this.State), DateUtil.currentDate())
    return validateValue(IdInfoResults)
  }

  function validateValue(IdInfoResults: OfficialIDValidationInfoQuery): String {
    if (this.OfficialIDValue == null) {
      return null
    }
    
    for (validationInfo in IdInfoResults) {
      var format = "^" + validationInfo.IDFormat + "$"
      if (StringUtil.match(this.OfficialIDValue, format)) {
        return null
      } else { //store the first error message that will be returned if none of the results matches officialId
        return displaykey.Validation.OfficialID.ValueFormat(this.OfficialIDType, this.State, validationInfo.IDFormatError)
      }
    }
    return null
  }

}
