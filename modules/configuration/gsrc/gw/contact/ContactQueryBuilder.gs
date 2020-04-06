package gw.contact

uses gw.address.AddressQueryBuilder
uses gw.api.database.ISelectQueryBuilder
uses gw.api.util.PhoneUtil
uses gw.search.EntityQueryBuilder
uses gw.search.StringColumnRestrictor

uses java.lang.IllegalStateException
uses gw.lang.reflect.features.PropertyReference

@Export
class ContactQueryBuilder extends EntityQueryBuilder<Contact> {
  var _firstName : String
  var _firstNameRestrictor : StringColumnRestrictor
  var _lastName : String
  var _lastNameRestrictor : StringColumnRestrictor
  var _personNameRestrictor : PersonNameRestrictor = FirstAndLast
  var _companyName : String
  var _companyNameRestrictor : StringColumnRestrictor

  var _firstNameKanji : String
  var _firstNameKanjiRestrictor : StringColumnRestrictor
  var _lastNameKanji : String
  var _lastNameKanjiRestrictor : StringColumnRestrictor
  var _companyNameKanji : String
  var _companyNameKanjiRestrictor : StringColumnRestrictor
  var _particle: String
  var _particleRestrictor : StringColumnRestrictor
  
  var _workPhone : String
  var _taxId : String
  var _officialId: String

  var _cityDenorm : String
  var _cityDenormRestrictor : StringColumnRestrictor
  var _cityKanjiDenorm : String
  var _cityKanjiDenormRestrictor : StringColumnRestrictor
  var _stateDenorm : State
  var _postalCodeDenorm : String
  var _postalCodeDenormRestrictor : StringColumnRestrictor
  var _country : Country
  var _primaryAddress : AddressQueryBuilder
  
  function withFirstName(value : String) : ContactQueryBuilder {
    return withFirstNameRestricted(value, EqualsIgnoringCase)
  }

  function withFirstNameStarting(value : String) : ContactQueryBuilder {
    return withFirstNameRestricted(value, StartsWithIgnoringCase)
  }
  
  function withFirstNameRestricted(value : String, restrictor : StringColumnRestrictor) : ContactQueryBuilder {
    _firstName = value
    _firstNameRestrictor = restrictor
    return this
  }

  function withLastName(value : String) : ContactQueryBuilder {
    return withLastNameRestricted(value, EqualsIgnoringCase)
  }

  function withLastNameStarting(value : String) : ContactQueryBuilder {
    return withLastNameRestricted(value, StartsWithIgnoringCase)
  }
  
  function withLastNameRestricted(value : String, restrictor : StringColumnRestrictor) : ContactQueryBuilder {
    _lastName = value
    _lastNameRestrictor = restrictor
    return this
  }
  
  function withPersonNameRelationship(value : PersonNameRestrictor) : ContactQueryBuilder {
    _personNameRestrictor = value
    return this
  }

  function withCompanyName(value : String) : ContactQueryBuilder {
    return withCompanyNameRestricted(value, EqualsIgnoringCase)
  }

  function withCompanyNameStarting(value : String) : ContactQueryBuilder {
    return withCompanyNameRestricted(value, StartsWithIgnoringCase)
  }

  function withCompanyNameRestricted(value : String, restrictor : StringColumnRestrictor) : ContactQueryBuilder {
    _companyName = value
    _companyNameRestrictor = restrictor
    return this
  }

  function withFirstNameKanji(value : String) : ContactQueryBuilder {
    withFirstNameKanjiRestricited(value, StartsWith)
    return this
  }

  function withFirstNameKanjiRestricited(value : String, restrictor : StringColumnRestrictor) : ContactQueryBuilder {
    _firstNameKanji = value
    _firstNameKanjiRestrictor = restrictor
    return this
  }

  function withLastNameKanji(value : String) : ContactQueryBuilder {
    withLastNameKanjiRestricted(value, StartsWith)
    return this
  }

  function withLastNameKanjiRestricted(value : String, restrictor : StringColumnRestrictor) : ContactQueryBuilder {
    _lastNameKanji = value
    _lastNameKanjiRestrictor = restrictor
    return this
  }

  function withCompanyNameKanji(value : String) : ContactQueryBuilder {
    withCompanyNameKanjiRestricted(value, StartsWith)
    return this
  }

  function withCompanyNameKanjiRestricted(value : String, restrictor : StringColumnRestrictor) : ContactQueryBuilder {
    _companyNameKanji = value
    _companyNameKanjiRestrictor = restrictor
    return this
  }

