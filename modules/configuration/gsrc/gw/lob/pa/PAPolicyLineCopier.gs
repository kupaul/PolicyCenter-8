package gw.lob.pa

uses gw.api.copy.CompositeCopier
uses gw.coverage.ClausePatternCopier
uses gw.coverage.AllExclusionCopier
uses gw.coverage.AllConditionCopier

/**
 * Copies elements from the PersonalAutoLine of one PolicyPeriod to that of another.
 */
@Export
class PAPolicyLineCopier extends CompositeCopier<PolicyPeriod, PersonalAutoLine> {

  var _paLine : entity.PersonalAutoLine as readonly Source
  
  var _allExclusionCopier : AllExclusionCopier as AllExclusionCopier
  var _allConditionCopier : AllConditionCopier as AllConditionCopier

  construct(thePALine : entity.PersonalAutoLine) {
    _paLine = thePALine
    addVehicleCopiers()
    addLineCoverageCopiers()
    addLineExclusionCopiers()
    addLineConditionCopiers()
    addPolicyDriverCopiers()
    shouldCopy()
  }
  
  override function getOrCreateRoot(period : PolicyPeriod) : PersonalAutoLine {
    return period.PersonalAutoLine
  }

  override function copyRoot(target : PersonalAutoLine) {
    // Nothing to copy on the line itself
  }

  private function addVehicleCopiers() {
    var vehicles = _paLine.Vehicles.sortBy(\v -> v.VehicleNumber)
    var vehicleCopiers = vehicles.map(\v -> new PersonalVehicleCopier(v))
    addAllCopiers(vehicleCopiers.toList())
  }
  
  private function addLineCoverageCopiers() {
    var coverages = _paLine.PALineCoverages.sortBy(\c -> c.DisplayName)
    var coverageCopiers = coverages.map(\c -> new ClausePatternCopier(c))
    addAllCopiers(coverageCopiers.toList())
  }

  private function addLineExclusionCopiers() {
    _allExclusionCopier = new AllExclusionCopier(_paLine)
    addCopier(_allExclusionCopier)
  }

  private function addLineConditionCopiers() {
    _allConditionCopier = new AllConditionCopier(_paLine)
    addCopier(_allConditionCopier)
  }

  private function addPolicyDriverCopiers() {
    var policyDrivers = _paLine.PolicyDrivers.sortBy(\ d -> d.DisplayName)
    var policyDriverCopiers = policyDrivers.map(\ pd -> new PolicyDriverCopier(pd))
    addAllCopiers(policyDriverCopiers.toList())
  }

  property get PersonalVehicleCopiers() : List<PersonalVehicleCopier> {
    return getCopiersWhere(\ c -> c typeis PersonalVehicleCopier) as List<PersonalVehicleCopier>
  }
}
