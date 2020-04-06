package gw.lob.ba.financials

uses gw.api.database.Query
uses gw.api.database.Relop
uses gw.api.database.IQueryBeanResult
uses com.guidewire.pl.system.transaction.BootstrapTransaction
uses com.guidewire.pl.system.dependency.ServerDependencies
uses com.guidewire.pl.system.exception.TransactionException
uses java.lang.RuntimeException
uses gw.pl.util.GWRunnable
uses com.guidewire.pl.system.database.DatabaseDependencies

enhancement BusinessVehicleCovCostUpgradeEnhancement : entity.BusinessVehicleCovCost {

  static function attemptToAssignVehiclesToCostsWithout() {
    var instancesBeforeRunning = - 1
    while (instancesBeforeRunning == - 1 or instancesBeforeRunning > getCostsWithoutAssignedVehicles().Count) {
      instancesBeforeRunning = getCostsWithoutAssignedVehicles().Count
      for (cost in getCostsWithoutAssignedVehicles().iterator()) {
        if (cost.Branch != null) {
          gw.transaction.Transaction.runWithNewBundle(\bundle -> {
            var inBundleCost = bundle.add(cost)
            inBundleCost.attemptToAssignVehicle()
          })
        }
      }
    }
  }

  static function getCostsWithoutAssignedVehicles() : IQueryBeanResult<BusinessVehicleCovCost> {
    var query = Query.make(BusinessVehicleCovCost)
    query.compare("BusinessVehicle", Relop.Equals, null)
    var result = query.select()
    result.setPageSize(1000)
    return result
  }

  static function getCostsWithAssignedVehicles() : IQueryBeanResult<BusinessVehicleCovCost> {
    var query = Query.make(BusinessVehicleCovCost)
    query.compare("BusinessVehicle", Relop.NotEquals, null)
    var result = query.select()
    result.setPageSize(1000)
    return result
  }

  function attemptToAssignVehicle() {
    for (slice in this.VersionList.AllVersions) {
      var updatedVehicle = this.getVehicleFor(slice)
      if (updatedVehicle != null and
          (slice.BusinessVehicle == null or slice.BusinessVehicle.equals(updatedVehicle))) {
        setTheVehicleIdInUpgradeOnly(slice.ID, updatedVehicle.FixedId)
      }
    }
  }

  function getVehicleFor(cost : BusinessVehicleCovCost) : BusinessVehicle {
    var vehicleToSet : BusinessVehicle = null
    // find all the overlapping slices of
    for (covVersion in cost.BusinessVehicleCov.VersionList.AllVersions) {
      if (effectiveDatesOverlap(cost, covVersion)) {
        if (vehicleToSet == null) {
          vehicleToSet = covVersion.Vehicle
        } else if (!vehicleToSet.FixedId.equals(covVersion.Vehicle.FixedId)) {
          //  error, the vehicle on the cov changed without repricing
          return null
        }
      }
    }
    return vehicleToSet
  }

  static function effectiveDatesOverlap(cost : BusinessVehicleCovCost, covVersion : BusinessVehicleCov) : boolean {
    // if one expires before the other starts, return false, otherwise, they overlap
    if (covVersion.ExpirationDate != null and cost.EffectiveDate != null
        and !covVersion.ExpirationDate.after(cost.EffectiveDate)) {
      return false
    }
    if (covVersion.EffectiveDate != null and cost.ExpirationDate != null
        and !covVersion.EffectiveDate.before(cost.ExpirationDate)) {
      return false
    }
    return true
  }

  private function setTheVehicleIdInUpgradeOnly(row : Key, vehicle : Key) {
    final var costID = row.Value
    final var vehicleID = vehicle.Value
    try {
      var trans = new BootstrapTransaction(new GWRunnable() {
        override function run() {
          var sql = "update pc_bacost set businessvehicle = " + vehicleID +  " where id = " + costID
          DatabaseDependencies.getDatabase().update(sql)
      }})
      ServerDependencies.getTransactionManager().execute(trans)
    } catch (e : TransactionException) {
      throw new RuntimeException(e)
    }
  }
}
