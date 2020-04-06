package gw.exportimport.web

uses gw.exportimport.ExportData
uses gw.exportimport.EntityFlowMask
uses gw.exportimport.EntityInfo
uses gw.exportimport.ExportImportConstants
uses gw.exportimport.ExportLocaleUtil

uses java.util.Map
uses gw.api.util.LocaleUtil

/**
 * A factory that creates instances of {@link ExportData}. The enum {@link ExportDataCreator} specifies the logic
 * for a given exportable entity type. OOTB instances are: CPBuilding and CPLocation.
 */
@Export
class ExportDataWebFactory {

  static var _creators : Map<Type, ExportDataCreator> = {
    CPBuilding -> ExportDataCreator.CPBuildingCreator,
    CPLocation -> ExportDataCreator.CPLocationCreator
  }

  private construct() {
  }

  /**
   * Creates new {@link ExportData} by selecting corresponding strategy (the enum) and calling its
   * #createExportData method.
   */
  static function createExportData(period : PolicyPeriod, maskSelection : ExportMaskSelection) : ExportData {
    var type = maskSelection.MaskData.EntityType
    var exportData : ExportData
    if (maskSelection.Locale != null) {
      LocaleUtil.runAsCurrentLocaleAndLanguage(LocaleUtil.toLocale(maskSelection.Locale), LocaleUtil.toLanguage(maskSelection.Language), \ -> {
        exportData = _creators[type]?.createExportData(period, maskSelection)
      })
    } else {
      LocaleUtil.runAsCurrentLocale(LocaleUtil.toLanguage(maskSelection.Language), \ -> {
        exportData = _creators[type]?.createExportData(period, maskSelection)
      })
    }
    exportData.Language = maskSelection.Language
    return exportData
  }

  /**
   * An enum defining strategies for applicable exportable entity types, e.g. CPBuilding and CPLocation.
   */
  static enum ExportDataCreator {
    CPBuildingCreator(\ period : PolicyPeriod, maskSelection : ExportMaskSelection -> {
      var entityInfo = createEntityInfo(maskSelection) as EntityInfo<CPBuilding>
      var buildings = period.CPLine.CPLocations*.Buildings.toList()
      var exportData = new ExportData<CPBuilding>(entityInfo, buildings)
      var unreferencedLocations = period.CPLine.CPLocations.subtract(buildings*.CPLocation).toList()
      if ( !unreferencedLocations.Empty ) {
        exportData.addAdditionalData("CPLocation", unreferencedLocations)
      }
      return exportData
    }),

    CPLocationCreator(\ period : PolicyPeriod, maskSelection : ExportMaskSelection -> {
      var entityInfo = createEntityInfo(maskSelection) as EntityInfo<CPLocation>
      var locations = period.CPLine.CPLocations.toList()
      return new ExportData<CPLocation>(entityInfo, locations)
    })

    var _create : block(period : PolicyPeriod, maskSelection : ExportMaskSelection) : ExportData

    private construct(create(period : PolicyPeriod, maskSelection : ExportMaskSelection) : ExportData) {
      _create = create
    }

    static function createEntityInfo(maskSelection : ExportMaskSelection) : EntityInfo {
      if (maskSelection.Format.All) {
        return EntityInfo.Registry.findEntityInfo(maskSelection.MaskData.EntityType)
      }
      return maskSelection.Format.Mask.createMaskedEntityInfo()
    }

    function createExportData(period : PolicyPeriod, maskSelection : ExportMaskSelection) : ExportData {
      var data = _create(period, maskSelection)
      setVariables(data, period)
      return data
    }
  }

  static function setVariables(data : ExportData, period : PolicyPeriod) {
    data.SpreadSheetVariables.put(ExportImportConstants.PERIOD_ID_EXCEL_VARIABLE, period.PublicID)
    data.SpreadSheetVariables.put(ExportImportConstants.JOB_ID_EXCEL_VARIABLE, period.Job.PublicID)

    if (period.PolicyNumberAssigned) {
      data.FileNameVariables.put(ExportImportConstants.POLICY_NUMBER_FILENAME_VARIABLE, period.PolicyNumber)
    }
    data.FileNameVariables.put(ExportImportConstants.JOB_NUMBER_FILENAME_VARIABLE, period.Job.JobNumber)
    data.FileNameVariables.put(ExportImportConstants.JOB_TYPE_FILENAME_VARIABLE, period.Job.Subtype.Description)
    data.FileNameVariables.put(ExportImportConstants.ENTITY_TYPE_FILENAME_VARIABLE, ExportLocaleUtil.lookupEntityTypeDisplayName(data.EntityType))
  }
}