package gw.plugin.diff.display
uses gw.api.domain.account.AccountSyncable

enhancement IDiffItemTreeNodeEnhancement : gw.api.diff.node.IDiffItemTreeNode {
  property get ConflictLabel() : String {
    if (this.DiffItem.Bean typeis AccountSyncable) {
      return displaykey.Web.Differences.DiffItemTreeNode.ConflictLabel(this.Label, this.Parent.Label)
    }
    return this.Label
  }
}
