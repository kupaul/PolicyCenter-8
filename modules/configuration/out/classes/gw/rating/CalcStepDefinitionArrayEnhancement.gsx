package gw.rating

enhancement CalcStepDefinitionArrayEnhancement : entity.CalcStepDefinition[] {
  property get OrderedByStepSortOrder() : List<CalcStepDefinition> {
    return this.orderBy(\ step -> step.SortOrder) 
  }
  
}
