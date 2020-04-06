package gw.webservice.pc.pc800.community.datamodel

uses gw.xml.ws.annotation.WsiExportable

@Export
@WsiExportable("http://guidewire.com/pc/ws/gw/webservice/pc/pc800/community/datamodel/CommissionPlanDTO")
final class CommissionPlanDTO {
  var _commissionPlanID : String as CommissionPlanID
  var _currency : Currency as Currency

  function populateFromCommissionPlan(plan : CommissionPlan) {
    this.CommissionPlanID = plan.CommissionPlanID
    this.Currency = plan.Currency
  }

  function updateCommissionPlan(plan : CommissionPlan) {
    plan.CommissionPlanID = this.CommissionPlanID
    plan.Currency = this.Currency
  }
}