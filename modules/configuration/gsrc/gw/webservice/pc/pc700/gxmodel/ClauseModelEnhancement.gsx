package gw.webservice.pc.pc700.gxmodel
uses gw.api.domain.Clause
uses java.lang.IllegalArgumentException
uses gw.api.productmodel.CovTermPatternLookup

@Deprecated("As of 8.0 use gw.webservice.pc.pc800.gxmodel.ClauseModelEnhancement instead")
enhancement ClauseModelEnhancement : gw.webservice.pc.pc700.gxmodel.clausemodel.types.complex.Clause {
  function populateCoverage(cov : Clause){
    for(ct in this.CovTerms.Entry){
      var pattern = CovTermPatternLookup.getByCode(ct.PatternCode)
      if(pattern == null){
        throw new IllegalArgumentException("Invalid coverage term pattern :" + ct.PatternCode)
      }
      var covTerm = cov.getCovTerm(pattern)
      if(covTerm == null){
        throw new IllegalArgumentException("Coverage ${cov.Pattern.Code} does not have cov term: ${ct.PatternCode}")
      }
      covTerm.setValueFromString(ct.DisplayValue)
    }
  }
}
