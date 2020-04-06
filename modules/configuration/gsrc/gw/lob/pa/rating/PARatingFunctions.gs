package gw.lob.pa.rating

uses gw.rating.flow.RatingFunctionSource
uses java.util.Date

@Export
class PARatingFunctions extends RatingFunctionSource {

  // This should stay protected, not public.
  override protected function availableForLine(policyLineCode : String) : boolean {
    return policyLineCode.equals("PersonalAutoLine")
  }

  function vehicleAgeInYears(vehicle : PersonalVehicle, asOf : Date) : int {
    return asOf.YearOfDate - vehicle.Year
  }

  function getYoungestDriver(vehicle : PersonalVehicle, youthfulDriverLimit : int) : VehicleDriver {
    var youngestDriver = vehicle.Drivers?.minBy(\driver ->driver.PolicyDriver.Age)
    if (youngestDriver.PolicyDriver.Age < youthfulDriverLimit) {
      return youngestDriver
    } else {
      return getHighestPercentDriver(vehicle)
    }
  }

  function getHighestPercentDriver(vehicle : PersonalVehicle) : VehicleDriver {
    return vehicle?.Drivers?.maxBy(\driver -> driver.PercentageDriven)
  }

}
