package gw.rating.worksheet.treenode.builder.populator

uses gw.api.productmodel. *
uses gw.lang.reflect.TypeSystem
uses gw.plugin.rateflow.ICostDataWrapper
uses gw.rating.flow.util.TypeMaps
uses gw.rating.worksheet.domain.WorksheetObjectProperty
uses java.lang.StringBuilder
uses gw.rating.flow.util.CovTermValueDisplaySuffixVisitor

@Export
class WorksheetObjectPropertyPopulator extends WorksheetOperandContainerPopulator<WorksheetObjectProperty> {

  override function populateOperandAndValue(operandContainer : WorksheetObjectProperty, operandBuilder : StringBuilder, valueBuilder : StringBuilder, displayArgumentValues : boolean) {
    if (isCostData(operandContainer)) {
      operandBuilder.append(operandContainer.PropertyName)
    } else {
      operandBuilder.append((operandContainer.Type != null) ? operandContainer.Type : operandContainer.ObjectName)
      if (operandContainer.DisplayHints.Count == 2) {
        populateCovTermOperand(operandContainer, operandBuilder)
      } else if (operandContainer.PropertyName.HasContent) {
        operandBuilder.append(".${operandContainer.PropertyName}")
      }
    }
    valueBuilder.append(super.localize(operandContainer))
  }

  private function populateCovTermOperand(operandContainer : WorksheetObjectProperty, operandBuilder : StringBuilder) {
    // display hints used to render covterm selection properly
    var covTermCode = operandContainer.DisplayHints[0]
    var valueTypeName = operandContainer.DisplayHints[1]
    var termPattern = CovTermPatternLookup.getByCode(covTermCode)
    if (termPattern != null) {
      var suffix = getCovTermDisplaySuffix(termPattern, operandContainer.PropertyName, valueTypeName)
      operandBuilder.append(".${termPattern.DisplayName} [${suffix}]")
    } else if (operandContainer.PropertyName.HasContent) {
      operandBuilder.append(".${operandContainer.PropertyName}")
    }
  }

  private function isCostData(operandContainer : WorksheetObjectProperty) : boolean {
    return ICostDataWrapper.Type.isAssignableFrom(TypeMaps.parseType(operandContainer.ObjectType))
  }

  private function getCovTermDisplaySuffix(covTerm : CovTermPattern, path : String, valueTypeName : String) : String {
    var covTermSuffix = displaykey.Web.Policy.RatingWorksheet.Node.CovTermSuffix

    var valueType = TypeSystem.getByRelativeName(valueTypeName)
    if (CovTermPattern.Type.isAssignableFrom(valueType)) {
      return covTermSuffix
    }

    var visitor = new CovTermValueDisplaySuffixVisitor (
        displaykey.Web.Policy.RatingWorksheet.Node.CodeSuffix,
        displaykey.Web.Policy.RatingWorksheet.Node.ValueSuffix,
        path)
    covTerm.acceptVisitor(visitor)
    return visitor.Suffix
  }
}
