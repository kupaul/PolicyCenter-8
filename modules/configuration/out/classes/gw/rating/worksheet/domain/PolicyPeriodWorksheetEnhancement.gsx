package gw.rating.worksheet.domain
uses gw.rating.worksheet.WorksheetUtil
uses java.lang.IllegalArgumentException
uses gw.rating.RateFlowLogger
uses java.util.Map

enhancement PolicyPeriodWorksheetEnhancement : entity.PolicyPeriod {
    
  property get AllBeansWithWorksheets() : Map<EffDated, List<Worksheet>> {
    if (this.WorksheetContainer == null) {
      return {}
    }
    
    return this.WorksheetContainer
            .getAllBeansWithWorksheets() // returns Map<EffDated, List<PLXMLNode>>
            .mapValues(\ v -> v.map(\ xmlNode -> Worksheet.make(xmlNode) ))
  }

  function addWorksheetFor(bean : EffDated, ws : Worksheet, tag : String = null) {
    if (ws == null) {
      throw new IllegalArgumentException("Worksheet may not be null")      
    }

    if (this.WorksheetContainer == null) {
      this.WorksheetContainer = new WorksheetContainer(this.Bundle)
      this.WorksheetContainer.PolicyTerm = this.PolicyTerm
    }
    
    this.WorksheetContainer.addWorksheetFor(bean, ws.toXml(), tag)
  }
  
  function getWorksheetFor(bean : EffDated, tag : String = null) : Worksheet {
    RateFlowLogger.Logger.debug("getWorksheetFor(${bean.TypeIDString} ${bean.FixedId}) ${bean.EffectiveDateRange} ${tag}")
    var xmlNode = this.WorksheetContainer?.getWorksheetFor(bean, tag)
    
    return Worksheet.make(xmlNode)
  }
  
  function removeWorksheetFor(bean : EffDated, tag : String = null) {
    if (this.WorksheetContainer == null) {
      return
    }
    
    this.WorksheetContainer.removeWorksheetFor(bean, tag)
  }
  
  function clearAllWorksheets() {
    this.removeDiagnosticRatingWorksheets()
    
    if (this.WorksheetContainer == null) {
      return
    }
    
    this.WorksheetContainer.clearWorksheets()
  }
  
  property get HasWorksheets() : WorksheetUtil.WorksheetStatus {
    // When archiving is implemented this will have to change...it should return ARCHIVED in certain circumstances.
    return this.WorksheetContainer == null ? NONE
         : this.WorksheetContainer.WorksheetData == null ? NONE : AVAILABLE
  }
}
