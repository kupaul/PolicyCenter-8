package gw.web.line.wc.policy

uses gw.api.util.StateJurisdictionMappingUtil

@Export
class WorkersCompCoverageCVUIHelper {

  public static function updateAllBasis(wcLine : WorkersCompLine, CurrentLocation : pcf.api.Location){
    if((CurrentLocation as pcf.api.Wizard).saveDraft()){
      wcLine.updateWCExposuresAndModifiers()
    }
  }

  public static function JurisdictionsThatCanBeAdded(wcLine : WorkersCompLine): Jurisdiction[] {
    var existingJurisdictions = wcLine.Jurisdictions.map(\j -> j.State).toSet()
    var possibleJurisdicitons = wcLine.Branch.LocationStates.toSet()
    possibleJurisdicitons.removeAll(existingJurisdictions)
    return possibleJurisdicitons.toTypedArray()
  }

  public static function getOfficalIDsForJurisdictionThatMatchPNIContactsOfficialIDs(wcLine : WorkersCompLine, covJuris : WCJurisdiction) : entity.OfficialID[] {
    return wcLine.Branch.PrimaryNamedInsured.AccountContactRole.AccountContact.Contact.OfficialIDs
        .where(\ officialID ->
            officialID.State == covJuris.State)
  }

  public static function outputConverterForOfficialIDs(VALUE : OfficialID[]) : String {
    var str = ""
    var first = true
    for (var Item in VALUE) {
      var idValue = Item.getOfficialIDValue()
      if(idValue != null) {
        if(!first) {
          str = str + ", "
        }
        first = false
        str = str + idValue
      }
    }
    return str
  }
}