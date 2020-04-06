package gw.reinsurance.enhancements

uses com.guidewire.pl.domain.geodata.util.GeodataUtils
uses gw.reinsurance.search.RILocationRiskProximitySearchCriteria
uses java.math.BigDecimal
uses typekey.UnitOfDistance
uses java.util.Date
uses gw.plugin.Plugins
uses gw.plugin.reinsurance.IReinsurancePlugin

enhancement LocationRiskEnhancement : entity.LocationRisk {

  //
  // PROPERTIES
  //  
  
  property get AccountNumber() : String {
    return this.AccountLocation.Account.AccountNumber
  }
  
  property get PolicyNumber() : String {
    return this.BranchValue.PolicyNumber
  }
  
  property get Description() : String {
    return this.AccountLocation.Description
  }

  property get LocationRiskGroup() : String {
    return Plugins.get(IReinsurancePlugin).getLocationRiskGroup(this)
  }

  property set LocationRiskGroup(lg : String) {
    Plugins.get(IReinsurancePlugin).setLocationRiskGroup(this, lg)
  }

  //
  // FUNCTIONS
  //
  function asOf(effDate : Date) : LocationRisk {
    return this.VersionList.getVersionAsOf(effDate).getSliceUntyped(effDate) as LocationRisk
  }
  
  function createSearchCriteria() : RILocationRiskProximitySearchCriteria {
    var criteria = new RILocationRiskProximitySearchCriteria()
    criteria.LocationRiskCenter = this
    criteria.EffectiveDate = this.SliceDate
    criteria.CoverageGroup = this.CoverageGroup
    criteria.LocSearchCriteria.LOBs = this.Branch.LinePatterns
    return criteria
  }
  
  function distanceToLocationRisk(locRisk : LocationRisk, units : UnitOfDistance) : BigDecimal {
    var millis = GeodataUtils.getGCDistanceInMillimeters(this.AccountLocation, locRisk.AccountLocation)
    return GeodataUtils.convertExactDistanceFromMillimeters(units, millis)
  } 
}
