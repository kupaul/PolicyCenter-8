package gw.web.policy
uses java.util.Set
uses java.util.ArrayList
uses java.lang.IllegalStateException

/**
 * UI helper class to separate rows (of type R) into categories (of type C).
 * The resulting rows can be passed to an appropriate iterator for display.
 */
@Export
abstract class ModalRowOrganizer<C, R extends ModalRow> {
  var _items : R[] as readonly Items
  var _categories : Set<C> as readonly Categories
  
  /**
   * @param categories Allowable categories and their corresponding display key. 
   * Iterator order will be followed, so using a LinkedHashMap is suggested.
   * @param Item rows.
   */
  construct(categoriesArg : Set<C>, itemsArg : R[]) {
    _categories = categoriesArg
    _items = itemsArg
  }
  
  abstract function categoryForItem(item : R) : C
  abstract function createTitleRow(category : C) : R
  abstract function sortRowsWithinCategory(rows : List<R>) : List<R>
  
  function validatedCategoryForItem(item : R) : C {
    var result = categoryForItem(item)
    if (not Categories.contains(result)) {
      throw new IllegalStateException("Category \"${result}\" is not among the valid categories, ${Categories}")
    }
    return result
  }
  
  function createWrappers() : R[] {
    var modalRows = new ArrayList<R>()
    var itemsByCategory = Items
        .partition( \ i -> validatedCategoryForItem(i))
        .toAutoMap(\ c -> new ArrayList<R>())

    for (category in Categories) {
      var rows = itemsByCategory[category]
      if (rows.HasElements) {
        modalRows.add(createTitleRow(category))
        modalRows.addAll(sortRowsWithinCategory(itemsByCategory[category]))
      }
    }

    return modalRows.toTypedArray()
  }

}
