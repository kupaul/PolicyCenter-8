package gw.lob.wc

enhancement WCFedCoveredEmployeeEnhancement : WCFedCoveredEmployee {
  
  property get LocationWM(): PolicyLocation {
    assertWindowMode()
    var slicedExposure = this.getSlice(this.EffectiveDate)
    return slicedExposure.Location
  }
  
  property set LocationWM(_location: PolicyLocation)  {
    assertWindowMode()
    this.Location = _location.Unsliced
  }

  private function assertWindowMode() {
    if (this.Slice) {
      throw displaykey.WorkersComp.CoveredEmployee.NotInWindowMode
    }
  }
  
  property set IfAnyExposureAndClearBasisAmount(value : Boolean) {
      if (value == true) {
          this.BasisAmount = null
      }
      this.IfAnyExposure = value
  }

  property get IfAnyExposureAndClearBasisAmount() : Boolean {
      return this.isIfAnyExposure()
  }

  protected function deletable() : boolean {
      return true
  }

}