  function withParticleRestricted(value : String, restrictor : StringColumnRestrictor) : ContactQueryBuilder {
    _particle = value
    _particleRestrictor = restrictor
    return this
  }

  function withParticle(value : String) : ContactQueryBuilder {
    return withParticleRestricted(value, StartsWithIgnoringCase)
  }

  function withWorkPhone(value : String) : ContactQueryBuilder {
    _workPhone = value
    return this
  }
  
  function withTaxId(value : String) : ContactQueryBuilder {
    _taxId = value
    return this
  }

  function withOfficialId(value : String) : ContactQueryBuilder {
    _officialId = value
    return this
  }
  
  function withCityDenormStarting(value : String) : ContactQueryBuilder {
    withCityDenormRestricted(value, StartsWithIgnoringCase)
    return this
  }

  function withCityDenormRestricted(value : String, restrictor : StringColumnRestrictor) : ContactQueryBuilder {
    _cityDenorm = value
    _cityDenormRestrictor = restrictor
    return this
  }

  function withCityKanjiDenormStarting(value : String) : ContactQueryBuilder {
    withCityKanjiDenormRestricted(value, StartsWith)
    return this
  }

  function withCityKanjiDenormRestricted(value : String, restrictor : StringColumnRestrictor) : ContactQueryBuilder {
    _cityKanjiDenorm = value
    _cityKanjiDenormRestrictor = restrictor
    return this
  }

  function withCountryDenorm(value : Country) : ContactQueryBuilder {
    _country = value
    return this
  }

  function withPostalCodeDenormStarting(value : String) : ContactQueryBuilder {
    withPostalCodeDenormRestricted(value, StartsWith)
    return this
  }

  function withPostalCodeDenormRestricted(value : String, restrictor : StringColumnRestrictor) : ContactQueryBuilder {
    _postalCodeDenorm = value
    _postalCodeDenormRestrictor = restrictor
    return this
  }

  function withStateDenorm(value : State) : ContactQueryBuilder {
    _stateDenorm = value
    return this
  }

  function withPrimaryAddress(value : AddressQueryBuilder) : ContactQueryBuilder {
    _primaryAddress = value
    return this
  }

