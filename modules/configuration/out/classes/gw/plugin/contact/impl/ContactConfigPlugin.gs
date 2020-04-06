package gw.plugin.contact.impl

uses gw.plugin.contact.IContactConfigPlugin
uses gw.lang.reflect.TypeSystem
uses java.lang.IllegalStateException
uses gw.util.AutoMap
uses gw.entity.TypeKey
uses java.lang.IllegalArgumentException
uses java.util.Map


@Export
class ContactConfigPlugin implements IContactConfigPlugin {
  
  protected var _accountContactRoleConfigLookup : Map<typekey.AccountContactRole, ContactConfig> = new AutoMap<typekey.AccountContactRole, ContactConfig>(\ a : typekey.AccountContactRole -> ContactConfig.EMPTY_CONTACT_CONFIG)
  protected var _policyContactRoleConfigLookup : Map<typekey.PolicyContactRole, ContactConfig> = new AutoMap<typekey.PolicyContactRole, ContactConfig>(\ p : typekey.PolicyContactRole -> ContactConfig.EMPTY_CONTACT_CONFIG)
  
  protected property get DefaultConfigs() : ContactConfig[] {
    return {
      new ContactConfig(true, {"company", "person"}, "AccountHolder",      {}),
      new ContactConfig(true, {"company", "person"}, "AccountingContact",  {}),
      new ContactConfig(true, {"company", "person"}, "AdditionalInsured",  {"PolicyAddlInsured"}),
      new ContactConfig(true, {"company", "person"}, "AdditionalInterest", {"PolicyAddlInterest"}),
      new ContactConfig(true, {"company", "person"}, "BillingContact",     {"PolicyBillingContact"}),
      new ContactConfig(true, {"company", "person"}, "ClaimsInfoContact",  {}),
      new ContactConfig(true, {           "person"}, "Driver",             {"PolicyDriver"}),
      new ContactConfig(true, {"company", "person"}, "InspectionContact",  {}),
      new ContactConfig(true, {"company"          }, "LaborClient",        {"PolicyLaborClient"}),
      new ContactConfig(true, {"company"          }, "LaborContractor",    {"PolicyLaborContractor"}),
      new ContactConfig(true, {"company", "person"}, "NamedInsured",       {"PolicyPriNamedInsured", "PolicySecNamedInsured", "PolicyAddlNamedInsured"}),
      new ContactConfig(true, {           "person"}, "OwnerOfficer",       {"PolicyOwnerOfficer"}),
      new ContactConfig(true, {"company", "person"}, "SecondaryContact",   {})
    }
  }
  
  public construct() {
    loadDefaultConfig()
    validateAllConcreteUnretiredAccountContactRoleTypesAreInLookup()
    validateAllConcreteUnretiredPolicyContactRoleTypesAreInLookup()
  }
  
  final public function loadDefaultConfig() {
    for (config in DefaultConfigs) {
      validateConfig(config)
      loadConfig(config)
    }
  }
  
  final protected function validateConfig(config : ContactConfig) {
    if (_accountContactRoleConfigLookup.containsKey(config.AccountContactRoleType)) {
      throw new IllegalArgumentException(displaykey.ContactConfigPlugin.Error.MultipleAccountContactRoles(config.AccountContactRoleType))
    }
    if (config.AccountContactRoleType.Retired) {
      throw new IllegalArgumentException(displaykey.ContactConfigPlugin.Error.RetiredAccountContactRole(config.AccountContactRoleType))
    }
    if (isSubtypeKeyAbstract(config.AccountContactRoleType)) {
      throw new IllegalArgumentException(displaykey.ContactConfigPlugin.Error.AbstractAccountContactRole(config.AccountContactRoleType))
    }
    for (pcrType in config.PolicyContactRoleTypes) {
      if (_policyContactRoleConfigLookup.containsKey(pcrType)) {
        throw new IllegalArgumentException(displaykey.ContactConfigPlugin.Error.MultiplePolicyContactRoles(pcrType))
      }
      if (pcrType.Retired) {
        throw new IllegalArgumentException(displaykey.ContactConfigPlugin.Error.RetiredPolicyContactRole(pcrType))
      }
      if (isSubtypeKeyAbstract(pcrType)) {
        throw new IllegalArgumentException(displaykey.ContactConfigPlugin.Error.AbstractPolicyContactRole(pcrType))
      }
    }
  }
  
  public function loadConfig(config : ContactConfig) {
    _accountContactRoleConfigLookup.put(config.AccountContactRoleType, config)
    for (pcrType in config.PolicyContactRoleTypes) {
      _policyContactRoleConfigLookup.put(pcrType, config)
    }
  }

