package gw.web.line.cp.policy

uses javax.swing.text.html.parser.Entity
uses gw.api.web.job.JobWizardHelper
uses java.lang.NullPointerException
uses javax.naming.spi.DirStateFactory.Result

@Export
class CPBuildingPopupUIHelper {

  public static function initialize(jobWizardHelper : JobWizardHelper
                                    , building : entity.Building
                                    , cpBuilding : entity.CPBuilding
                                    , cpLocation : entity.CPLocation
                                    , openForEdit : boolean) : entity.CPBuilding {
    var result = cpBuilding

    if (building <> null and openForEdit) {
      result = cpLocation.addToLineSpecificBuildings(building) as CPBuilding
    } else if (cpBuilding == null and openForEdit) {
      result = cpLocation.addNewLineSpecificBuilding() as CPBuilding
      result.Building.HeatingBoilerOnPremises = false
      result.Building.HeatingBoilerElsewhere = false
    } else if (cpBuilding <> null) {
      if (openForEdit) {
        gw.web.productmodel.ProductModelSyncIssuesHandler.syncCoverages({cpBuilding}, jobWizardHelper)
      }
    }

    return result
  }

  public static function getBoilerInsuredValue(cpBuilding : entity.CPBuilding, boilerPremises : boolean) : boolean {
    if (boilerPremises == false) {
      cpBuilding.Building.HeatingBoilerElsewhere = false
    }
    return cpBuilding.Building.HeatingBoilerElsewhere
  }

  public static function findFirstMatchingClassCode(cpBuilding : entity.CPBuilding, code : String) : CPClassCode{
    var classCode = cpBuilding.firstMatchingClassCode(code)
    if (classCode == null) {
      gw.api.util.LocationUtil.addRequestScopedErrorMessage(displaykey.Java.ClassCodePickerWidget.InvalidCode(code))
    }
    return classCode
  }

  // Don't forget to set the showAlarmFields in the PCF to false
  public static function clearAlarmFields(cpBuilding : entity.CPBuilding){
    //showAlarmFields = false
    cpBuilding.Building.BuildingAlarmType = null
    cpBuilding.Building.AlarmGrade = null
    cpBuilding.Building.AlarmCertificate = null
    cpBuilding.Building.AlarmExpiration = null
    cpBuilding.Building.AlarmClass = null
  }
}