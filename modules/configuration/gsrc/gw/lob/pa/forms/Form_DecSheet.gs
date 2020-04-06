package gw.lob.pa.forms
uses gw.forms.FormInferenceContext
uses gw.xml.XMLNode
uses java.util.ArrayList
uses java.util.Set

@Export
class Form_DecSheet extends PAFormData
{
  var _namedInsureds : List<String>
  var _vehicles : List<PersonalVehicle>  
  var _drivers : List<PolicyDriver>
  var _liabilityCov : PALiabilityCov
  var _medPaymentCov : PAMedPayCov
  var _valueForBoolean : String
  var _UMBICov : PAUMBICov
  var _UMPDCov : PAUMPDCov
  var _paymentPlanName : String
  var _paymentPlanPayments: String
  var _depositCollected : String
  var _totalPremium : String
  var _totalTax : String
  var _totalCost : String
  var _transactionCost : String
  

  override function populateInferenceData( context: FormInferenceContext, specialCaseStates: Set<Jurisdiction> ) : void {
    var paLine = context.Period.PersonalAutoLine
    
    // Create a list of the named insured names
    var namedInsuredsSet = context.Period.PolicyLocations*.LocationNamedInsureds*.NamedInsured*.AccountContactRole*.AccountContact*.Contact*.DisplayName.toSet()
    namedInsuredsSet.addAll( context.Period.NamedInsureds*.DisplayName.toSet() )
    _namedInsureds = namedInsuredsSet.toList().sort()
    
    // Create lists for the drivers and vehicles
    _drivers = (paLine.PolicyDrivers as List<PolicyDriver>).sortBy( \ d -> d.DisplayName )
    _vehicles = (paLine.Vehicles as List<PersonalVehicle>).sortBy( \ v -> v.DisplayName )
    
    // Create line-level coverages
    _liabilityCov = paLine.PALiabilityCov
    _medPaymentCov = paLine.PAMedPayCov
    _UMBICov = paLine.PAUMBICov
    _UMPDCov = paLine.PAUMPDCov

    // Get the important payment and financial information
    var period = paLine.Branch
    var paymentPlan = period.SelectedPaymentPlan
    _paymentPlanName = paymentPlan.Name
    _paymentPlanPayments = paymentPlan == null ? null : paymentPlan.NumberOfPayments as String
    _depositCollected = period.DepositCollected as String
    _totalPremium = period.TotalCostRPT as String
    _totalTax = period.AllCosts.TaxSurcharges.AmountSum(period.PreferredSettlementCurrency).Amount as String
    _totalCost = period.TotalCostRPT as String
    _transactionCost = period.TransactionCostRPT as String
  }
  
  override property get InferredByCurrentData() : boolean {
    //  A new dec sheet is always added any time inference is called
    return true
  }

