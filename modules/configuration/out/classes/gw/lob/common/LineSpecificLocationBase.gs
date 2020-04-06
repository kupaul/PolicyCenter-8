package gw.lob.common

uses gw.api.domain.LineSpecificLocation
uses gw.api.domain.LineSpecificBuilding

/**
 * Base implementation of {@link LineSpecificLocation}.  
 * This class provides default implementation for methods and properties that
 * are necessary for {@link LineSpecificLocation} but may not require any specific 
 * information about a line to implement, like {@link #UnusedBuildings}.
 *
 * @param <B> A line specific building type {@link LineSpecificBuilding} that corresponds to the same policy line as
 * this LineSpecificLocation.  (e.g.  BOPSpecificLocation&lt;BOPBuilding&gt;)
 */
@Export
abstract class LineSpecificLocationBase<B extends LineSpecificBuilding> implements LineSpecificLocation {
  
  abstract protected property get Period() : PolicyPeriod
  
  override property get UnusedBuildings() : Building[] {
    return PolicyLocation.Buildings.subtract(LineSpecificBuildings.map(\b -> b.LocationBuilding)).toTypedArray()
  }

  override function addNewLineSpecificBuilding() : LineSpecificBuilding {
    return addToLineSpecificBuildings(PolicyLocation.newBuilding())
  }

  override function addToLineSpecificBuildings(building : Building) : LineSpecificBuilding {
    if (LineSpecificBuildings*.LocationBuilding.hasMatch(\b -> b == building)) {
      throw displaykey.Web.Policy.LocationContainer.Location.Building.Error.AlreadyIsALineSpecificBuilding(building, B.Type.RelativeName)
    }
    var lineSpecificBuilding = B.Type.TypeInfo.getConstructor({PolicyPeriod}).Constructor.newInstance({Period}) as B
    lineSpecificBuilding.LocationBuilding = building
    addToLineSpecificBuildings(lineSpecificBuilding)
    return lineSpecificBuilding
  }
}
