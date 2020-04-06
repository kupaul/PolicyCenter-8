package gw.lob.gl
uses java.lang.Integer
uses java.util.Date
uses gw.api.util.JurisdictionMappingUtil

enhancement GLExposureEnhancement : entity.GLExposure {
  
  property get BasisAmount() : Integer {
    return (IsBasisScalable ? this.ScalableBasisAmount : this.FixedBasisAmount)
  }
  
  property get BasisForRating() : Integer {
    return (this.Branch.Job typeis Audit ? this.AuditedBasis : this.BasisAmount) 
  }
  
  property set BasisAmount(amount : Integer) {     
    if (amount < 0 or amount > Integer.MAX_VALUE) {
      throw new gw.api.util.DisplayableException(displaykey.Java.Validation.Number.Range.Closed(displaykey.Web.Policy.GL.ExposureUnits.Basis,
         0, Integer.MAX_VALUE))
    } else {
        if (IsBasisScalable) {
          this.ScalableBasisAmount = amount
        } else {
          this.FixedBasisAmount=amount 
        }
    }
    return    
  }
  
  property get EndOfCoverageDate()  : Date {
    var d = this.Branch.CancellationDate
    if (d == null) {
      d = this.ExpirationDate
    }
    return d
  }
  
  property get IsBasisScalable() : boolean {
    // note that null is converted to false
    return this.ClassCode.Basis.Auditable    
  }
  
  property get ClassCode() : GLClassCode {
    return this.getFieldValue("ClassCodeInternal") as GLClassCode  
  }
  
  property set ClassCode(code : GLClassCode) {
    var wasBasisScalable = this.IsBasisScalable
    this.setFieldValue( "ClassCodeInternal", code )
    
    // If we switched from being basis scalable to not, copy the value and then null out the inappropriate field
    if (wasBasisScalable != this.IsBasisScalable) {
      if (wasBasisScalable) {
        this.FixedBasisAmount = this.ScalableBasisAmount
        this.ScalableBasisAmount = null  
      } else {
        this.ScalableBasisAmount = this.FixedBasisAmount
        this.FixedBasisAmount = null
      }
    }
  }
  
  property get NewExposure() : boolean{
    return this.BasedOn == null
  }
  
  property get LocationWM(): PolicyLocation {
    if(NewExposure){
      // we have to do this or change location out-of-sequence will show 2 versions of the same
      // location. This should return the latest version of the location because it is unsliced
      return this.Location 
    }else{
      return this.getSlice( this.EffectiveDate ).Location.LastVersionWM
    }
  }

  property set LocationWM(_location: PolicyLocation) {
    this.assertWindowMode(_location)
    this.Location = _location
    if(_location != null){ 
      var exposureDateRange = _location.EffectiveDateRangeWM
        .intersect( _location.Branch.EditEffectiveDateRange )
      this.EffectiveDateRange = exposureDateRange
    }
  }

  function firstMatchingClassCode(code : String) : GLClassCode {
    var effectiveDate = this.GLLine.getReferenceDateForCurrentJob(JurisdictionMappingUtil.getJurisdiction(this.LocationWM))
    var previousCode = (this.GLLine.Branch.Job.NewTerm) ? null : this.BasedOn.ClassCode
    
    var criteria = new GLClassCodeSearchCriteria()
    criteria.Code = code
    criteria.EffectiveAsOfDate = effectiveDate
    criteria.PreviousSelectedClassCode = previousCode.Code
    return criteria.performSearch().getFirstResult()
  }

  function firstMatchingClassCodeOrThrow(code : String) : GLClassCode {
    var retVal = firstMatchingClassCode(code)
    if (retVal == null){
      throw new gw.api.util.DisplayableException(displaykey.Java.ClassCodePickerWidget.InvalidCode( code ))
    }
    return retVal
  }
}
