package gw.web.admin.flowmeta

uses gw.api.database.Query
uses gw.exportimport.ExportLocaleUtil
uses javax.swing.text.html.parser.Entity

@Export
class DataFlowMaskDetailDVUIHelper {

  public static function validateName(mask : entity.EntityFlowMaskData, name : String) : String {
    if ( ( name == null ) or !name.NotBlank ) {
      return null
    }

    if ( !mask.New and ( name == mask.Name ) ) {
      // no change...
      return null
    }

    var query = Query.make(EntityFlowMaskData)

    query.compare("Name", Equals, name)
    query.compare("EntityTypeName", Equals, mask.EntityTypeName)

    var entityDisplayName = ExportLocaleUtil.lookupEntityTypeDisplayName(mask.EntityType)
    return query.select().Empty
        ? null
        : displaykey.Web.Admin.DataFlowMaskDetailDV.DuplicateNameError(name, entityDisplayName)
  }

  public static function validateSelectedList(skipValidationAfterTypeChange : boolean, mask : entity.EntityFlowMaskData, selection : String[]) : String {
    if ( skipValidationAfterTypeChange ) {
      // skip validation when the selection list is for the
      // prior EntityInfo type...
      skipValidationAfterTypeChange = false
      selection = null
    }

    if ( ( selection == null ) or selection.IsEmpty ) {
      return null
    }

    var requiredColumns = mask.RequiredColumnNames

    if ( ( requiredColumns == null ) or requiredColumns.IsEmpty ) {
      return null
    }

    var requiredColumnsToBeExcluded = selection.intersect(requiredColumns)
    return requiredColumnsToBeExcluded.Empty
        ? null
        : requiredColumnsToBeExcluded
            .map(\ s -> displaykey.Web.Admin.DataFlowMaskDetailDV.CannotExcludeRequiredColumnError(s))
            .join("\n").concat("\n").concat(displaykey.Web.Admin.DataFlowMaskDetailDV.ExcludedRequiredColumnAction)
  }
}