  override function doRestrictQuery(selectQueryBuilder : ISelectQueryBuilder) {
    if (HasPersonName and HasCompanyName) {
      throw new IllegalStateException(displaykey.ContactQueryBuilder.Error.PersonAndCompanyNameCriteria)
    } else if (HasPersonName) {
      selectQueryBuilder.cast(Person)
      _personNameRestrictor.restrict(selectQueryBuilder, _firstNameRestrictor, _firstName, _lastNameRestrictor, _lastName)
    } else if (HasCompanyName) {
      _companyNameRestrictor.restrict(selectQueryBuilder, Company#Name.PropertyInfo.Name, _companyName)
    }

    if (_firstNameKanji.NotBlank) {
      selectQueryBuilder.cast(Person)
      _firstNameKanjiRestrictor.restrict(selectQueryBuilder, Person#FirstNameKanji.PropertyInfo.Name, _firstNameKanji)
    }
    if (_lastNameKanji.NotBlank) {
      selectQueryBuilder.cast(Person)
      _lastNameKanjiRestrictor.restrict(selectQueryBuilder, Person#LastNameKanji.PropertyInfo.Name, _lastNameKanji)
    }
    if (_companyNameKanji.NotBlank) {
      selectQueryBuilder.cast(Company)
      _companyNameKanjiRestrictor.restrict(selectQueryBuilder, Company#NameKanji.PropertyInfo.Name, _companyNameKanji)
    }
    if (_particle.NotBlank) {
      selectQueryBuilder.cast(Person)
      _particleRestrictor.restrict(selectQueryBuilder, Person#Particle.PropertyInfo.Name, _particle)
    }
    if (_workPhone.NotBlank) {
      var country = PhoneUtil.getDefaultPhoneCountryCode()
      var gwPhone = PhoneUtil.parse(_workPhone, country);
      if (gwPhone != null) {
        selectQueryBuilder.compare(Contact#WorkPhone.PropertyInfo.Name, Equals, gwPhone.NationalNumber)
      } else {
        throw new gw.api.util.DisplayableException(displaykey.Java.PhoneUtil.Error.ParseError(_workPhone))
      }
    }
    if (_taxId.NotBlank) {
      selectQueryBuilder.compare(Contact#TaxID.PropertyInfo.Name, Equals, _taxId)
    }
    if (_officialId.NotBlank) {
      var officialIdTable = selectQueryBuilder.join(entity.OfficialID, OfficialID#Contact.PropertyInfo.Name)
      new OfficialIDQueryBuilder().withValue(_officialId).restrictQuery(officialIdTable)
    }

    if (_cityDenorm.NotBlank) {
      _cityDenormRestrictor.restrict(selectQueryBuilder, Contact#CityDenorm.PropertyInfo.Name, _cityDenorm)
    }

    var haveCityKanjiDenorm = Contact.Type.TypeInfo.getProperty("CityKanjiDenorm") != null
    if (haveCityKanjiDenorm and _cityKanjiDenorm.NotBlank) {
      _cityKanjiDenormRestrictor.restrict(selectQueryBuilder, new PropertyReference(Contact, "CityKanjiDenorm").PropertyInfo.Name, _cityKanjiDenorm)
    }

    if (_stateDenorm != null) {
      selectQueryBuilder.compare(Contact#State.PropertyInfo.Name, Equals, _stateDenorm)
    }
    if (_postalCodeDenorm.NotBlank) {
      _postalCodeDenormRestrictor.restrict(selectQueryBuilder, Contact#PostalCodeDenorm.PropertyInfo.Name, _postalCodeDenorm)
    }
    if (_country != null) {
      selectQueryBuilder.compare(Contact#Country.PropertyInfo.Name, Equals, _country)
    }

    if (_primaryAddress != null) {
      var addressTable = selectQueryBuilder.subselect(Contact#PrimaryAddress.PropertyInfo.Name, CompareIn, Address, Address#Id.PropertyInfo.Name)
      _primaryAddress.restrictQuery(addressTable)
    }
  }
  
  protected property get HasPersonName() : boolean {
    return _firstName.NotBlank or _lastName.NotBlank
  }
  
  protected property get HasCompanyName() : boolean {
    return _companyName.NotBlank
  }
  
  /**
   * Enum defining restrictions we can apply to the first and last name.  In addition to handling
   * 'and' or 'or', the restrictors allow the use of a StringColumnRestrictor for each of the
   * columns.
   */
  public static enum PersonNameRestrictor {
    FirstAndLast(\ selectQueryBuilder, firstNameRestrictor, firstName, lastNameRestrictor, lastName -> {
          if (firstName.NotBlank) {
            firstNameRestrictor.restrict(selectQueryBuilder, Person#FirstName.PropertyInfo.Name, firstName)
          }
          if (lastName.NotBlank) {
            lastNameRestrictor.restrict(selectQueryBuilder, Person#LastName.PropertyInfo.Name, lastName)
          }
        }),
    FirstOrLast(\ selectQueryBuilder, firstNameRestrictor, firstName, lastNameRestrictor, lastName -> {
          if (firstName.NotBlank and lastName.NotBlank) {
            selectQueryBuilder.or(\ restriction -> firstNameRestrictor.restrict(restriction, Person#FirstName.PropertyInfo.Name, firstName))
            selectQueryBuilder.or(\ restriction -> lastNameRestrictor.restrict(restriction, Person#LastName.PropertyInfo.Name, lastName))
          } else {
            // if one of the names isn't filled in, then there's no point in creating an OR join and since the
            // name restrictors won't apply a restriction for a blank name, just use the FirstAndLast restrictor
            FirstAndLast.restrict(selectQueryBuilder, firstNameRestrictor, firstName, lastNameRestrictor, lastName)
          }
        }),
    
    var _restrictor : block(selectQueryBuilder : ISelectQueryBuilder, firstNameRestrictor : StringColumnRestrictor, firstName : String, lastNameRestrictor : StringColumnRestrictor, lastName : String)
    
    private construct(restrictor : block(selectQueryBuilder : ISelectQueryBuilder, firstNameRestrictor : StringColumnRestrictor, firstName : String, lastNameRestrictor : StringColumnRestrictor, lastName : String)) {
      _restrictor = restrictor
    }
    
    function restrict(selectQueryBuilder : ISelectQueryBuilder, firstNameRestrictor : StringColumnRestrictor, firstName : String, lastNameRestrictor : StringColumnRestrictor, lastName : String) {
      _restrictor(selectQueryBuilder, firstNameRestrictor, firstName, lastNameRestrictor, lastName)
    }
  }
  
}
