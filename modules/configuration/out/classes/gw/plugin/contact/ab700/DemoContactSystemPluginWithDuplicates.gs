package gw.plugin.contact.ab700
uses gw.plugin.contact.DuplicateContactResultContainer
uses gw.plugin.contact.DuplicateContactResult
uses wsi.remote.gw.webservice.ab.ab700.abcontactapi.types.complex.ABContactAPIFindDuplicatesResult
uses wsi.remote.gw.webservice.ab.ab700.abcontactapi.types.complex.ABContactAPISearchResult

@Deprecated("Since 8.0.0.  Please use the ab800 package.")
@Export
class DemoContactSystemPluginWithDuplicates extends DemoContactSystemPlugin {

  override function findDuplicates(contact : Contact) : DuplicateContactResultContainer {
    var matches = _sampleABContactAPISearchResult
      .where(\ abci -> contactTypeMatches(abci, contact))
    var dups : List<DuplicateContactResult> = {}
    matches.each(\ a -> {
      var temp = new ABContactAPIFindDuplicatesResult()
      temp.CellPhone = a.CellPhone
      temp.ContactType = a.ContactType
      temp.DateOfBirth = a.DateOfBirth
      temp.EmailAddress1 = a.EmailAddress1
      temp.EmailAddress2 = a.EmailAddress2
      temp.FaxPhone = a.FaxPhone
      temp.FirstName = a.FirstName
      temp.HomePhone = a.HomePhone
      temp.LastName = a.LastName
      temp.LinkID = a.LinkID
      temp.MiddleName = a.MiddleName
      temp.Name = a.Name
      temp.Preferred = a.Preferred
      temp.Prefix = a.Prefix
      temp.PrimaryAddress.$TypeInstance = a.PrimaryAddress.$TypeInstance
      temp.PrimaryPhone = a.PrimaryPhone
      temp.Score = a.Score
      temp.Suffix = a.Suffix
      temp.VendorType = a.VendorType
      temp.WorkPhone = a.WorkPhone
      temp.Exact = a.FirstName != "Test" 
      dups.add(new DuplicateContactResultImpl(temp))
    })
    return new DuplicateContactResultContainer() {
      override property get Results() : List<DuplicateContactResult> {
        return dups
      }
      override property get TotalResults() : int {
        return dups.Count
      }
    }
  }
  
  
  //
  // PRIVATE SUPPORT FUNCTIONS
  //
  
  private function contactTypeMatches(abci : ABContactAPISearchResult, c : Contact) : boolean {
    if (c typeis Company)
      return abci.ContactType.containsIgnoreCase(ContactType.TC_COMPANY.Code)
    else 
      return c typeis Person and abci.ContactType.containsIgnoreCase(ContactType.TC_PERSON.Code)
  }

}
