package gw.api.databuilder.admin.affinitygroup

uses gw.api.databuilder.DataBuilder
uses gw.api.databuilder.UniqueKeyGenerator

uses java.util.Date

@Export
class AffinityGroupBuilder extends DataBuilder<AffinityGroup, AffinityGroupBuilder> {

  construct() {
    super(AffinityGroup)
    constructWithRequiredData()
  }

  private function constructWithRequiredData() {
    var rn = UniqueKeyGenerator.get().nextID()
    set(AffinityGroup.Type.TypeInfo.getProperty("Name"), "Grp-"+rn)
    set(AffinityGroup.Type.TypeInfo.getProperty("AffinityGroupType"), AffinityGroupType.TC_OPEN)
  }

  function withName(name : String) : AffinityGroupBuilder {
    set(AffinityGroup.Type.TypeInfo.getProperty("Name"), name)
    return this
  }

  function withNameKanji(name : String) : AffinityGroupBuilder {
    set(AffinityGroup.Type.TypeInfo.getProperty("NameKanji"), name)
    return this
  }
   
  function withAffinityGroupType(type : AffinityGroupType) : AffinityGroupBuilder {
    set(AffinityGroup.Type.TypeInfo.getProperty("AffinityGroupType"),type)
    return this
  }
  
  function withOrganization(organization : Organization) : AffinityGroupBuilder {
    set(AffinityGroup.Type.TypeInfo.getProperty("Organization"), organization)
    return this
  }
  
   function withPrimaryContactFirstName(firstName : String) : AffinityGroupBuilder {
    set(AffinityGroup.Type.TypeInfo.getProperty("PrimaryContactFirstName"), firstName)
    return this
  }
  
   function withPrimaryContactLastName(lastName : String) : AffinityGroupBuilder {
    set(AffinityGroup.Type.TypeInfo.getProperty("PrimaryContactLastName"),lastName)
    return this
  }

  function withPrimaryContactFirstNameKanji(firstName : String) : AffinityGroupBuilder {
    set(AffinityGroup.Type.TypeInfo.getProperty("FirstNameKanji"), firstName)
    return this
  }

  function withPrimaryContactLastNameKanji(lastName : String) : AffinityGroupBuilder {
    set(AffinityGroup.Type.TypeInfo.getProperty("LastNameKanji"),lastName)
    return this
  }
  
  function withPrimaryContactPhone(phone : String) : AffinityGroupBuilder {
    set(AffinityGroup.Type.TypeInfo.getProperty("PrimaryContactPhone"),phone)
    return this
  }
  
  function withStartDate(startDate : Date) : AffinityGroupBuilder {
    set(AffinityGroup.Type.TypeInfo.getProperty("StartDate"),startDate)
    return this
  }
  
  function withEndDate(endDate : Date) : AffinityGroupBuilder {
    set(AffinityGroup.Type.TypeInfo.getProperty("EndDate"),endDate)
    return this
  }
  
  function withDescription(description : String) : AffinityGroupBuilder {
    set(AffinityGroup.Type.TypeInfo.getProperty("Description"),description)
    return this
  }
  
  function withJurisdiction(jurisdictionBuilder : AffinityGroupJurisdictionBuilder) : AffinityGroupBuilder {
    addArrayElement(AffinityGroup.Type.TypeInfo.getProperty("Jurisdictions"), jurisdictionBuilder)
    return this
  }
  
  function withProduct(productBuilder : AffinityGroupProductBuilder) : AffinityGroupBuilder {
    addArrayElement(AffinityGroup.Type.TypeInfo.getProperty("Products"), productBuilder)
    return this
  }
  
  function withProducerCode(producerCodeBuilder : AffinityGroupProducerCodeBuilder) : AffinityGroupBuilder {
    addArrayElement(AffinityGroup.Type.TypeInfo.getProperty("AffinityGroupProducerCodes"), producerCodeBuilder)
    return this
  }
}