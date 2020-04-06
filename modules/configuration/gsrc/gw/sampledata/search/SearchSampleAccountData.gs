package gw.sampledata.search
uses gw.sampledata.AbstractSampleDataCollection

@Export
class SearchSampleAccountData extends AbstractSampleDataCollection {
  
  private final var SENTINEL_ACCOUNT = "D008675309"
  
  static var _personAccounts  : List<String>  as readonly PersonalAccounts  = {}
  static var _companyAccounts : List<String> as readonly CommercialAccounts = {}
  static var _firstPolicyChangeAccount : String as readonly FirstPolicyChangeAccount
  
  override property get CollectionName() : String {
    return "Search Test Accounts" 
  }

  override property get AlreadyLoaded() : boolean {
    return accountLoaded(SENTINEL_ACCOUNT)
  }

  private function pers(acct : String) : String {
    _personAccounts.add(acct)
    return acct
  }
  
  private function comm(acct : String) : String {
    _companyAccounts.add(acct)
    return acct
  }


  override function load() {
    loadPersonAccount(pers("D008675309"), "Jennifer", "Song", \ ab -> {addDrivers(ab, {buildDriver("Tommy", "Tutone", TC_CA)}) // not ANI
                                                                       addDrivers(ab, {buildDriver("Alex", "Call"),
                                                                                       buildDriver("Jim", "Keller", TC_CA)}, true /* ANI */)})
    loadPersonAccount(pers("D019430987"), "Billy Ray", "Sheet",        {"Dominion Inc."})         // company ANI
    loadPersonAccount(pers("D023485097"), "Anna",      "Raymond",      {"Burr Detective Agency"}) // company ANI
    loadPersonAccount(pers("D123498765"), "Roger",     "Houston",      {"The Perfect Space"})     // company ANI
    loadPersonAccount(pers("D125123460"), "Marcel",    "Pi-Sunyer",    {})
    loadPersonAccount(pers("D125123461"), "Carmen",    "Bach y Rita",  {})
    loadPersonAccount(pers("D126720945"), "Ann-Marie", "Ray",          {"Ray's Rockhouse"})       // company ANI
    loadPersonAccount(pers("D126774555"), "Ellen",     "Smythe Jones", {})
    loadPersonAccount(pers("D126756723"), "Patrick",   "O'Connor",     {})
    loadPersonAccount(pers("D139324877"), "José",      "Nuñez",        {"Dominion Inc."})         // company ANI
    loadPersonAccount(pers("D148599320"), "Stella",    "Williams", \ ab -> {addDrivers(ab, {buildDriver("Chad", "Roberts", TC_CA)}, true) // ANI
                                                                            addDrivers(ab, {buildDriver("John", "Smith", TC_CA), // use John Smith as a Driver
                                                                                            buildDriver("Scott", "Hall", TC_CA)}, true /* ANI */)})
    /* person accounts for policy change tests */
    var _firstAcct =
    loadPersonAccount(pers("D221531234"), "Johannes",           "Ockheghem",       
                                         \ ab -> {addDrivers(ab, {buildDriver("Carlene", "Sevin", TC_NY)}, false)
                                                  addDrivers(ab, {buildDriver("Nita", "Genova", TC_NY)}, true)})
    _firstPolicyChangeAccount = _firstAcct.AccountNumber

    loadPersonAccount(pers("D221543265"), "Giovanni",           "Pierluigi",
                                        \ ab -> {addDrivers(ab, {buildDriver("Darcy", "Matsumoto", TC_CA)}, false)
                                                 addDrivers(ab, {buildDriver("Erik", "Baisley", TC_CA)}, true)})

    loadPersonAccount(pers("D221662456"), "Hildegard",          "von Bingen",
                                        \ ab -> {addDrivers(ab, {buildDriver("Hugh", "Grable", TC_WA)}, false)
                                                 addDrivers(ab, {buildDriver("Clayton", "Bosque", TC_WA)}, true)})

    loadPersonAccount(pers("D221662578"), "Guillame",           "de Machaut",
                                        \ ab -> {addDrivers(ab, {buildDriver("Penelope", "Palen", TC_TX)}, false)
                                                 addDrivers(ab, {buildDriver("Julio", "Gayer", TC_TX)}, true)})

    loadPersonAccount(pers("D221674532"), "John",               "Dunstable",
                                        \ ab -> {addDrivers(ab, {buildDriver("Allan", "Sires", TC_MA)}, false)
                                                 addDrivers(ab, {buildDriver("Dollie", "Inghram", TC_MA)}, true)})

    loadPersonAccount(pers("D221683456"), "Thomas",             "Tallis",
                                        \ ab -> {addDrivers(ab, {buildDriver("Julianne", "Rolf", TC_NY)}, false)
                                                 addDrivers(ab, {buildDriver("Clayton", "Swanger", TC_NY)}, true)})

    loadPersonAccount(pers("D221683507"), "John",               "Dowland",
                                        \ ab -> {addDrivers(ab, {buildDriver("Lonnie", "Pellett", TC_OH)}, false)
                                                 addDrivers(ab, {buildDriver("Carlene", "Auslander", TC_OH)}, true)})

    loadPersonAccount(pers("D221683609"), "Orlando",            "Gibbons",
                                        \ ab -> {addDrivers(ab, {buildDriver("Mathew", "Joo", TC_NY)}, false)
                                                 addDrivers(ab, {buildDriver("Earnestine", "Lafever", TC_NY)}, true)})

    loadPersonAccount(pers("D221690234"), "Carlo",              "Gesualdo",
                                        \ ab -> {addDrivers(ab, {buildDriver("Javier", "Dunwoody", TC_CA)}, false)
                                                 addDrivers(ab, {buildDriver("Fernando", "Sanks", TC_CA)}, true)})

    loadPersonAccount(pers("D221764592"), "Michael",            "Praetorius",
                                        \ ab -> {addDrivers(ab, {buildDriver("Mathew", "Pappan", TC_CA)}, false)
                                                 addDrivers(ab, {buildDriver("Cody", "Zerbe", TC_CA)}, true)})

    loadPersonAccount(pers("D223165632"), "Salamone",           "Rossi",
                                        \ ab -> {addDrivers(ab, {buildDriver("Earnestine", "Lora", TC_NJ)}, false)
                                                 addDrivers(ab, {buildDriver("Allie", "Keisler", TC_NJ)}, true)})

    loadPersonAccount(pers("D223643732"), "Caterina",           "Assandra",
                                        \ ab -> {addDrivers(ab, {buildDriver("Hillary", "Heiss", TC_PA)}, false)
                                                 addDrivers(ab, {buildDriver("Ted", "Belliveau", TC_PA)}, true)})

    loadPersonAccount(pers("D223693446"), "Francois",           "Couperin",
                                        \ ab -> {addDrivers(ab, {buildDriver("Ted", "Mongillo", TC_LA)}, false)
                                                 addDrivers(ab, {buildDriver("Cody", "Sigmund", TC_LA)}, true)})

    loadPersonAccount(pers("D224774096"), "Jean-Philippe",      "Rameau",
                                        \ ab -> {addDrivers(ab, {buildDriver("Avis", "Fritze",TC_MD )}, false)
                                                 addDrivers(ab, {buildDriver("Harriett", "Galli", TC_MD)}, true)})

    loadPersonAccount(pers("D224779345"), "Georg Friedrich",   "Handel",
                                        \ ab -> {addDrivers(ab, {buildDriver("Edwina", "Rickles", TC_TX)}, false)
                                                 addDrivers(ab, {buildDriver("Milagros", "Robuck", TC_TX)}, true)})

    loadPersonAccount(pers("D233602345"), "Domenico",           "Scarlatti",
                                        \ ab -> {addDrivers(ab, {buildDriver("Malinda", "Hoxie", TC_SC)}, false)
                                                 addDrivers(ab, {buildDriver("Margery", "Atkison", TC_SC)}, true)})

    loadPersonAccount(pers("D233690130"), "Louis-Nicolas",      "Clerambault",
                                        \ ab -> {addDrivers(ab, {buildDriver("Arlo", "Resendiz", TC_LA)}, false)
                                                 addDrivers(ab, {buildDriver("Roslyn", "Rhem", TC_LA)}, true)})

    loadPersonAccount(pers("D233763331"), "Jean-Baptiste",      "Lully Jr.",
                                        \ ab -> {addDrivers(ab, {buildDriver("Jessie", "Antonucci", TC_CA)}, false)
                                                 addDrivers(ab, {buildDriver("Clayton", "Turton", TC_CA)}, true)})

    loadPersonAccount(pers("D234673012"), "Henry",              "Purcell",
                                        \ ab -> {addDrivers(ab, {buildDriver("Fernando", "Matthias", TC_CO)}, false)
                                                 addDrivers(ab, {buildDriver("Lakisha", "Lassen", TC_CO)}, true)})

    loadPersonAccount(pers("D234680244"), "Arcangelo",          "Corelli",
                                        \ ab -> {addDrivers(ab, {buildDriver("Lonnie", "Manwaring", TC_NE)}, false)
                                                 addDrivers(ab, {buildDriver("Mathew", "Horstmann", TC_NE)}, true)})

    loadPersonAccount(pers("D234680246"), "Dieterich",          "Buxtehude",
                                        \ ab -> {addDrivers(ab, {buildDriver("Dona ", "Krebsbach", TC_WI)}, false)
                                                 addDrivers(ab, {buildDriver("Sharron ", "Bartling", TC_WI)}, true)})

    

    // Person for "phraseSlop" test. Requires "Roger Houston" also for the test.
    loadPersonAccount(pers("D135790248"), "Houston John", "Roger", {"Houston Burgers"})
    loadPersonAccount(pers("D246801357"), "James", "Dean", 
                                        \ ab -> {addDrivers(ab, {buildDriver("Houston", "Roger", TC_NE)}, true)})
                                                                                                  
    // Add new person accounts just above this comment.  DO NOT INSERT INTO PERSON LIST -- you should append only.

    loadCompanyAccount(comm("E23309878"), null, "Dominion Inc.", "4911", "510-657-4911", {})
    loadCompanyAccount(comm("E23265098"), null, "Burrell Enterprises",          "5074", "650-345-5074",
                                    \ ab -> {addPersonsAsDrivers(ab, {findPerson("Patrick", "O'Connor"), 
                                                                      findPerson("Anna", "Raymond")}, true /* ANI */)
                                             addPersonsAsDrivers(ab, {findPerson("Ellen", "Smythe Jones")} /* not ANI */)})
    loadCompanyAccount(comm("E23728063"), null, "Houston Lumber and Sheetrock", "5031", "650-763-5031", {"The Perfect Space"}) // ANI
    loadCompanyAccount(comm("E33677349"), null, "Bi-Metal Thermometers",        "3829", "650-269-2777", {})
    loadCompanyAccount(comm("E33674036"), null, "That Championship Season",     "5999", "650-269-2785", {})
    loadCompanyAccount(comm("E52348506"), null, "Bösendorfer USA",              "3931", "650-736-3931",  
                                    \ ab -> {addDrivers(ab, {buildDriver("Newton", "Applebee", "MA")}, true /* ANI */)})
    loadCompanyAccount(comm("E71929847"), null, "Bach Society",                 "7997", "650-582-1032",
                                    \ ab -> {addPersonsAsDrivers(ab, {findPerson("Ellen", "Smythe Jones")}, true /* ANI */)})
    loadCompanyAccount(comm("E57268234"), null, "Pat O'Brian's",                "5813", "408-687-3458", {})
    loadCompanyAccount(comm("E42540974"), null, "Fung Lum Restaurant",          "5812", "510-587-5264",
                                    \ ab -> {addPersonsAsDrivers(ab, {findPerson("Jennifer", "Song")})})
    loadCompanyAccount(comm("E61209847"), null, "Sun and Fun",                  "7032",  "415-635-1329", {})

    // Add new company accounts just above this comment.  DO NOT INSERT INTO COMPANY LIST -- you should append only.

  }

}
