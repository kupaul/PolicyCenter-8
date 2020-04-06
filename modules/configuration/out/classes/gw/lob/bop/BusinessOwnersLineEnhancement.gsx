package gw.lob.bop

uses gw.pl.persistence.core.Bundle

/**
 * An enhancement for {@link entity.BusinessOwnersLine BusinessOwnersLine}
 */
enhancement BusinessOwnersLineEnhancement : entity.BusinessOwnersLine {
  
  /**
   * Returns an array containing BOPScheduledEquipments from current and future slices.
   */
   property get CurrentAndFutureBOPScheduledEquipments() : BOPScheduledEquipment[] { 
    var equipments = this.BOPScheduledEquipments.toList()
    this.Branch.OOSSlices.each(\p ->  p.BOPLine.BOPScheduledEquipments.each(\e -> {  if(!equipments.contains(e)) equipments.add(e) }));
    return equipments.toTypedArray()
  }

  /**
   * Get the {@link entity.BOPLocation BOPLocation} corresponding to the provided {@link entity.PolicyLocation PolicyLocation}
   * @param location the {@link entity.PolicyLocation PolicyLocation} to match.
   * @return the associated {@link entity.BOPLocation BOPLocation} or null if none is found.
   */
  function getBOPLocationForPolicyLocation(location : PolicyLocation) : BOPLocation {
    return this.BOPLocations.firstWhere(\ b -> b.Location == location)
  }

  /**
   * The additional coverage categories for this line.  This will vary depending on the  {@link entity.BusinessOwnersLine#SmallBusinessType}
   * @return an array of strings representing additional coverage categories
   */
  function getAdditionalCoverageCategories() : String[] {
    if (this.SmallBusinessType == "motel") {
      // BOPGuesCovCat is an included category
      return new String[]{"BOPContractorCat", "BOPLiabilityOtherCat", "BOPCrimeCat", "BOPLiquorCat","BOPPolicyOtherCat","BOPProfessionalCat","BOPTerrorismCat", "BOPStateCat"}
    }
    else if (this.SmallBusinessType == "contractor" or this.SmallBusinessType == "contractor_land") {
      // BOPConttractorCat is an included category
      return new String[]{"BOPGuestCovCat", "BOPLiabilityOtherCat", "BOPCrimeCat", "BOPLiquorCat","BOPPolicyOtherCat","BOPProfessionalCat","BOPTerrorismCat", "BOPStateCat"}
    }
    else {
      return new String[]{"BOPGuestCovCat","BOPContractorCat", "BOPLiabilityOtherCat", "BOPCrimeCat", "BOPLiquorCat","BOPPolicyOtherCat","BOPProfessionalCat","BOPTerrorismCat", "BOPStateCat"}
    }
  }

  /**
   * Create and add a new {@link entity.BOPScheduledEquipment BOPScheduledEquipment} to the line, the equipment schedule.
   * @return the newly created {@link entity.BOPScheduledEquipment BOPScheduledEquipment}
   */
  function createAndAddScheduledEquip() : BOPScheduledEquipment {
    var item = new BOPScheduledEquipment(this.Branch)
    item.BOPLine = this
    this.addToBOPScheduledEquipments(item)
    this.EquipmentAutoNumberSeq.number(item, CurrentAndFutureBOPScheduledEquipments, BOPScheduledEquipment.Type.TypeInfo.getProperty("EquipmentNumber"))
    return item
  }

  /**
   * Auto-Numbering methods for the Schedule of Equipment
   **/

  /**
   * Renumber the equipment
   * @see com.guidewire.pc.domain.AutoNumberSequence#renumber(com.guidewire.commons.entity.KeyableBean[], gw.lang.reflect.IPropertyInfo)
   */
  function renumberScheduledEquipments() {
    this.EquipmentAutoNumberSeq.renumber(CurrentAndFutureBOPScheduledEquipments, BOPScheduledEquipment.Type.TypeInfo.getProperty("EquipmentNumber"))
  }

  /**
   * Renumber the new equipment
   * @see com.guidewire.pc.domain.AutoNumberSequence#renumberNewBeans(com.guidewire.commons.entity.KeyableBean[], gw.lang.reflect.IPropertyInfo)
   */
  function renumberNewScheduledEquipments() {
    this.EquipmentAutoNumberSeq.renumberNewBeans(CurrentAndFutureBOPScheduledEquipments, BOPScheduledEquipment.Type.TypeInfo.getProperty("EquipmentNumber"))
  }

  /**
   * Remove the provided equipement item form the equipment schedule.
   * @param equipment the item to remove
   */
  function removeScheduledEquip(equipment : BOPScheduledEquipment) {
    this.removeFromBOPScheduledEquipments(equipment)
    renumberScheduledEquipments()
  }

  /**
   * Return a clone of the current auto-numbering sequence.  This is necessary whenever a new term is created.
   * @see com.guidewire.pc.domain.AutoNumberSequence#clone(gw.pl.persistence.core.Bundle)
   */
  function cloneEquipmentAutoNumberSequence() {
    this.EquipmentAutoNumberSeq =  this.EquipmentAutoNumberSeq.clone(this.Bundle)
  }

  /**
   * Reset the equipment auto-number sequence
   * @see com.guidewire.pc.domain.AutoNumberSequence#reset()
   */
  function resetEquipmentAutoNumberSequence() {
    this.EquipmentAutoNumberSeq.reset()
   renumberScheduledEquipments()
  }

  /**
   * Reserve all used auto-numbers for equipment
   * @see com.guidewire.pc.domain.AutoNumberSequence#bind(com.guidewire.commons.entity.KeyableBean[], gw.lang.reflect.IPropertyInfo)
   */
  function bindEquipmentAutoNumberSequence() {
    renumberScheduledEquipments()
    this.EquipmentAutoNumberSeq.bind(CurrentAndFutureBOPScheduledEquipments, BOPScheduledEquipment.Type.TypeInfo.getProperty("EquipmentNumber"))
  }

  /**
   * Initialize a new equipment auto number sequence
   * @param bundle the entity {@link gw.pl.persistence.core.Bundle Bundle} to initialize the sequence in.
   * @see com.guidewire.pc.domain.AutoNumberSequence
   */
  function initializeEquipmentAutoNumberSequence(bundle : Bundle) {  
    this.EquipmentAutoNumberSeq = new AutoNumberSequence(bundle)
  }

  /**
   * Deselect the contractors equipement coverage if there are no items in the schedule, otherwise sum the tools
   * @see #sumBOPToolsValue()
   */
  function maybeUnselectCoverage() {
    if (this.BOPScheduledEquipments.Count < 1) {
      this.BOPToolsSchedCov.remove()
    }
    else {
      sumBOPToolsValue()
    }
  }

  /**
   * Sum the total equipment value of tools and assign it to the limit of BOPToolsSchedCov.
   */
  function sumBOPToolsValue() {
    this.BOPToolsSchedCov.BOPToolsSchedLimTerm.Value = this.BOPScheduledEquipments.sum( \ item ->item.EquipmentValue )
  }

  /**
   * The default the {@link entity.BOPBuilding BOPBuilding} that will serve as the default container for a new {@link PolicyAddlInterest}
   * <br/>
   * <br/>
   * e.g. In the user interface for creating a new additional interest, a default building is provided.
   * The default building is determined by this method.
   *
   * @return the default {@link entity.BOPBuilding BOPBuilding}
   */
  function getDefaultContainerForAddlInterest() : BOPBuilding {
    var bopBuildings = this.BOPLocations*.Buildings
    return bopBuildings.orderBy( \ c -> c.BOPLocation.Location.LocationNum).thenBy(\ b -> b.Building.BuildingNum).first()
  }

  /**
   * @return an array of {@link entity.BOPTransaction BOPTransactions} for this line.
   */
  property get BOPTransactions() : BOPTransaction[] {
    var branch = this.Branch
    return branch.getSlice(branch.PeriodStart).BOPTransactions
  }
}
