package gw.api.databuilder.pa

uses entity.PersonalAutoLine
uses entity.PersonalVehicle
uses gw.api.builder.CoverageBuilder
uses gw.api.builder.PolicyLocationBuilder
uses gw.api.databuilder.BuilderContext
uses gw.api.databuilder.DataBuilder
uses gw.api.databuilder.populator.BeanPopulator
uses gw.plugin.vin.IVinPlugin
uses typekey.VehicleType
uses java.lang.Exception
uses java.lang.Integer
uses java.math.BigDecimal
uses gw.entity.IArrayPropertyInfo
uses gw.api.builder.BuilderArrayPopulator
uses gw.plugin.Plugins
uses gw.api.util.Math
uses gw.pl.currency.MonetaryAmount
uses gw.api.util.CurrencyUtil

/**
 * @author dpetrusca
 */
@Export
class PAVehicleBuilder extends DataBuilder<PersonalVehicle, PAVehicleBuilder> {

  var _createCoverages : boolean = true
  static final var CURRENCY_PRIORITY = -2
  static final var AFTER_CURRENCY_PRIORITY = CURRENCY_PRIORITY + 1

  construct() {
    super(PersonalVehicle)
    withVIN("1")
    withType("auto")
    withLicenseState(State.TC_CA)

    addPopulator(AFTER_CURRENCY_PRIORITY, new BeanPopulator<PersonalVehicle>() {
      public override function execute(vehicle : PersonalVehicle) {
        vehicle.CostNew = 1000bd.ofCurrency(vehicle.PreferredCoverageCurrency)
        if (_createCoverages) {
          vehicle.createCoverages()
        }
      }
    })

    addPopulator(Integer.MAX_VALUE, new BeanPopulator<PersonalVehicle>() {
      public override function execute(vehicle : PersonalVehicle) {
        var period = vehicle.PolicyLine.Branch
        if (vehicle.GarageLocation == null) {
          vehicle.GarageLocation = period.PrimaryLocation
        }
        if (vehicle.Vin != null) {
          try {
            var plugin = Plugins.get(IVinPlugin)
            var vehicleInfo = plugin.getVehicleInfo(vehicle.Vin)
            if (vehicleInfo != null) {
              if (vehicle.Make == null) {
                vehicle.Make = vehicleInfo.Make
              }
              if (vehicle.Model == null) {
                vehicle.Model = vehicleInfo.Model
              }
              if (vehicle.Color == null) {
                vehicle.Color = vehicleInfo.Color
              }
              if (vehicle.Year == null) {
                vehicle.Year = vehicleInfo.Year
              }
            }
          } catch (e : Exception) {
            gw.api.system.PCLoggerCategory.BUILDER.error("Exception while accessing IVinPlugin from PAVehicleBuilder", e)
          }
        }
        vehicle.updateModifiers()
      }
    })
  }

  protected override function createBean(context : BuilderContext) : PersonalVehicle {
    var line = context.ParentBean as entity.PersonalAutoLine
    var vehicle = line.createAndAddVehicle()
    return vehicle
  }

  function withCoverage(coverageBuilder : CoverageBuilder) : PAVehicleBuilder {
    addAdditiveArrayElement(PersonalVehicle.Type.TypeInfo.getProperty("COVERAGES"), coverageBuilder)
    return this
  }

