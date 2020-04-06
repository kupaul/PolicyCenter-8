package gw.lob.im.sign
uses gw.pl.persistence.core.Bundle

enhancement IMSignPartEnhancement : IMSignPart {
  
  /**
   * Returns an array containing IMSigns from current and future slices.
   * @return IMSign[] - a list of {@link entity.IMSign}
   */
   property get CurrentAndFutureIMSigns() : IMSign[] { 
    var signs = this.IMSigns.toList()
    this.Branch.OOSSlices.where(\p ->  p.IMLine.IMSignPart != null)
                         .each(\p ->  p.IMLine.IMSignPart.IMSigns.each(\s -> {  if(!signs.contains(s)) signs.add(s) }));
    return signs.toTypedArray()
  }


  /**
   * Creates a new {@link entity.IMSign} and sets the following data on the vehicle
   * The sign is added to the line and numbered, and the modifiers/clauses are created on the sign
   * @see #addAndNumberVehicle(entity.PersonalVehicle)
   *
   */
  function createAndAddIMSignAndCoverage() : IMSign {
    var sign = new IMSign( this.InlandMarineLine.Branch )
    this.addToIMSigns( sign )
    this.SignAutoNumberSeq.number( sign, CurrentAndFutureIMSigns, IMSign.Type.TypeInfo.getProperty( "SignNumber" ) )
    sign.createCoveragesConditionsAndExclusions()
    return sign
  }

  /**
   * Removes a {@link entity.IMSign} from the line and renumbers the signs
   * @param sign - the {@link entity.IMSign} to remove
   * @see #renumberIMSigns()
   */
  function removeIMSignAndCoverage( sign : IMSign) {
    this.removeFromIMSigns( sign )
    renumberIMSigns()
  }

  /**
   * Renumbers the signs and taking into consideration future signs by calling AutoNumberSequence.renumberVehicles()
   * @see com.guidewire.pc.domain.AutoNumberSequence#renumber(com.guidewire.commons.entity.KeyableBean[] arrayToNumber, gw.lang.reflect.IPropertyInfo indexProperty)
   */
  function renumberIMSigns() {
    this.SignAutoNumberSeq.renumber( CurrentAndFutureIMSigns, IMSign.Type.TypeInfo.getProperty( "SignNumber" ) )
  }

  /**
   * Renumbers new signs and taking into consideration future signs by calling AutoNumberSequence.renumberNewBeans()
   * This is mostly used after creating a new sign
   * @see com.guidewire.pc.domain.AutoNumberSequence#renumberNewBeans(com.guidewire.commons.entity.KeyableBean[], gw.lang.reflect.IPropertyInfo)
   */
  function renumberNewIMSigns() {
    this.SignAutoNumberSeq.renumberNewBeans( CurrentAndFutureIMSigns, IMSign.Type.TypeInfo.getProperty( "SignNumber" ) )
  }

  /**
   * Clones a sign's auto number sequence by calling AutoNumberSequence.clone()
   * @see com.guidewire.pc.domain.AutoNumberSequence#clone(gw.pl.persistence.core.Bundle)
   */
  function cloneSignAutoNumberSequence() {
    this.SignAutoNumberSeq = this.SignAutoNumberSeq.clone( this.Bundle )
  }

  /**
   * Resets a sign's auto number sequence by calling AutoNumberSequence.reset()
   * @see com.guidewire.pc.domain.AutoNumberSequence#reset()
   */
  function resetSignAutoNumberSequence() {
    this.SignAutoNumberSeq.reset()
    renumberIMSigns()
  }

  /**
   * Renumbers the signs and then binds the auto number sequence of the signs by calling AutoNumberSequence.bind()
   * @see com.guidewire.pc.domain.AutoNumberSequence#bind(com.guidewire.commons.entity.KeyableBean[], gw.lang.reflect.IPropertyInfo)
   */
  function bindSignAutoNumberSequence() {
    renumberIMSigns()
    this.SignAutoNumberSeq.bind( CurrentAndFutureIMSigns, IMSign.Type.TypeInfo.getProperty( "SignNumber" ) )
  }

  /**
   * Initialize the auto number sequence of the signs
   * @param bundle - the {@link gw.pl.persistence.core.Bundle} that is used to initialize the {@link com.guidewire.pc.domain.AutoNumberSequence}
   */
  function initializeSignAutoNumberSequence(bundle : Bundle) {
    this.SignAutoNumberSeq = new AutoNumberSequence(bundle)
  }

}
