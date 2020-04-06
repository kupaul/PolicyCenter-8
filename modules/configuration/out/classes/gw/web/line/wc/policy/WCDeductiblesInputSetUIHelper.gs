package gw.web.line.wc.policy

@Export
class WCDeductiblesInputSetUIHelper {
  public static function getDeductibleTerms(jurisdiction : entity.WCJurisdiction) : productmodel.PackageWCDeductibleType[]{
    var coverages = jurisdiction.VersionList.Coverages
    if(coverages.Count == 0){
      return new productmodel.PackageWCDeductibleType[0]
    }
    return coverages.first().AllVersions
        .sortBy( \ w -> w.EffectiveDate )
        .map( \ w -> (w.getSlice( w.EffectiveDate ) as productmodel.WCWorkCompDeductCov).WCDeductibleTerm )
        .toTypedArray()
  }

  public static function getIndexes(jurisdiction : entity.WCJurisdiction) : java.lang.Integer[]{
    var coverages = jurisdiction.VersionList.Coverages
    var numberOfCoverage = coverages.Count == 0 ? 0 : coverages.first().AllVersions.size()
    var numbers = new java.lang.Integer[numberOfCoverage]
    for(i in 0..|numberOfCoverage){
      numbers[i] = i
    }
    return numbers
  }

  public static function getLabel( jurisdiction : entity.WCJurisdiction, deductibleTermPattern : gw.api.productmodel.CovTermPattern, i : int) : String{
    var indexes = getIndexes(jurisdiction)
    if(indexes.length == 1){
      return deductibleTermPattern.DisplayName
    }
    return displaykey.Web.Policy.WC.PeriodDeductible(i + 1, deductibleTermPattern.DisplayName)
  }
}