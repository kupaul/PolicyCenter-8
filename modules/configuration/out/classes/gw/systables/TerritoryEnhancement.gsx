package gw.systables

uses gw.api.productmodel.PolicyLinePatternLookup
uses gw.api.productmodel.PolicyLinePattern

enhancement TerritoryEnhancement : entity.Territory {
  property get State() : Jurisdiction {
    return this.DBTerritory.State
  }
  
  property get County() : String {
    return this.DBTerritory.County
  }
  
  property get City() : String {
    return this.DBTerritory.City
  }
  
  property get PostalCode() : String {
    return this.DBTerritory.PostalCode
  }
  
  property get Description() : String {
    return this.DBTerritory.Description
  }
  
  property get Code() : String {
    return this.DBTerritory.Code
  }
  
  property get PolicyLinePattern() : PolicyLinePattern {
    return PolicyLinePatternLookup.getByCode(this.DBTerritory.PolicyLinePatternCode)
  }
}
