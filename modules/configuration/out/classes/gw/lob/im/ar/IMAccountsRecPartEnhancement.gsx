package gw.lob.im.ar
uses gw.pl.persistence.core.Bundle

enhancement IMAccountsRecPartEnhancement : entity.IMAccountsRecPart {
  
  /**
   * Returns an array containing IMAccountsReceivables from current and future slices.
   */
   property get CurrentAndFutureIMAccountsReceivables() : IMAccountsReceivable[] { 
    var accountReceivables = this.IMAccountsReceivables.toList()
    this.Branch.OOSSlices.where(\p ->  p.IMLine.IMAccountsRecPart != null)
                         .each(\p ->  p.IMLine.IMAccountsRecPart.IMAccountsReceivables.each(\ar -> {  if(!accountReceivables.contains(ar)) accountReceivables.add(ar) }));
    return accountReceivables.toTypedArray()
  }
  
  function createAndAddARAndCoverage() : IMAccountsReceivable {
    var accountsReceivable = new IMAccountsReceivable( this.InlandMarineLine.Branch )
    this.addToIMAccountsReceivables( accountsReceivable )
    this.ARAutoNumberSeq.number( accountsReceivable, CurrentAndFutureIMAccountsReceivables, IMAccountsReceivable.Type.TypeInfo.getProperty( "AccountsRecNumber" ) )
    accountsReceivable.createCoveragesConditionsAndExclusions()
    return accountsReceivable
  }
  
  function getAvailableBuildings() : IMBuilding[]{
    var allBuildings = (this.PolicyLine as InlandMarineLine).IMBuildings
    return allBuildings.toTypedArray()
  }
  
  function removeIMAccountsRecAndCoverage( accountsrec : IMAccountsReceivable) {
    this.removeFromIMAccountsReceivables( accountsrec )
    renumberIMAccountsReceivables()
  }
  
  function renumberIMAccountsReceivables() {
    this.ARAutoNumberSeq.renumber(CurrentAndFutureIMAccountsReceivables, IMAccountsReceivable.Type.TypeInfo.getProperty( "AccountsRecNumber" ) )
  }

  function renumberNewIMAccountsReceivables() {
    this.ARAutoNumberSeq.renumberNewBeans(CurrentAndFutureIMAccountsReceivables, IMAccountsReceivable.Type.TypeInfo.getProperty( "AccountsRecNumber" ) )
  }
  
  function cloneARAutoNumberSequence() {
    this.ARAutoNumberSeq = this.ARAutoNumberSeq.clone( this.Bundle )
  }
  
  function resetARAutoNumberSequence() {
    this.ARAutoNumberSeq.reset()
    renumberIMAccountsReceivables()
  }
  
  function bindARAutoNumberSequence() {
    renumberIMAccountsReceivables()
    this.ARAutoNumberSeq.bind(CurrentAndFutureIMAccountsReceivables, IMAccountsReceivable.Type.TypeInfo.getProperty( "AccountsRecNumber" ) )
  }
    
  function initializeAutoNumberSequence(bundle : Bundle) {  
    this.ARAutoNumberSeq = new AutoNumberSequence(bundle)
  }
  
}
