package gw.account

uses gw.api.database.Query
uses java.util.HashSet
uses gw.api.database.IQueryBeanResult
uses java.util.Set

@Export
class AccountContactRoleMergeableImpl extends AbstractMergeableImpl<AccountContactRole> {
  construct(mergeable : AccountContactRole) {
    super(mergeable)
  }

  override function checkSanity(merged : AccountContactRole) {
    // AccountContactRoles don't have anything to check here.
  }

  override function mergeFields(merged : entity.AccountContactRole) : boolean {
    var mergedPeriodsQuery = Query.make(PolicyPeriod)
    var pcrTable = mergedPeriodsQuery.join(PolicyContactRole, "BranchValue")
    pcrTable.compare("AccountContactRole", Equals, merged)
    var mergedPeriods = mergedPeriodsQuery.withDistinct(true).select()

    mergedPeriods.each(\ period -> {
      var allEffDates = period.AllEffectiveDates
      allEffDates.eachWithIndex(\ sliceDate, idx -> {
        if (period.Locked) {
          // If period is locked, simply move all the children over in window mode.
          var mergedChildrenForSliceDate = getEffDatedChildrenFromDBAndBundle(merged, PolicyContactRole, "AccountContactRole", period, sliceDate)
          mergedChildrenForSliceDate.each(\ pcr -> {
            var unslicedPCR = pcr.Unsliced
            if (unslicedPCR.Bundle != Survivor.Bundle) {
              unslicedPCR = Survivor.Bundle.add(unslicedPCR)
            }
            unslicedPCR.setFieldValue("AccountContactRole", Survivor)
          })
        } else {
          // If period is not locked, call mergeChildren to modify versions as needed.
          mergeChildren(Survivor, merged, \ acr -> {
            return getEffDatedChildrenFromDBAndBundle(acr, PolicyContactRole, "AccountContactRole", period, sliceDate)
          }, \ pcr, acr -> {
            var nextIdx = idx + 1
            var nextEventDate = nextIdx < allEffDates.Count ? allEffDates[nextIdx] : period.PeriodEnd
            pcr.setFieldValueForChunk("AccountContactRole", acr, sliceDate, nextEventDate)
          })
        }
      })
    })

    // update the contact denorm for archived periods
    updatePolicyPeriodContactDenorms((merged.OriginalVersion as AccountContactRole).AccountContact.Contact, Survivor.AccountContact.Contact)

    return true
  }

  private function updatePolicyPeriodContactDenorms(oldContact : Contact, newContact : Contact) {
    var bundle = newContact.Bundle
    var periods = getPeriodsReferencingContactFromDBAndBundle(oldContact, newContact)
    for (period in periods.where(\ p -> p.Archived)) {
      if (!bundle.equals(period.getBundle())) {
        period = bundle.loadBean(period.ID) as PolicyPeriod
      }
      period.updateContactDenormsWhenArchived(newContact)
    }
  }

  private function getPeriodsReferencingContactFromDBAndBundle(oldContact : Contact, newContact : Contact) : Set<PolicyPeriod> {
    var periods : HashSet<PolicyPeriod> = {}

    if (not newContact.ID.Temporary) {
      for (period in getPeriodsReferencingContactFromDB(oldContact)) {
        period = period.getSlice(period.PeriodEnd.addSeconds(-1))
        periods.add(period)
      }
    }

    var bundle = newContact.Bundle
    for (bean in bundle.UpdatedBeans) {
      if (bean typeis PolicyPeriod) {
        bean = bean.getSlice(bean.PeriodEnd.addSeconds(-1))            
        if (oldContact.equals(bean.PNIContactDenorm)) {
          periods.add(bean)
        } else {
          periods.remove(bean)
        }
      }
    }

    for (bean in bundle.RemovedBeans) {
      if (bean typeis PolicyPeriod) {
        periods.remove(bean)
      }
    }
    return periods    
  }

  private function getPeriodsReferencingContactFromDB(oldContact : Contact) : IQueryBeanResult<PolicyPeriod> {
    var query = Query.make(PolicyPeriod)
    query.compare("PNIContactDenorm", Equals, oldContact)
    query.compare("ArchiveState", NotEquals, null)
    return query.select()
  }
}