  final function withVIN(vin : String) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("VIN"), vin)
    return this
  }

  function withYear(year : int) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("YEAR"), year)
    return this
  }

  public function withCost(cost : BigDecimal): PAVehicleBuilder {
    return withCostNew(cost)
  }
  
  final function withCostNew(costNew : MonetaryAmount) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("COSTNEW"), costNew)
    return this
  }

  final function withCostNew(cost : BigDecimal) : PAVehicleBuilder {
    return withCostNew(cost?.ofDefaultCurrency())
  }

  final function withCostNew(cost : double) : PAVehicleBuilder {
    return withCostNew(BigDecimal.valueOf(cost))
  }


  final function withType(type : VehicleType) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("VEHICLETYPE"), type)
    return this
  }

  final function withLicenseState(state : State) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("LICENSESTATE"), state)
    return this
  }

  function withLocation(policyLocationBuilder : PolicyLocationBuilder): PAVehicleBuilder {
    addPopulator(new GarageLocationPopulator(policyLocationBuilder))
    return this
  }
  function garagedAt(policyLocationBuilder : PolicyLocationBuilder): PAVehicleBuilder {
    return withLocation(policyLocationBuilder)
  }

  function withColor(aColor : String) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("Color"), aColor)
    return this
  }

  function asPrivatePassenger(): PAVehicleBuilder {
      withType(TC_AUTO)
      return this
  }

  function asOtherVehicle() : PAVehicleBuilder {
    withType(TC_OTHER)
    return this
  }

  function withRandomLocation(): PAVehicleBuilder {
    addPopulator(60, new BeanPopulator<PersonalVehicle>() {
      public override function execute(bean : PersonalVehicle) {
        final var locations : PolicyLocation[] = bean.PolicyLine.Branch.PolicyLocations
        final var location : PolicyLocation = locations[Math.random(locations.Count)]
        bean.GarageLocation = location
      }
    })
    return this
  }

  function withLocationAtIndex(ind : int) : PAVehicleBuilder {
    addPopulator(60, new BeanPopulator<PersonalVehicle>() {
      public override function execute(bean : PersonalVehicle) {
        final var locations : PolicyLocation[] = bean.PolicyLine.Branch.PolicyLocations
        final var location : PolicyLocation = locations[ind]
        bean.GarageLocation = location
      }
    })
    return this
  }

  function withVehicleDriver(vehicleDriverBuilder : VehicleDriverBuilder) : PAVehicleBuilder {
    addPopulator(new BuilderArrayPopulator(PersonalVehicle.Type.TypeInfo.getProperty("Drivers") as IArrayPropertyInfo, vehicleDriverBuilder))
    return this
  }

  function withPAVehicleAdditionalInterest(addInterestBuilder : PAVehicleAdditionalInterestBuilder) : PAVehicleBuilder {
    addPopulator(new BuilderArrayPopulator(PersonalVehicle.Type.TypeInfo.getProperty("AdditionalInterests") as IArrayPropertyInfo, addInterestBuilder))
    return this
  }

  function dontCreateCoverages() : PAVehicleBuilder {
    _createCoverages = false
    return this
  }
  
  function withQuickQuoteNumber(num : int) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("QuickQuoteNumber"), num)
    return this    
  }

  function withPAVehicleModifier(paVehicleModifier : PAVehicleModifierBuilder) : PAVehicleBuilder {
    addAdditiveArrayElement(PersonalVehicle.Type.TypeInfo.getProperty("PAVehicleModifiers"), paVehicleModifier)
    return this
  }

  function withMake(make : String) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("Make"), make)
    return this
  }
  
  function withModel(model : String) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("Model"), model)
    return this
  }
  
  function withBodyType(bodyType : BodyType) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("BodyType"), bodyType)
    return this
  }
  
  function withLicensePlate(licensePlate : String) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("LicensePlate"), licensePlate)
    return this
  }

  function withStatedValue(statedValue : double) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("StatedValue"), BigDecimal.valueOf(statedValue).ofDefaultCurrency())
    return this
  }
  
  function withStatedValue(statedValue : MonetaryAmount) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("StatedValue"), statedValue)
    return this
  }
  
  function withLeaseOrRent(leaseOrRent : boolean) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("LeaseOrRent"), leaseOrRent)
    return this
  }
  
  function withLengthOfLease(lengthOfLease : LengthOfLease) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("LengthOfLease"), lengthOfLease)
    return this
  }
  
  function withAnnualMileage(annualMileage : int) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("AnnualMileage"), annualMileage)
    return this
  }
  
  function withCommutingMiles(commutingMiles : int) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("CommutingMiles"), commutingMiles)
    return this
  }
  
  function withPrimaryUse(primaryUse : VehiclePrimaryUse) : PAVehicleBuilder {
    set(PersonalVehicle.Type.TypeInfo.getProperty("PrimaryUse"), primaryUse)
    return this
  }

  function withCurrency(currency : Currency) : PAVehicleBuilder {
    set(CURRENCY_PRIORITY, PersonalVehicle#PreferredCoverageCurrency, currency)
    return this
  }

}