  override function addDataForComparisonOrExport( contentNode: XMLNode ) : void {
    // Add the named insured as a simple list of names
    contentNode.addChild( createScheduleNode( "NamedInsureds", "NamedInsured", _namedInsureds ) )

    // Add the drivers  
    var allDriversNode = new XMLNode( "Drivers" )
    var driverNodes = new ArrayList() as List<XMLNode>
    for ( driver in _drivers ) {
      var driverNode = new XMLNode( "Driver" )
      var accountDriverRole = driver.AccountContactRole as Driver
      var driverPerson = accountDriverRole.AccountContact.Contact as Person
      driverNode.Text = accountDriverRole.AccountContact.Contact.DisplayName
      driverNode.setAttributeValue( "YearLicensed", accountDriverRole.YearLicensed as String )
      driverNode.setAttributeValue( "Violations", accountDriverRole.NumberofViolations.DisplayName )
      driverNode.setAttributeValue( "Accidents", accountDriverRole.NumberofAccidents.DisplayName )
      driverNode.setAttributeValue( "GDD", driver.ApplicableGoodDriverDiscount as String )
      driverNode.setAttributeValue( "Married", driver.MaritalStatus.DisplayName )
      driverNode.setAttributeValue( "Gender", driverPerson.Gender.DisplayName )
      driverNodes.add( driverNode )
    }
    allDriversNode.addAllChildren( driverNodes )
    contentNode.addChild( allDriversNode )

    // Add the vehicles
    var allVehiclesNode = new XMLNode( "Vehicles")
    var vehicleNodes = new ArrayList() as List<XMLNode>
    for ( vehicle in _vehicles ) {
      var vehicleNode = new XMLNode( "Vehicle" )
      
      // Add the vehicle basics
      vehicleNode.Text = vehicle.DisplayName
      vehicleNode.setAttributeValue( "Year", vehicle.Year as String )
      vehicleNode.setAttributeValue( "Make", vehicle.Make )
      vehicleNode.setAttributeValue( "Model", vehicle.Model )
      vehicleNode.setAttributeValue( "VIN", vehicle.Vin )
      vehicleNode.setAttributeValue( "AnnualMileage", vehicle.AnnualMileage as String )
      vehicleNode.setAttributeValue( "GarageZip", vehicle.GarageLocation.PostalCode )
      vehicleNode.setAttributeValue( "PrimaryUse", vehicle.PrimaryUse.DisplayName )
       
      // Add the vehicle coverages and their costs.  
      var covNode = new XMLNode( "Coverages" )
      if ( vehicle.PATowingLaborCovExists ) {
        // this has no terms, so the coverages existence is recorded
        var towNode = new XMLNode( "VehicleCov" )
        towNode.Text = vehicle.PATowingLaborCov.Pattern.Name
        if ( vehicle.PATowingLaborCov.Costs.Count > 0 ) {
          towNode.setAttributeValue( "Premium", vehicle.PATowingLaborCov.Costs[0].ActualTermAmount as String )
        }
        covNode.addChild( towNode )
      }
      if ( vehicle.PAExcessElectronicsCovExists ) {
        var electronicsNode = new XMLNode( "VehicleCov" )
        // For an option term, the option description is probably best to print
        electronicsNode.Text = vehicle.PAExcessElectronicsCov.Pattern.Name
        electronicsNode.setAttributeValue( "Limit", vehicle.PAExcessElectronicsCov.PAExcessElectronicsLimitTerm.OptionValue.Description )
        if (vehicle.PAExcessElectronicsCov.Costs.Count > 0 ) {
          electronicsNode.setAttributeValue( "Premium", vehicle.PAExcessElectronicsCov.Costs[0].ActualTermAmount as String )
        }
        covNode.addChild( electronicsNode )
      }      
      if ( vehicle.PARentalCovExists ) {
        var rentalNode = new XMLNode( "VehicleCov" )
        // For a vehicle-level package term, the package description is probably best to print
        rentalNode.Text = vehicle.PARentalCov.Pattern.Name
        rentalNode.setAttributeValue( "Package", vehicle.PARentalCov.PARentalTerm.PackageValue.Description )
        if ( vehicle.PARentalCov.Costs.Count > 0 ) {
          rentalNode.setAttributeValue( "Premium", vehicle.PARentalCov.Costs[0].ActualTermAmount as String )
        }
        covNode.addChild( rentalNode )
      }
      if ( vehicle.PATapeDiscMediaCovExists ) {
        var mediaNode = new XMLNode( "VehicleCov" )
        mediaNode.Text = vehicle.PATapeDiscMediaCov.Pattern.Name
        mediaNode.setAttributeValue( "Limit", vehicle.PATapeDiscMediaCov.PATapeDiscMediaLimitTerm.OptionValue.Description )
        if ( vehicle.PATapeDiscMediaCov.Costs.Count > 0 ) {
          mediaNode.setAttributeValue( "Premium", vehicle.PATapeDiscMediaCov.Costs[0].ActualTermAmount as String )
        }
        covNode.addChild( mediaNode )
      }
      if ( vehicle.PAComprehensiveCovExists ) {
        var comprehensiveNode = new XMLNode( "VehicleCov" )
        comprehensiveNode.Text = vehicle.PAComprehensiveCov.Pattern.Name
        comprehensiveNode.setAttributeValue( "Deductible", vehicle.PAComprehensiveCov.PACompDeductibleTerm.OptionValue.Description )
        _valueForBoolean = "No"
        if (vehicle.PAComprehensiveCov.PACompZeroGlassTerm.Value) {_valueForBoolean = "Yes"}
        comprehensiveNode.setAttributeValue( "GlassDeductible", _valueForBoolean )
        if ( vehicle.PAComprehensiveCov.Costs.Count > 0 ) {
          comprehensiveNode.setAttributeValue( "Premium", vehicle.PAComprehensiveCov.Costs[0].ActualTermAmount as String )
        }
        covNode.addChild( comprehensiveNode )
      }
      if ( vehicle.PACollisionCovExists ) {
        var collisionNode = new XMLNode( "VehicleCov" )
        collisionNode.Text = vehicle.PACollisionCov.Pattern.Name
        collisionNode.setAttributeValue( "Deductible", vehicle.PACollisionCov.PACollDeductibleTerm.OptionValue.Description )
       // collisionNode.setAttributeValue( "TRUE", vehicle.PACollisionCov.PACollisionBroadTerm.DisplayValue )
        if ( vehicle.PACollisionCov.Costs.Count > 0 ) {
          collisionNode.setAttributeValue( "Premium", vehicle.PACollisionCov.Costs[0].ActualTermAmount as String )
        }
        covNode.addChild( collisionNode )
      }
      
      // Now add on the per-vehicle premium information for the line-level coverages
      if ( _liabilityCov != null ) {
        var lineCovNode = new XMLNode( "LineCov" )
        lineCovNode.Text = _liabilityCov.Pattern.Name
        for ( cost in _liabilityCov.Costs ) {
          if ( cost.Vehicle == vehicle ) {
            lineCovNode.setAttributeValue( "Premium", cost.ActualTermAmount as String )
            break
          }
        }
        covNode.addChild( lineCovNode )
      }               
 
      if ( _UMBICov != null ) {
        var lineCovNode = new XMLNode( "LineCov" )
        lineCovNode.Text = _UMBICov.Pattern.Name
        for ( cost in _UMBICov.Costs ) {
          if ( cost.Vehicle == vehicle ) {
            lineCovNode.setAttributeValue( "Premium", cost.ActualTermAmount as String )
            break
          }
        }
        covNode.addChild( lineCovNode )
      } 

      if ( _UMPDCov != null ) {
        var lineCovNode = new XMLNode( "LineCov" )
        lineCovNode.Text = _UMPDCov.Pattern.Name
        for ( cost in _UMPDCov.Costs ) {
          if ( cost.Vehicle == vehicle ) {
            lineCovNode.setAttributeValue( "Premium", cost.ActualTermAmount as String )
            break
          }
        }
        covNode.addChild( lineCovNode )
      } 

      if ( _medPaymentCov != null ) {
        var lineCovNode = new XMLNode( "LineCov" )
        lineCovNode.Text = _medPaymentCov.Pattern.Name
        for ( cost in _medPaymentCov.Costs ) {
          if ( cost.Vehicle == vehicle ) {
            lineCovNode.setAttributeValue( "Premium", cost.ActualTermAmount as String )
            break
          }
        }
        covNode.addChild( lineCovNode )
      } 
     
      vehicleNode.addChild( covNode )
      vehicleNodes.add( vehicleNode )
    }
    allVehiclesNode.addAllChildren( vehicleNodes )
    contentNode.addChild( allVehiclesNode )

    // Create a separate node for the line coverages and costs
    var lineCoveragesNode = new XMLNode( "Coverages")
    
    // Liability Coverage - for this package term, there should be separate attributes for each item the package
    // because the package description is not informative enough
    if ( _liabilityCov != null ) {
      var liabilityNode = new XMLNode( "LineCov" )
      liabilityNode.Text = _liabilityCov.Pattern.Name
      _liabilityCov.PALiabilityTerm.PackageValue.PackageTerms.each( \ p -> liabilityNode.setAttributeValue( p.Name, p.Value as String ) )
      lineCoveragesNode.addChild( liabilityNode )
    }

    // Uninsured Motorist Bodily Injury Coverage - this follows the same pattern as liability coverage
    if ( _UMBICov != null ) {
      var umbiNode = new XMLNode( "LineCov" )
      umbiNode.Text = _UMBICov.Pattern.Name
      _UMBICov.PAUMBITerm.PackageValue.PackageTerms.each( \ p -> umbiNode.setAttributeValue( p.Name, p.Value as String ) )
      lineCoveragesNode.addChild( umbiNode )
    }
  
    // Uninsured Motorist Property Damage coverage
    if ( _UMPDCov != null ) {
      var umpdNode = new XMLNode( "LineCov" ) 
      umpdNode.Text = _UMPDCov.Pattern.Name
      umpdNode.setAttributeValue( "Limit", _UMPDCov.PAUMPDLimitTerm.OptionValue.Description )
      lineCoveragesNode.addChild( umpdNode )
    }
      
    // Medical Payments coverage
    if ( _medPaymentCov != null ) {
      var medPaymentsNode = new XMLNode( "LineCov" )
      medPaymentsNode.Text = _medPaymentCov.Pattern.Name
      medPaymentsNode.setAttributeValue( "Limit", _medPaymentCov.PAMedLimitTerm.OptionValue.Description )
      _valueForBoolean = "No"
      if (_medPaymentCov.PAMedPayCoordinateBeneTerm.Value) {_valueForBoolean = "Yes"}
      medPaymentsNode.setAttributeValue( "CoordinateBenefits", _valueForBoolean )
      lineCoveragesNode.addChild( medPaymentsNode )
    }
    contentNode.addChild( lineCoveragesNode )
      
    // Add the total change in premium if this is a change.  (Total premium owed/credited.)
    var totalPremiumNode = new XMLNode( "PremiumTotals" )
    totalPremiumNode.setAttributeValue( "TotalPremium", _totalPremium )
    totalPremiumNode.setAttributeValue( "TotalTax", _totalTax )
    totalPremiumNode.setAttributeValue( "TotalCost", _totalCost )
    totalPremiumNode.setAttributeValue( "TransactionCost", _transactionCost )
    contentNode.addChild( totalPremiumNode )
      
    // Add the payment information
    var paymentNode = new XMLNode( "PaymentInfo" )
    paymentNode.setAttributeValue( "PaymentPlanName", _paymentPlanName )
    paymentNode.setAttributeValue( "Installments", _paymentPlanPayments )
    paymentNode.setAttributeValue( "Deposit", _depositCollected )
    contentNode.addChild( paymentNode )
  }
}
