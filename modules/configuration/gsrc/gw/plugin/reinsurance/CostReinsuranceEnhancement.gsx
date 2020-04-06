package gw.plugin.reinsurance

enhancement CostReinsuranceEnhancement : entity.Cost {
  /**
   * The name of the coverable that this Cost refers to, as a displayable string.
   */
  property get CoverableName() : String {
    var name = this.NameOfCoverable
    return name ?: this.DisplayName
  }
}