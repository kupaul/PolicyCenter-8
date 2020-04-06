package gw.job.sxs

uses gw.api.domain.covterm.CovTerm
uses gw.api.domain.covterm.DirectCovTerm
uses gw.api.domain.covterm.GenericCovTerm
uses gw.api.domain.covterm.OptionCovTerm
uses gw.api.domain.covterm.PackageCovTerm
uses gw.api.domain.covterm.TypekeyCovTerm
uses gw.api.productmodel.CovTermOpt
uses gw.api.productmodel.CovTermPack
uses gw.api.productmodel.CovTermPattern
uses gw.entity.TypeKey

uses java.math.BigDecimal
uses java.lang.IllegalStateException
uses java.util.Collections

/**
 * Used to store coverage term related information for use in the SideBySide UI screens.
 */
@Export
class SideBySideCovTermInfo {
  var _covInfo : SideBySideCoverageInfo as readonly CovInfo
  var _covTermPattern : CovTermPattern as readonly CovTermPattern
  var _covTerm : CovTerm as readonly CovTerm
  var _coverage : Coverage
  var _alwaysPostOnChange : boolean as AlwaysPostOnChange

  var _availCovTermPacks : List<CovTermPack>
  var _availCovTermOpts : List<CovTermOpt>
  var _availTypeKeys : List<TypeKey>

  construct(coverageInfo : SideBySideCoverageInfo, coverageTerm : CovTermPattern) {
    this(coverageInfo, coverageTerm, false)
  }

  construct(coverageInfo : SideBySideCoverageInfo, coverageTerm : CovTermPattern, postOnChange : boolean) {
    _covInfo = coverageInfo
    _covTermPattern = coverageTerm
    _coverage = _covInfo.Coverage
    if (_coverage != null and _covTermPattern != null) {
      _covTerm = _coverage.getCovTerm(CovTermPattern)
    }
    _alwaysPostOnChange = postOnChange
  }


  /**
   * Open for edit the period associated to this cov term if it's QUOTED
   */
  function editAssociatedPeriodIfQuoted() {
    CovInfo.PeriodInfo.Period.editIfQuoted()
  }

  property get CovTerm() : CovTerm {
    // Coverage may be evicted from the bundle before validation is called:
    // check to make sure the backing coverage is still available in the bundle
    // before returning the coverage term else return null.
    if (_coverage == null or _coverage.Bundle == null) {
      return null
    } else if (_covTerm != null) {
      return _covTerm
    } else if (CovTermPattern == null) {
      return null
    } else {
      return _coverage.getCovTerm(CovTermPattern)
    }
  }

  property get BooleanValue() : Boolean {
    return getValue<Boolean>()
  }

  property set BooleanValue(val : Boolean) {
    setValue<Boolean>(val)
  }

  property get DateValue() : DateTime {
    return getValue<DateTime>()
  }

  property set DateValue(val : DateTime) {
    setValue<DateTime>(val)
  }

  property get StringValue() : String {
    return getValue<String>()
  }

  property set StringValue(val : String) {
    setValue<String>(val)
  }

  private function getValue<V>() : V {
    if (CovTerm == null) {
      return null
    }
    if (CovTerm typeis GenericCovTerm<V>) {
      return CovTerm.Value
    } else {
      var typeName = V.Type.RelativeName
      throw new IllegalStateException("CovTerm must be a non-null GenericCovTerm<" + typeName +">.")
    }
  }

  private function setValue<V>(val : V) {
    if (CovTerm typeis GenericCovTerm<V>) {
      CovTerm.Value = val
    } else {
      var typeName = V.Type.RelativeName
      throw new IllegalStateException("CovTerm must be a non-null GenericCovTerm<" + typeName +">.")
    }
  }

  property get DefaultValue() : Object {
    if (CovTerm == null) {
      return null
    }
    return CovTerm.ValueAsString
  }

  property set DefaultValue(obj : Object) {
    CovTerm.setValueFromString(obj as java.lang.String)
  }

