package gw.sampledata.search
uses gw.sampledata.AbstractSampleDataCollection

@Export
class SearchSampleContactData extends AbstractSampleDataCollection {

  override property get CollectionName() : String {
    return "Search Test Contacts"
  }

  override property get AlreadyLoaded() : boolean {
    return findPerson("Jennifer", "Song", "488-79-9861") != null
  }

  override function load() {
    gw.transaction.Transaction.runWithNewBundle(\ b -> {
      loadPerson(b, "ms", "Jennifer", "Song", PrimaryPhoneType.TC_HOME, "415-867-5309", null, 
                 AddressType.TC_HOME, "901 Scott St.", "San Francisco", TC_CA, "94415", Country.TC_US.Code, "488-79-9861", 
                 \ pb -> {pb.withCellPhone("818-366-2943").withWorkPhone("650-656-2233")})
      loadPerson(b, "mr", "Billy Ray", "Sheet", PrimaryPhoneType.TC_HOME, "650-382-1627", null,
                 AddressType.TC_HOME, "1432 California St", "Palo Alto", TC_CA, "94306", Country.TC_US.Code, "429-19-5653")
      loadPerson(b, "dr", "Anna", "Raymond", PrimaryPhoneType.TC_MOBILE, "813-261-1624", VendorType.TC_DOCTOR,
                 AddressType.TC_BILLING, "1962 Bascom Ave. Ste 321", "Campbell", TC_CA, "95008", Country.TC_US.Code, "481-19-7531")
      loadPerson(b, "dr", "Houston John", "Roger", PrimaryPhoneType.TC_MOBILE, "813-261-1624", VendorType.TC_DOCTOR,
                 AddressType.TC_BILLING, "1962 Bascom Ave. Ste 321", "Campbell", TC_CA, "95008", Country.TC_US.Code, "123-45-6789")
      loadPerson(b, "mr", "Roger", "Houston", PrimaryPhoneType.TC_HOME, "650-432-9812", VendorType.TC_INDPROPINSPECTOR,
                 AddressType.TC_BILLING, "3214 San Antonio Road", "Mountain View", TC_CA, "94040", Country.TC_US.Code, "422-18-1285")
      loadPerson(b, "mr", "Marcel", "Pi-Sunyer", PrimaryPhoneType.TC_MOBILE, "510-242-2143", null,
                 AddressType.TC_HOME, "3295 Washington Ave", "Fremont", TC_CA, "94439", Country.TC_US.Code, "423-78-2355")
      loadPerson(b, "mrs", "Carmen", "Bach y Rita", PrimaryPhoneType.TC_WORK, "408-255-1342", null,
                 AddressType.TC_OTHER, "1324 E Fremont Ave", "Sunnyvale", TC_CA, "94087", Country.TC_US.Code, "532-73-1337")
      loadPerson(b, "ms", "Ann-Marie", "Ray", PrimaryPhoneType.TC_HOME, "408-235-1472", VendorType.TC_EXTERNALADJUSTER,
                 AddressType.TC_HOME, "551 E Washington Ave", "Sunnyvale", TC_CA, "94085", Country.TC_US.Code, "328-12-2349")
      loadPerson(b, "ms", "Ellen", "Smythe Jones", PrimaryPhoneType.TC_HOME, "650-362-1264", VendorType.TC_NURSE,
                 AddressType.TC_HOME, "1109 O'Connor St", "E Palo Alto", TC_CA, "94303", Country.TC_US.Code, "183-12-1767") 
      loadPerson(b, "mr", "Patrick", "O'Connor", PrimaryPhoneType.TC_HOME, "650-322-1423", null,
                 AddressType.TC_HOME, "2681 Washington Ave", "Redwood City", TC_CA, "94061", Country.TC_US.Code, "928-17-2733")
// 7.0.6 -- encoding problem with iso8859-1 characters.   Exclude for now.
//      loadPerson(b, "dr", "José", "Nuñez", PrimaryPhoneType.TC_HOME, "650-252-1324", VendorType.TC_DOCTOR,
//                AddressType.TC_HOME, "1700 W Hillsdale Blvd", "San Mateo", TC_CA, "94402", Country.TC_US.Code, "214-19-4573")
      loadPerson(b, "dr", "Jose", "Nunez", PrimaryPhoneType.TC_HOME, "650-252-1324", VendorType.TC_DOCTOR,
                AddressType.TC_HOME, "1700 W Hillsdale Blvd", "San Mateo", TC_CA, "94402", Country.TC_US.Code, "214-19-4573")

      // 20 more people, for use in Policy Change tests.
      loadPerson(b, "mr", "Johannes", "Ockheghem",  PrimaryPhoneType.TC_HOME, "914-141-0308", null,
                AddressType.TC_HOME, "1410 Saint-Ghislain", "New Rochelle", TC_NY, "10803", Country.TC_US.Code, "141-01-0803")
      loadPerson(b, "mr", "Giovanni", "Pierluigi", PrimaryPhoneType.TC_HOME, "707-525-1525", null,
                AddressType.TC_HOME, "1525 Palestrina Court", "American Canyon", TC_CA, "94503", Country.TC_US.Code, "152-59-4503")
      loadPerson(b, "mr", "Hildegard", "von Bingen", PrimaryPhoneType.TC_HOME, "509-861-1098", null,
                AddressType.TC_HOME, "1098 Bermersheim vor der Hohe", "Klickitat", TC_WA, "98613", Country.TC_US.Code, "109-89-8613")
      loadPerson(b, "mr", "Guillame", "de Machaut", PrimaryPhoneType.TC_HOME, "214-752-0513", null,
                AddressType.TC_HOME, "1300 Rheims Place", "Dallas", TC_TX, "75205", Country.TC_US.Code, "130-00-5205")
      loadPerson(b, "mr", "John", "Dunstable", PrimaryPhoneType.TC_HOME, "781-319-0017", null,
                AddressType.TC_HOME, "1390 Bedforshire Ave", "Bedford", TC_MA, "01730", Country.TC_US.Code, "139-00-1730")
      loadPerson(b, "mr", "Thomas", "Tallis", PrimaryPhoneType.TC_HOME, "716-505-1422", null,
                AddressType.TC_HOME, "1505 St James Place", "Buffalo", TC_NY, "14222", Country.TC_US.Code, "150-41-4222")
      loadPerson(b, "mr", "John", "Dowland", PrimaryPhoneType.TC_HOME, "937-563-4304", null,
                AddressType.TC_HOME, "1563 London Ave", "Marysville", TC_OH, "43040", Country.TC_US.Code, "156-34-3040")
      loadPerson(b, "mr", "Orlando", "Gibbons", PrimaryPhoneType.TC_HOME, "585-583-4223", null,
                AddressType.TC_HOME, "1583 Oxford Ave", "Buffalo", TC_NY, "14223", Country.TC_US.Code, "158-31-4223")
      loadPerson(b, "mr", "Carlo", "Gesualdo", PrimaryPhoneType.TC_HOME, "951-566-9170", null,
                AddressType.TC_HOME, "1566 Venoso Place", "Rancho Cucamonga", TC_CA, "91701", Country.TC_US.Code, "156-69-1701")
      loadPerson(b, "mr", "Michael", "Praetorius", PrimaryPhoneType.TC_HOME, "562-571-0650", null,
                AddressType.TC_HOME, "1571 Creuzberg St", "Norwalk", TC_CA, "90650", Country.TC_US.Code, "157-19-0650")
      loadPerson(b, "mr", "Salamone", "Rossi", PrimaryPhoneType.TC_HOME, "856-570-0809", null,
                AddressType.TC_HOME, "1570 Mantua Pike", "Woodbury Heights", TC_NJ, "08097", Country.TC_US.Code, "157-00-8097")
      loadPerson(b, "mr", "Caterina", "Assandra", PrimaryPhoneType.TC_HOME, "484-590-6655", null,
                AddressType.TC_HOME, "1590 Pavia Pl", "Pavia", TC_PA, "16655", Country.TC_US.Code, "159-01-6655")
      loadPerson(b, "mr", "Francois", "Couperin", PrimaryPhoneType.TC_HOME, "504-668-0122", null,
                AddressType.TC_HOME, "1668 Paris Ave", "New Orleans", TC_LA, "70122", Country.TC_US.Code, "166-87-0122")
      loadPerson(b, "mr", "Jean-Philippe", "Rameau", PrimaryPhoneType.TC_HOME, "240-683-9564", null,
                AddressType.TC_HOME, "1683 Dijon Ave", "Ocean Springs", TC_MD, "39564", Country.TC_US.Code, "168-33-9564")
      loadPerson(b, "mr", "Georg Friedrich", "Handel", PrimaryPhoneType.TC_HOME, "361-685-7964", null,
                AddressType.TC_HOME, "1685 Halle Court", "Hallettsville", TC_TX, "77964", Country.TC_US.Code, "168-67-7964")
      loadPerson(b, "mr", "Domenico", "Scarlatti", PrimaryPhoneType.TC_HOME, "803-685-9033", null,
                AddressType.TC_HOME, "1685 Naples Ave", "Cayce", TC_SC, "29033", Country.TC_US.Code, "168-52-9033")
      loadPerson(b, "mr", "Louis-Nicolas", "Clerambault", PrimaryPhoneType.TC_HOME, "504-676-7012", null,
                AddressType.TC_HOME, "1676 Paris Ave", "New Orleans", TC_LA, "70123", Country.TC_US.Code, "167-67-0123")
      loadPerson(b, "mr", "Jean-Baptiste", "Lully Jr.", PrimaryPhoneType.TC_HOME, "504-665-1676", null,
                AddressType.TC_HOME, "1665 Paris Ave", "New Orleans", TC_CA, "70122", Country.TC_US.Code, "166-57-0122")
      loadPerson(b, "mr", "Henry", "Purcell", PrimaryPhoneType.TC_HOME, "303-659-0221", null,
                AddressType.TC_HOME, "1659 Old Pye St", "Westminster", TC_CO, "80221", Country.TC_US.Code, "165-08-0221")
      loadPerson(b, "mr", "Arcangelo", "Corelli", PrimaryPhoneType.TC_HOME, "308-653-8869", null,
                AddressType.TC_HOME, "1653 Fusignano Ct", "Ravenna", TC_NE, "68869", Country.TC_US.Code, "165-36-8869")
      loadPerson(b, "mr", "Dieterich", "Buxtehude", PrimaryPhoneType.TC_HOME, "534-637-4828", null,
                AddressType.TC_HOME, "1637 Helsingborg Rd", "New Post", TC_WI, "54828", Country.TC_US.Code, "163-75-4828")
      
      loadCompany(b, "Dominion, Inc", "510-657-4911", null, false, 
                  AddressType.TC_BUSINESS, "123 B St", "Hayward", TC_CA, "94541", Country.TC_US.Code, "33-1236802")
      loadCompany(b, "Burrell Enterprises", "650-345-5074", VendorType.TC_BLDINGCONTRACTOR, true,
                  AddressType.TC_BUSINESS, "721 S Claremont St", "San Mateo", TC_CA, "94402", Country.TC_US.Code, "35-1298364")
      loadCompany(b, "Houston Lumber and Sheetrock", "650-763-5031", VendorType.TC_BLDINGCONTRACTOR, false,
                  AddressType.TC_BUSINESS, "250 W Hillsdale Blvd", "San Mateo", TC_CA, "94403", Country.TC_US.Code, "33-2165238")
      loadCompany(b, "Bi-Metal Thermometers",  "650-269-2777", null, false,
                  AddressType.TC_BUSINESS, "940 Miller Ave", "South San Francisco", TC_CA, "94080", Country.TC_US.Code, "39-1248088")
      loadCompany(b, "That Championship Season", "650-269-2785", null, false,
                  AddressType.TC_BUSINESS, "Twenty-Nine 31st Ave", "San Mateo", TC_CA, "94403",  Country.TC_US.Code, "31-8015024")
// 7.0.6 -- encoding problem with iso8859-1 characters.   Exclude for now.
//      loadCompany(b, "Bösendorfer USA", "650-736-3931", null, false,
//                 AddressType.TC_BUSINESS, "122 Second St", "San Mateo", TC_CA, "94401", Country.TC_US.Code, "31-4212478")
      loadCompany(b, "Bosendorfer USA", "650-736-3931", null, false,
                 AddressType.TC_BUSINESS, "122 Second St", "San Mateo", TC_CA, "94401", Country.TC_US.Code, "31-4212478")
// 7.0.6 -- encoding problem with iso8859-1 characters.   Exclude for now.
//      loadCompany(b, "Bach Society", "650-582-1032", null, false,
//                 AddressType.TC_BILLING, "501 Ruisseau Français Ave", "Half Moon Bay", TC_CA, "94019", Country.TC_US.Code, "31-2322194")
      loadCompany(b, "Bach Society", "650-582-1032", null, false,
                 AddressType.TC_BILLING, "501 Ruisseau Francais Ave", "Half Moon Bay", TC_CA, "94019", Country.TC_US.Code, "31-2322194")
      loadCompany(b, "Pat O'Brian's", "408-687-3458", null, false,
                  AddressType.TC_BUSINESS, "150 S Murphy Ave", "Sunnyvale", TC_CA, "94086", Country.TC_US.Code, "50-3245972")
      loadCompany(b, "Fung Lum Restaurant", "510-587-5264", null, false,
                  AddressType.TC_BUSINESS, "400 Third St", "Oakland", TC_CA, "94607", Country.TC_US.Code, "35-1230390")
      loadCompany(b, "Sun and Fun", "415-635-1329", null, false,
                  AddressType.TC_BUSINESS, "50 Humboldt Ave", "Sausalito", TC_CA, "94965", Country.TC_US.Code, "31-3229450")
    })
  }
}