package gw.exportimport.validation

uses com.guidewire.pl.system.validation.ValidationIssueFilter

uses gw.api.validation.ValidationIssue
uses gw.api.validation.FieldValidation
uses gw.exportimport.validation.RowValidation

uses java.lang.StringBuilder

@Export
class CustomizableImportValidationMapper {

  /**
   * Converts a {@link RowValidation} to a string after applying {@link ValidationIssueFilter} 
   * on all contained {@link ValidationIssue}'s
   * @param rowValidation the row validation
   * @param validationFilter the validation issue filter that will be applied
   * @return String a human-readable representation of the RowValidation
   */
  static function rowValidationToString(rowValidation : RowValidation, validationFilter : ValidationIssueFilter) : String {    
    var buf = new StringBuilder()
    var row = rowValidation.Row
    if ( row != null ) {
      buf.append("Row: ").append(row).append("\n\n")
    }

    for ( issue in rowValidation.filterIssues(validationFilter)) {
      buf.append(validationIssueToString(issue)).append("\n")
    }
    return buf.toString()    
  }
  
  private static function validationIssueToString(issue : ValidationIssue) : String {
    if (issue typeis FieldValidation) {
      return fieldValidationToString(issue)
    }
    return generalValidationToString(issue)
  }

  /**
   * Use the FieldName to report the Column (eg. "Column A").
   */  
  private static function fieldValidationToString(issue : ValidationIssue) : String {
    var buf = new StringBuilder()
    var fieldValidation = issue as FieldValidation
    buf.append(displaykey.Import.ValidationMapper.Column(fieldValidation.FieldName)).append("\n")
    buf.append(displaykey.Import.ValidationMapper.BadValue(fieldValidation.BadValue)).append("\n")
    buf.append(generalValidationToString(issue))
    return buf.toString()
  }
  
  private static function generalValidationToString(issue : ValidationIssue) : String {
    var buf = new StringBuilder()
    buf.append(displaykey.Import.ValidationMapper.IssueType(issue.Type)).append("\n")
    buf.append(displaykey.Import.ValidationMapper.IssueReason(issue.Reason)).append("\n")
    return buf.toString()    
  }  
}

