package gw.lob.cp
uses gw.pl.persistence.core.Bundle
uses java.math.BigDecimal

enhancement CommercialPropertyLineEnhancement : entity.CommercialPropertyLine {
  function getDefaultContainerForAddlInterest() : CPBuilding {
    var cpBuildings = this.CPLocations*.Buildings
    return cpBuildings.orderBy( \ c -> c.CPLocation.Location.LocationNum).thenBy(\ b -> b.Building.BuildingNum).first()
  }

  property get CPTransactions() : CPTransaction[] {
    var branch = this.Branch
    return branch.getSlice(branch.PeriodStart) .CPTransactions
  }
  
  /**
   * Returns an array containing CPBlankets from current and future slices.
   */
   property get CurrentAndFutureCPBlankets() : CPBlanket[] { 
    var blankets = this.CPBlankets.toList()
    this.Branch.OOSSlices.where(\p ->  p.CPLine.CPBlankets != null)
                         .each(\p ->  p.CPLine.CPBlankets.each(\b -> {  if(!blankets.contains(b)) blankets.add(b) }));
    return blankets.toTypedArray()
  }

  /**
   * Add the given CPBlanket; give the newly added CPBlanket the next number in sequence.
   * @param blanket the CPBlanket to add
   */
  public function addAndNumberCPBlanket(blanket : CPBlanket) {
      this.addToCPBlankets(blanket)
      this.CPBlanketAutoNumberSeq.number(blanket, CurrentAndFutureCPBlankets, CPBlanket.Type.TypeInfo.getProperty( "CPBlanketNum" )) 
  }
  
  /**
   * Removed the given CPBlanket, then renumbers CPBlankets
   * @param blanket the CPBlanket to remove
   */
  function removeCPBlanket (blanket : CPBlanket) {
    this.removeFromCPBlankets(blanket)
    renumberCPBlankets()
  }
  
  /**
   * Resets auto-number sequence and renumbers CPBlankets
   */
  function resetCPBlanketAutoNumberSequence() {
    this.CPBlanketAutoNumberSeq.reset()
    renumberCPBlankets()
  }
 
  /**
   * Renumbers and binds autonumbering sequence for CPBlankets
   */
  function bindCPBlanketAutoNumberSequence() {
    renumberCPBlankets() 
    this.CPBlanketAutoNumberSeq.bind(CurrentAndFutureCPBlankets, CPBlanket.Type.TypeInfo.getProperty( "CPBlanketNum" ))
  }
  
  /**
   * Renumberes CPBlankets
   */
  function renumberCPBlankets() {
    this.CPBlanketAutoNumberSeq.renumber(CurrentAndFutureCPBlankets, CPBlanket.Type.TypeInfo.getProperty( "CPBlanketNum" ))
  }
  
  /**
   * Renumberes CPBlankets including new CPBlankets
   */
  function renumberNewCPBlankets() {
    this.CPBlanketAutoNumberSeq.renumberNewBeans(CurrentAndFutureCPBlankets, CPBlanket.Type.TypeInfo.getProperty( "CPBlanketNum" ))
  }
  
  /**
   * Clones autonumbering sequences for CPBlanket
   */
  function cloneCPBlanketAutoNumberSequence() {
    this.CPBlanketAutoNumberSeq = this.CPBlanketAutoNumberSeq.clone(this.Bundle)
  }
  
  /**
   * Initializes autonumbering sequence 
   */
  function initializeCPBlanketAutoNumberSequence(bundle : Bundle) {  
    this.CPBlanketAutoNumberSeq = new AutoNumberSequence(bundle)
  }

  /**
   * Creates a new CPBlanket, adds it to the line and assigns it a number.
   */
  function createAndAddBlanket() : CPBlanket {
    var blanket = new CPBlanket(this.Branch)
    addAndNumberCPBlanket(blanket)
    blanket.createCoveragesConditionsAndExclusions()
    return blanket
  }

  property get ProductModifierFactor() : BigDecimal {
    var branch = this.Branch
    return branch.getProductModifierFactor()
  }

}
