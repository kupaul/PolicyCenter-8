package gw.web.policy

@Export
class ModalRow<T> {

  protected var _item : T as Item  //protected for test access :(
  var _title : String as Title

  /**
   * Row is an item. (E.g., is not a category title.)
   */
  property get IsItem() : boolean {
    return Item != null
  }

  /**
   * Used to created the modal rows.
   */
  property get Mode() : String {
    return IsItem ? "issue" : "label"
  }

}
