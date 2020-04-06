package gw.api.databuilder.ba

uses gw.api.builder.CoverageBuilder
uses gw.api.builder.PolicyLocationBuilder
uses gw.api.databuilder.BuilderContext
uses gw.api.databuilder.DataBuilder
uses gw.api.databuilder.populator.BeanPopulator
uses gw.plugin.vin.IVinPlugin
uses java.lang.Exception
uses java.lang.Integer
uses java.lang.IllegalStateException
uses java.lang.RuntimeException
uses java.math.BigDecimal
uses java.util.concurrent.atomic.AtomicInteger
uses gw.entity.IArrayPropertyInfo
uses gw.api.builder.BuilderArrayPopulator
uses gw.plugin.Plugins
uses gw.pl.currency.MonetaryAmount
uses gw.api.util.CurrencyUtil

@Export
class BAVehicleBuilder extends DataBuilder<entity.BusinessVehicle, BAVehicleBuilder> {
  static var _vinCounter  = new AtomicInteger(1)
  var _vin : String
  var _make : String
  var _model : String
  var _color : String
  var _year : Integer
  
  construct() {
    super(BusinessVehicle)
    withVIN( "GenVin" + _vinCounter.AndIncrement )

    addPopulator(Integer.MAX_VALUE, new BeanPopulator<BusinessVehicle>() {
      override function execute(vehicle : BusinessVehicle) {
        var period = vehicle.BALine.Branch

        // put the vehicle on the primary location if it has a null location 
        if (vehicle.Location == null) {
          vehicle.Location = period.PrimaryLocation
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
            
            // override make, model, color and year if explicitly provided
            if (_make != null) {
              vehicle.Make = _make
            }
            if (_model != null) {
              vehicle.Model = _model
            }
            if (_color != null) {
              vehicle.Color = _color
            }
            if (_year != null) {
              vehicle.Year = _year
            }
            if (vehicle.CostNew == null) {
              vehicle.CostNew = 0bd.ofCurrency(period.PreferredCoverageCurrency)
            }
          } catch (e : Exception) {
            // no Vin plugin defined -- no need to populate other vehicle fields
          }
        }
      }
    })
  }
  
  protected override function createBean(context : BuilderContext) : BusinessVehicle {
    var line = context.ParentBean as BusinessAutoLine
    var vehicle = vehicleWithVin(line, _vin)
    if (vehicle == null) {
      vehicle = line.createAndAddBusinessVehicle()
      vehicle.Vin =_vin
    }
    return vehicle
  }
  
  private function vehicleWithVin(line : BusinessAutoLine, vin : String) : BusinessVehicle {
    var ret : BusinessVehicle = null
    for (vehicle in line.Vehicles) {
      if (vehicle.Vin == vin) {
        if (ret != null) {
          throw new IllegalStateException(displaykey.Builder.BusinessVehicle.Error.DuplicateVin(vin))
        }
        ret = vehicle
      }
    }
    return ret
  }
  
  function withCoverage(coverageBuilder : CoverageBuilder) : BAVehicleBuilder {
    addAdditiveArrayElement(BusinessVehicle.Type.TypeInfo.getProperty("Coverages"), coverageBuilder)
    return this
  }
  
  final function withVIN(vin : String) : BAVehicleBuilder {
    _vin = vin
    return this
  }

  function withMake(make:String) : BAVehicleBuilder {
    _make = make
    return this
  }

  function withModel(model:String) : BAVehicleBuilder {
    _model = model
    return this
  }
  
  function withMakeAndModel(make : String, model : String) : BAVehicleBuilder {
    _make = make
    _model = model
    return this
  }
  
  function withColor(color : String) : BAVehicleBuilder {
    _color = color
    return this
  }
  
  function withYear(year : Integer) : BAVehicleBuilder {
    _year = year
    return this
  }
  
  function withLocation(policyLocationBuilder : PolicyLocationBuilder) : BAVehicleBuilder {
    addPopulator(new EULocationPopulator(policyLocationBuilder))
    return this
  }
  
  class EULocationPopulator implements BeanPopulator<BusinessVehicle> {

    var _builder : PolicyLocationBuilder

    construct(builder : PolicyLocationBuilder) {
        this._builder = builder
    }

    override function execute(bean : BusinessVehicle) {
        var value = _builder.LastCreatedBean
        if (value == null) {
            throw new RuntimeException(displaykey.Builder.BusinessVehicle.EULocationBuilder.Error.CreateNotCalled(_builder.Class.Name))
        }
        bean.Location = value
    }
  }

  function withLicensePlate(licensePlate:String) : BAVehicleBuilder {
    set(BusinessVehicle#LicensePlate, licensePlate)
    return this
  }
  
  function withRadiusCode(radius : RadiusCode) : BAVehicleBuilder {
    set(BusinessVehicle#VehicleRadius, radius)
    return this
  }

  function withModifier(modifier : BusinessVehicleModifierBuilder) : BAVehicleBuilder {
    addAdditiveArrayElement(BusinessVehicle#BusinessVehicleModifiers, modifier)
    return this
  }
  

  function withYear(year : int) : BAVehicleBuilder {
    set(BusinessVehicle#Year, year)
    return this
  }
  
  function withVehicleType(type : VehicleType) : BAVehicleBuilder {
    set(BusinessVehicle#VehicleType, type)
    return this
  }
  
  function withCostNew(costNew : BigDecimal) : BAVehicleBuilder {
    return withCostNew(costNew?.ofDefaultCurrency())
  }
  
  function withCostNew(costNew : MonetaryAmount) : BAVehicleBuilder {
    set(BusinessVehicle#CostNew, costNew)
    return this
  }
  
  function asPrivatePassenger() : BAVehicleBuilder {
    set(BusinessVehicle#VehicleType, VehicleType.TC_PP)
    return this
  }
  
  function asPublicTransportation() : BAVehicleBuilder {
    set(BusinessVehicle#VehicleType, VehicleType.TC_PUBLICTRANSPORT)
    return this
  }
  
  function asSpecial() : BAVehicleBuilder {
    set(BusinessVehicle#VehicleType, VehicleType.TC_SPECIAL)
    return this
  }
  
  function asTrucksTractorsTrailers() : BAVehicleBuilder {
    set(BusinessVehicle#VehicleType, VehicleType.TC_COMMERCIAL)
    return this
  }
  
  function withClassCode(classCode : String) : BAVehicleBuilder {
    set(BusinessVehicle#VehicleClassCode, classCode)
    return this
  }
  
  function withBAVehicleAdditionalInterest(addInterestBuilder : BAVehicleAdditionalInterestBuilder) : BAVehicleBuilder {
    addPopulator(new BuilderArrayPopulator(BusinessVehicle.Type.TypeInfo.getProperty("AdditionalInterests") as IArrayPropertyInfo, addInterestBuilder))
    return this
  }

  function withCurrency(currency : Currency) : BAVehicleBuilder {
    set(BusinessVehicle#PreferredCoverageCurrency, currency)
    return this
  }
}
