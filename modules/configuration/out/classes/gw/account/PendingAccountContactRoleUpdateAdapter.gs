package gw.account

uses entity.AccountContactRole
uses entity.OwnerOfficer
uses gw.lang.Export
uses entity.PendingAccountContactRoleUpdate

uses java.util.Date
uses gw.api.domain.account.PendingUpdate

/**
 * An adapter class that implements the {@link PendingUpdate} interface for {@link PendingAccountContactRoleUpdate}
 */ 
@Export
class PendingAccountContactRoleUpdateAdapter implements PendingUpdate {
  
  var _update : PendingAccountContactRoleUpdate as Update
  
  construct(theUpdate : PendingAccountContactRoleUpdate) {
    _update = theUpdate
  }

  override property get Target() : AccountContactRole {
    return _update.TargetAccountContactRole
  }

  override property get ExecuteTime() : Date {
    return _update.PendingUpdateTime
  }
  
  override function applyUpdate() {    
    Target.refresh()
    if (Target.Retired){
      return
    }
    var targetRole = Target
    if (targetRole typeis OwnerOfficer){
      targetRole.RelationshipTitle = Update.RelationshipTitle == null ? targetRole.RelationshipTitle : Update.RelationshipTitle
    }
  }
}
