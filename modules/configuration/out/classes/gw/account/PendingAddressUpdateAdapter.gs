package gw.account

uses gw.lang.Export
uses entity.Address
uses entity.PendingAddressUpdate

uses java.util.Date
uses gw.api.domain.account.PendingUpdate

/**
 * An adapter class that implements the {@link PendingUpdate} interface for {@link PendingAddressUpdate}
 */
@Export
class PendingAddressUpdateAdapter implements PendingUpdate{

  var _update : PendingAddressUpdate as Update

  construct(theUpdate : PendingAddressUpdate) {
    _update = theUpdate
  }

  override property get Target() : Address {
    return _update.TargetAddress
  }

  override property get ExecuteTime() : Date {
    return _update.PendingUpdateTime
  }

  override function applyUpdate() {
    Update.applyUpdateToAccountEntity()
  }
}
