package gw.product

enhancement CommissionPlanEnhancement : entity.CommissionPlan {

  property get IsEditable() : boolean {
    return this.New
  }

}
