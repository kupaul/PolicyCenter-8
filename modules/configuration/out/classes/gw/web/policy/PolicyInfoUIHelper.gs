package gw.web.policy

@Export
class PolicyInfoUIHelper {

  static function performAffinityGroupSearch(name : String, period: PolicyPeriod) : AffinityGroup {
    if (name == null) {
      return null
    }
    var criteria = new gw.admin.affinitygroup.AffinityGroupSearchCriteria()
    criteria.AffinityGroupName = name
    criteria.Organization = period.ProducerOfRecord.Name
    criteria.ProducerCode = period.ProducerCodeOfRecord.Code
    criteria.Product = period.Policy.Product
    criteria.Jurisdiction = period.BaseState
    criteria.AffinityGroupStartDate = period.PeriodStart
    criteria.AffinityGroupEndDate = period.PeriodEnd


    var results = criteria.performSearch()
    try {
      var group = results.getAtMostOneRow()
      if (group == null) {
        throw new gw.api.util.DisplayableException(displaykey.Web.Policy.AffinityGroup.NoAffinityGroupFound(name))
      }
      return group
    } catch(e : com.guidewire.commons.system.exception.MultipleMatchesException) {
      throw new gw.api.util.DisplayableException(displaykey.Web.Policy.AffinityGroup.MultipleAffinityGroupsFound(name))
    }
  }

  static function getBaseStateVisibility(period : PolicyPeriod) : boolean {
    return !period.PersonalAutoLineExists and
           !period.WorkersCompLineExists and
            period.Reinstatement == null                          }
}