  property get DirectValue() : BigDecimal {
    if (CovTerm == null) {
      return null
    }
    if (CovTerm typeis DirectCovTerm) {
      return CovTerm.Value
    } else {
      throw new IllegalStateException("CovTerm must be a non-null DirectCovTerm.")
    }
  }

  property set DirectValue(val : BigDecimal) {
    if (CovTerm typeis DirectCovTerm) {
      CovTerm.Value = val
    } else {
      throw new IllegalStateException("CovTerm must be a non-null DirectCovTerm.")
    }
  }

  property get PackageValue() : CovTermPack {
    if (CovTerm == null) {
      return null
    }
    if (CovTerm typeis PackageCovTerm) {
      return CovTerm.PackageValue
    } else {
      throw new IllegalStateException("CovTerm must be a non-null PackageCovTerm.")
    }
  }

  property set PackageValue(pack : CovTermPack) {
    if (CovTerm typeis PackageCovTerm) {
      CovTerm.PackageValue = pack
    } else {
      throw new IllegalStateException("CovTerm must be a non-null PackageCovTerm.")
    }
  }

  property get OptionValue() : CovTermOpt {
    if (CovTerm == null) {
      return null
    }
    if (CovTerm typeis OptionCovTerm) {
      return CovTerm.OptionValue
    } else {
      throw new IllegalStateException("CovTerm must be a non-null OptionCovTerm.")
    }
  }

  property set OptionValue(option : CovTermOpt) {
    if (CovTerm typeis OptionCovTerm) {
      CovTerm.OptionValue = option
    } else {
      throw new IllegalStateException("CovTerm must be a non-null OptionCovTerm.")
    }
  }

  property get TypekeyValue() : TypeKey {
    if (CovTerm == null) {
      return null
    }
    if (CovTerm typeis TypekeyCovTerm) {
      return CovTerm.Value
    } else {
      throw new IllegalStateException("CovTerm must be a non-null TypekeyCovTerm.")
    }
  }

  property set TypekeyValue(typekey : TypeKey) {
    if (CovTerm typeis TypekeyCovTerm) {
      CovTerm.Value = typekey
    } else {
      throw new IllegalStateException("CovTerm must be a non-null TypekeyCovTerm.")
    }
  }

  property get RangeValue() : Object {
    if (CovTerm == null) {
      return null
    }
    var value : Object = null
    if (CovTerm typeis PackageCovTerm) {
      value = CovTerm.PackageValue
    } else if (CovTerm typeis OptionCovTerm) {
      value = CovTerm.OptionValue
    } else if (CovTerm typeis TypekeyCovTerm) {
      value = CovTerm.Value
    } else {
      throw new IllegalStateException("CovTerm must have an ordered list of available values")
    }
    if (value == null and CovTermPattern.Required) {
      value = OrderedAvailableValues.first() 
      RangeValue = value
    }
    return value
  }

  property set RangeValue(val : Object) {
    if (CovTerm typeis PackageCovTerm and (val typeis CovTermPack or val == null)) {
      if (val typeis CovTermPack) {
        CovTerm.PackageValue = val    
      } else {
        CovTerm.PackageValue = null  
      }
    } else if (CovTerm typeis OptionCovTerm and (val typeis CovTermOpt or val == null)) {
      if (val typeis CovTermOpt) {
        CovTerm.OptionValue = val        
      } else {
        CovTerm.OptionValue = null
      }
    } else if (CovTerm typeis TypekeyCovTerm and (val typeis TypeKey or val == null)) {
      if (val typeis TypeKey) {
        CovTerm.Value = val  
      } else {
        CovTerm.Value = null 
      }
    } else {
      throw new IllegalStateException("CovTerm must have an ordered list of available values")
    }
  }

