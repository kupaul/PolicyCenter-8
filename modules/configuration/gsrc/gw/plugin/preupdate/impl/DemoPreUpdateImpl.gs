package gw.plugin.preupdate.impl
uses java.lang.IllegalArgumentException
uses gw.contact.LastUpdateTimeUtil
uses java.util.Date
uses gw.api.domain.account.AccountSyncable
uses gw.api.system.PCDependenciesGateway
uses gw.api.database.Query

@Export
class DemoPreUpdateImpl {

  static final var _instance : DemoPreUpdateImpl as readonly Instance = new DemoPreUpdateImpl()

  /**
   * Demo implementation of pre-update logic. Any exception will cause the bounding database
   * transaction to roll back, effectively vetoing the update.
   */
  function executePreUpdate(bean : Object) {
    if (bean == null) {
      throw new IllegalArgumentException("The executePreUpdate method cannot be called with a null argument")
    }
    if (!(bean typeis KeyableBean)) {
      throw new IllegalArgumentException("The executePreUpdate method must be passed an entity as an argument. An object of type " + bean.getClass() + " was passed in instead")
    }

    if (bean typeis Account) {
      handleAccountPreUpdate(bean)
    } else if (bean typeis AccountContactRole) {
      handleAccountContactRolePreUpdate(bean)
    } else if (bean typeis Contact) {
      handleContactPreUpdate(bean)
    } else if (bean typeis Address) {
      handleAddressPreUpdate(bean)
    } else if (bean typeis AccountContact) {
      handleAccountContactPreUpdate(bean)
    } else if (bean typeis Job) {
      handleJobPreUpdate(bean)
    } else if (bean typeis AccountSyncable) {
      bean.handlePreUpdate()
    }
  }

  private function handleAccountPreUpdate(account : Account) {
    for (assignment in account.getChangedArrayElements("RoleAssignments")) {
      account.cascadeAssignment(assignment as UserRoleAssignment)
    }
  }

  private function handleAccountContactRolePreUpdate(accountContactRole : AccountContactRole) {
    changeAccountHolder(accountContactRole)
  }

  private function changeAccountHolder(accountContactRole : AccountContactRole) {
    if (accountContactRole typeis AccountHolder) {
      // update the cached account summaries
      var accountList = PCDependenciesGateway.getAccountList()
      if (accountList != null) {
        accountList.updateAccountNameAfterAccountHolderChange(accountContactRole)
      }
    }
  }

  private function handleContactPreUpdate(contact : Contact) {
    changeAccountHolderName(contact)
    var changedFields = contact.getChangedFields()
    if (changedFields.Count == 1 and (changedFields.single()) == "AutoSync") {
      //Do not set the LastUpdateTime if the update is only for the AutoSync flag.  It always runs
      //at the end of a submission, and it blows away any back-dated LastUpdateDates from back-dated submissions.
    } else {
      setLastUpdateTime(contact)
    }
  }

  private function handleAddressPreUpdate(address : Address) {
    setLastUpdateTime(address)
  }

  private function handleAccountContactPreUpdate(accountContact : AccountContact) {
    setLastUpdateTime(accountContact)
  }

  private function setLastUpdateTime(entity : KeyableBean) {
    var lastUpdateTime = LastUpdateTimeUtil.calculateLastUpdateTime(entity.getFieldValue("LastUpdateTime") as DateTime, entity.getFieldValue("TemporaryLastUpdateTime") as DateTime)
    entity.setFieldValue("LastUpdateTime", lastUpdateTime)
    entity.setFieldValue("TemporaryLastUpdateTime", null)
  }

  private function changeAccountHolderName(contact : Contact) {
    if (contact.isFieldChanged("Name") or
          (contact typeis Person and (contact.isFieldChanged("FirstName") or contact.isFieldChanged("LastName")))) {
      // find the account contact that owns this contact
      var query = Query.make(AccountContact)
        .compare(AccountContact#Contact.PropertyInfo.Name, Equals, contact).select()

      // update the cached account summaries
      for (accountContact in query) {
        if (accountContact.hasRole("AccountHolder")) {
          var accountList = PCDependenciesGateway.getPCWebSession().getAccountList()
          if (accountList != null) {
            accountList.updateAccountNameAfterContactNameChange(contact, accountContact.Account)
          }
        }
      }
    }
  }

  private function handleJobPreUpdate(job : Job) {
    for (assignment in job.getChangedArrayElements("RoleAssignments")) {
      job.cascadeAssignment(assignment as UserRoleAssignment)
    }
  }

}
