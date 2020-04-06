package gw.contactmapper.ab800

uses gw.webservice.contactapi.NameMapperImpl
uses gw.webservice.contactapi.NameMapper

/**
 * Class for handling name mapping between PolicyCenter and ContactManager entities and typelists.
 * If an entity is added to the contact graph, and the names differ between PolicyCenter and ContactManager,
 * then a mapping needs to be added to this class in the create() method below.  All entity names and
 * typelist values in the XML sent between the applications via the ABContactAPI are in terms of
 * the ContactManager data model, thus PolicyCenter needs to translate the names from the PolicyCenter
 * (local) namespace to the ContactManager (AB) namespace.
 */
@Export
class PCNameMapper extends NameMapperImpl<PCNameMapper> {

  private static var _instance : PCNameMapper

  internal static property get Instance() : NameMapper {
    if (_instance == null)
      _instance = create()
    return _instance
  }

  private construct() {
    super()
  }

  private static function create() : PCNameMapper {

    var nameMapper = new PCNameMapper()

        // This is the code to map PC entity, typelist and typecode names to the corresponding
        // AB names.  See NameMapperImpl for more documentation.

        // mapping from a PC entity to an AB entity
        .entity(Contact, "ABContact")
        .entity(Company, "ABCompany")
        .entity(Person, "ABPerson")
        .entity(ContactTag, "ABContactTag")
        .entity(ContactContact, "ABContactContact")
        .entity(ContactAddress, "ABContactAddress")

        // mapping from an AB to a PC entity
        .abToLocalEntity("ABAutoRepairShop", Company)
        .abToLocalEntity("ABAutoTowingAgcy", Company)
        .abToLocalEntity("ABCompanyVendor", Company)
        .abToLocalEntity("ABLawFirm", Company)
        .abToLocalEntity("ABMedicalCareOrg", Company)
        .abToLocalEntity("ABPolicyCompany", Company)
        .abToLocalEntity("ABAdjudicator", Person)
        .abToLocalEntity("ABAttorney", Person)
        .abToLocalEntity("ABDoctor", Person)
        .abToLocalEntity("ABPersonVendor", Person)
        .abToLocalEntity("ABPolicyPerson", Person)

        // Typelist mapping
        .typeList(TypeListMapping.make(MaritalStatus)
            .typeCode(MaritalStatus.TC_S, "single")
            .typeCode(MaritalStatus.TC_M, "married")
            .typeCode(MaritalStatus.TC_D, "divorced")
            .typeCode(MaritalStatus.TC_W, "widowed")
            .typeCode(MaritalStatus.TC_C, "common")
            .typeCode(MaritalStatus.TC_P, "separated")
            .typeCode(MaritalStatus.TC_U, "unknown"))

        .typeList(TypeListMapping.make(TaxFilingStatusType)
            .typeCode(TaxFilingStatusType.TC_SINGLE, "single")
            .typeCode(TaxFilingStatusType.TC_MARRIEDJOINT, "married-joint")
            .typeCode(TaxFilingStatusType.TC_MARRIEDSEP, "married-separate")
            .typeCode(TaxFilingStatusType.TC_SINGLEHH, "headofhousehold")
            .typeCode(TaxFilingStatusType.TC_WIDOW, "widow"))

    return nameMapper
  }
}