  property get OrderedAvailableValues() : List {
    if (CovTerm == null) {
      return Collections.emptyList()
    }
    if (CovTerm typeis PackageCovTerm) {
      return CovTerm.Pattern.getOrderedAvailableValues(CovTerm)
    } else if (CovTerm typeis OptionCovTerm) {
      return CovTerm.Pattern.getOrderedAvailableValues(CovTerm)
    } else if (CovTerm typeis TypekeyCovTerm) {
      return CovTerm.Pattern.getOrderedAvailableValues()
    } else {
      throw new IllegalStateException("CovTerm must have an ordered list of available values")
    }
  }

  property get AvailablePackages() : List<CovTermPack> {
    if (CovTerm == null) {
      return Collections.emptyList()
    }
    if (CovTerm typeis PackageCovTerm) {
      if (_availCovTermPacks == null) {
        _availCovTermPacks = CovTerm.Pattern.getOrderedAvailableValues(CovTerm)
      }
      return _availCovTermPacks
    } else {
      throw new IllegalStateException("CovTerm must be a non-null PackageCovTerm.")
    }
  }

  property get AvailableOptions() : List<CovTermOpt> {
    if (CovTerm == null) {
      return Collections.emptyList()
    }
    // We won't be able to cache these if the availability of options can change on the Side-by-Side page.
    if (CovTerm typeis OptionCovTerm) {
      if (_availCovTermOpts == null) {
        _availCovTermOpts = CovTerm.Pattern.getOrderedAvailableValues(CovTerm)
      }
      return _availCovTermOpts
    } else {
      throw new IllegalStateException("CovTerm must be a non-null OptionCovTerm.")
    }
  }

  property get AvailableTypekeys() : List<TypeKey> {
    // We won't be able to cache these if the availability of typekeys can change on the Side-by-Side page.
    if (CovTerm typeis TypekeyCovTerm) {
      if (_availTypeKeys == null) {
        _availTypeKeys = CovTerm.Pattern.getOrderedAvailableValues()
      }
      return _availTypeKeys
    } else {
      throw new IllegalStateException("CovTerm must be a non-null TypekeyCovTerm.")
    }
  }

  property get Editable() : boolean {
    if (CovInfo.Selected and CovTerm != null) {
      if (CovTerm typeis PackageCovTerm) {
        var availableValues = AvailablePackages
        if (availableValues.Count == 1) {
          PackageValue = AvailablePackages[0]
        }
        return availableValues.Count > 1
      } else if (CovTerm typeis OptionCovTerm) {
        var availableValues = AvailableOptions
        if (availableValues.Count == 1) {
          OptionValue = availableValues[0]
        }
        return availableValues.Count > 1
      } else if (CovTerm typeis TypekeyCovTerm) {
        var availableValues = AvailableTypekeys
        if (availableValues.Count == 1) {
          TypekeyValue = availableValues[0]
        }
        return availableValues.Count > 1
      } else {
        return true
      }
    } else {
      return false
    }
  }

  property get AssociatedPeriodQuoted() : boolean {
    return CovInfo.AssociatedPeriodQuoted
  }

  property get Mode() : String {
    switch(CovTermPattern.ValueTypeName) {
      case "Option":
      case "Package":
      case "Typekey":
        if (CovTermPattern.Required) {
          return "range_required"
        } else {
          return "range"    
        }
      default:
        // It needs to return "default" and not null for default mode because it might be a "no target" post on change
        // which means the mode would be constructed as "default_notarget".
        return CovTermPattern.ValueTypeName == null ? "default" : CovTermPattern.ValueTypeName
    }
  }

  /**
   * Get the mode for either targeted or no targeted post on change. We have to use two pcf's for each data type
   * (e.g.: bit, datetime, range, etc.) One for targeted and the other for no targeted post on change.
   * Currently, Pebbles doesn't supported making targeted vs. no targeted post on change conditional. Once it is
   * supported, we can just have one pcf per data type, hence no need for have two modes.
   */
  function getPostOnChangeMode(lineCovSet : SideBySideCoverageSet) : String {
    if (AssociatedPeriodQuoted or AlwaysPostOnChange
        or not lineCovSet.AdditionalCovTermRows.IsEmpty) {
      return Mode + "_notarget"
    } else {
      return Mode
    }
  }
}
