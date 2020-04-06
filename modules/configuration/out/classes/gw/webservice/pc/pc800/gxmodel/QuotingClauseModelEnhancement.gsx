package gw.webservice.pc.pc800.gxmodel

uses gw.api.domain.Clause

uses java.lang.IllegalArgumentException
uses gw.api.productmodel.CovTermPatternLookup

enhancement QuotingClauseModelEnhancement : gw.webservice.pc.pc800.gxmodel.quotingclausemodel.types.complex.Clause {
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
