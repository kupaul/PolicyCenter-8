package gw.lob.common

uses gw.api.domain.LineSpecificLocation
uses gw.api.domain.LineSpecificLocationContainer

/**
 * Base implementation of {@link LineSpecificLocationContainer}.
 * This class provides default implementation for methods and properties that
 * are necessary for {@link LineSpecificLocationContainer} but may not require any specific
 * information about a line to implement, like {@link #UnusedLocations}.
 *
 * @param <L> A line specific location type {@link LineSpecificLocation} that corresponds to the
 *   same policy line as this LineSpecificLocationContainer.  (e.g.  IMSpecificLocationContainer&lt;IMLocation&gt;)
 */
@Export
abstract class LineSpecificLocationContainerBase<L extends LineSpecificLocation> implements LineSpecificLocationContainer {
  var _container : LineSpecificLocationContainer
  
  construct(container : LineSpecificLocationContainer) {
    _container = container
  }
  
  abstract protected property get Period() : PolicyPeriod
  
  override property get UnusedLocations() : AccountLocation[] {
    return Period.Policy.Account.ActiveAccountLocations.subtract(LineSpecificLocations.map(\l -> l.PolicyLocation.AccountLocation)).toTypedArray()
  }

  override function addNewLineSpecificLocation() : LineSpecificLocation {
    return addToLineSpecificLocations(Period.Policy.Account.newLocation())
  }

  override function addToLineSpecificLocations(accountLocation : AccountLocation) : LineSpecificLocation {
    if (accountLocation.Account != null  // builders might have accountLocations not attached to accounts yet because of ordering issues
        and accountLocation.Account != Period.Policy.Account) {
      throw displaykey.Web.Policy.LocationContainer.Location.Error.AccountLocationOnDifferentAccount(accountLocation, _container)
    }
    if (LineSpecificLocations.hasMatch(\l -> l.PolicyLocation.AccountLocation == accountLocation)) {
      throw displaykey.Web.Policy.LocationContainer.Location.Error.AlreadyIsALineSpecificLocation(accountLocation, L.Type.RelativeName)
    }
    var policyLocation = Period.PolicyLocations.firstWhere(\pl -> pl.AccountLocation == accountLocation)
    if (policyLocation == null) {
      policyLocation = Period.newLocation(accountLocation)
    }
    var lineSpecificLocation = L.Type.TypeInfo.getConstructor({PolicyPeriod}).Constructor.newInstance({Period}) as L
    
    lineSpecificLocation.PolicyLocation = policyLocation
    addToLineSpecificLocations(lineSpecificLocation)
    return lineSpecificLocation
  }
}
