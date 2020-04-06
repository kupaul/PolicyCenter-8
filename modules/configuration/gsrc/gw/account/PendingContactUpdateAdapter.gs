package gw.account

uses gw.lang.Export
uses entity.PendingContactUpdate
uses entity.Contact

uses java.util.Date
uses gw.api.domain.account.PendingUpdate

/**
 * An adapter class that implements the {@link PendingUpdate} interface for {@link PendingContactUpdate}
 */ 
@Export
class PendingContactUpdateAdapter implements PendingUpdate {
  
  var _update : PendingContactUpdate as Update
  
  construct(theUpdate : PendingContactUpdate) {
    _update = theUpdate
  }

  override property get Target() : Contact {
    return _update.TargetContact
  }

  override property get ExecuteTime() : Date {
    return _update.PendingUpdateTime
  }

  override function applyUpdate() {
    Update.applyUpdateToAccountEntity()
  }

  

}