  final protected function validateAllConcreteUnretiredAccountContactRoleTypesAreInLookup() {
    for (acrType in typekey.AccountContactRole.getTypeKeys(false)) {
      if (not isSubtypeKeyRetiredOrAbstract(acrType) and not _accountContactRoleConfigLookup.containsKey(acrType)) {
        throw new IllegalStateException(displaykey.ContactConfigPlugin.Error.UnconfiguredAccountContactRole(acrType))
      }
    }
  }
  
  final protected function validateAllConcreteUnretiredPolicyContactRoleTypesAreInLookup() {
    for (pcrType in typekey.PolicyContactRole.getTypeKeys(false)) {
      if (not isSubtypeKeyRetiredOrAbstract(pcrType) and not _policyContactRoleConfigLookup.containsKey(pcrType)) {
        throw new IllegalStateException(displaykey.ContactConfigPlugin.Error.UnconfiguredPolicyContactRole(pcrType))
      }
    }
  }
  
  override function getAllowedContactTypesForAccountContactRoleType(subtypeKey : typekey.AccountContactRole): typekey.ContactType[] {
    return _accountContactRoleConfigLookup.get(subtypeKey).ContactTypes.toTypedArray()
  }

  override function getAllowedContactTypesForPolicyContactRoleType(subtypeKey : typekey.PolicyContactRole): typekey.ContactType[] {
    return _policyContactRoleConfigLookup.get(subtypeKey).ContactTypes.toTypedArray()
  }
  
  override function canBeRole(contactType : typekey.ContactType, accountContactRoleSubtypeKey : typekey.AccountContactRole) : boolean {
    return getAllowedContactTypesForAccountContactRoleType(accountContactRoleSubtypeKey).contains(contactType)
  }
  
  private function isSubtypeKeyRetiredOrAbstract(subtypeKey : TypeKey) : boolean {
    return subtypeKey.Retired or isSubtypeKeyAbstract(subtypeKey)
  }

  private function isSubtypeKeyAbstract(subtypeKey : TypeKey) : boolean {
    return TypeSystem.getByFullName("entity." + subtypeKey.Code).Abstract
  }
  
  override function isAccountContactTypeAvailable(subtypeKey : typekey.AccountContactRole) : boolean {
    return subtypeKey != null and not isSubtypeKeyRetiredOrAbstract(subtypeKey) and _accountContactRoleConfigLookup.get(subtypeKey).Enabled
  }

  override property get AvailableAccountContactRoleTypes() : typekey.AccountContactRole[] {
    return typekey.AccountContactRole.getTypeKeys(false).where(\ a -> isAccountContactTypeAvailable(a)).toTypedArray()
  }

  override function getAccountContactRoleTypeDisplayName(subtypeKey : typekey.AccountContactRole) : String {
    return TypeSystem.getByFullName("entity." + subtypeKey).TypeInfo.DisplayName
  }

  override function getAccountContactRoleTypeFor(subtypeKey : typekey.PolicyContactRole): typekey.AccountContactRole {
    return _policyContactRoleConfigLookup.get(subtypeKey).AccountContactRoleType
  }

  override function minimumCriteriaSet(searchCriteria : ContactSearchCriteria) : boolean {

    //User search is already well restricted
    if (searchCriteria.ContactSubtype == typekey.Contact.TC_USERCONTACT) return true
    //TaxID and Phone number are considered to be minimially sufficent in all cases on their own.
    //If searching for a company, then company name is also sufficent is it has at least five characters
    //A personal name requires that it be used in conjunction with a city/state or a zip code.
    if (searchCriteria.TaxID.NotBlank || searchCriteria.Phone.NotBlank) return true
    
    if (searchCriteria.ContactSubtype == typekey.Contact.TC_PERSON) {
      var has_location = searchCriteria.Address.PostalCode.NotBlank ||
                         ((searchCriteria.Address.City.NotBlank || searchCriteria.Address.CityKanji.NotBlank)
                             && searchCriteria.Address.State != null)
      var has_firstname = (searchCriteria.FirstName.NotBlank && (searchCriteria.FirstName.length >= 3 || searchCriteria.FirstNameExact))
      var has_lastname = (searchCriteria.Keyword.NotBlank && (searchCriteria.Keyword.length >= 3 || searchCriteria.KeywordExact))
      var has_name = has_firstname && has_lastname

      var hasKanjiName = searchCriteria.FirstNameKanji.NotBlank || searchCriteria.KeywordKanji.NotBlank

      return has_name && (searchCriteria.KeywordExact || has_location || searchCriteria.PermissiveSearch)
          || hasKanjiName
    }
    else if (searchCriteria.ContactSubtype == typekey.Contact.TC_COMPANY) {
      //if taxid or phone was provided we've already bailed.
      if (searchCriteria.Keyword.NotBlank && (searchCriteria.KeywordExact ||
                                              searchCriteria.Keyword.length() >= 5 ||
                                              searchCriteria.PermissiveSearch)) return true
      if (searchCriteria.KeywordKanji.NotBlank) return true
    }
    return false
  }
}
