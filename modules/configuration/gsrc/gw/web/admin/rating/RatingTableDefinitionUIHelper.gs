package gw.web.admin.rating

uses gw.api.tree.RowTreeRootNode
uses java.util.Set

@Export
class RatingTableDefinitionUIHelper {

  static function canUpdateDefinition(tableDefinition : RateTableDefinition,
      rateTablesUsingDefinition : List<RateTable>, errorStatus : ErrorStatus) {
    if (errorStatus.ErrorFound or (tableDefinition.tablesUsingDefinition().HasElements and rateTablesUsingDefinition.Empty)) {
      errorStatus.ErrorFound = true
      throw new gw.api.util.DisplayableException(displaykey.Web.Rating.RateTableDefinition.DefinitionInUse)
    }
  }

  // Because the list of rateTables can change dynamically, we need to recalculate
  // this on refresh.   But if there is no change and yet we recreate the tree, the
  // editor breaks (can't open or close tree nodes).  The workaround is to keep the
  // old data structure, and only generate a new one when the underlying tables change.
  static function getOwningTables(rateTables : List<RateTable>, oldData : OldData) : RowTreeRootNode {
    var owningTables = rateTables.where(\ rt -> rt.Owned)
    var newTables = owningTables.toSet()
    if (oldData.OldTree <> null and oldData.OldTables.disjunction(newTables).Empty) {
      return oldData.OldTree
    }

    var newTree = new RowTreeRootNode(owningTables, \ t -> (t as RateTable).ReferencingRateTables)
    oldData.OldTree = newTree
    oldData.OldTables = newTables
    return newTree
  }

  static class ErrorStatus {
    var _errorFound : boolean as ErrorFound
  }

  static class OldData {
    var _oldTables : Set<RateTable> as OldTables
    var _oldTree : RowTreeRootNode as OldTree
  }
}
