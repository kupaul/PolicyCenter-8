package gw.policy
uses gw.web.productmodel.ProductModelSyncIssueWrapper

enhancement ModifiableEnhancement : Modifiable {
  
  /**
   * Syncs modifiers against the product model, fixes all issues marked as ShouldFixDuringNormalSync,
   * and returns all the issues found regardless of whether or not they were fixed.
   * @return List<ProductModelSyncIssueWrapper> - list of product model issues if there are any
   */
  function syncModifiers() : List<ProductModelSyncIssueWrapper> {
    var originalIssues = this.updateModifiers() 
    return ProductModelSyncIssueWrapper.wrapIssues( originalIssues ) 
  }
}
