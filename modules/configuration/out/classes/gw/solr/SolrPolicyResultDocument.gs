package gw.solr

uses gw.api.solr.SolrDocument
uses java.util.Date
uses java.lang.StringBuilder

/**
 * Represents a PC search result
 */
@Export
class SolrPolicyResultDocument implements SolrDocument {

  var _policyNumber : String as PolicyNumber
  var _sliceDate : Date as SliceDate
  var _urn : String as URN
  var _periodID : String as PeriodID
  var _status : String as PeriodStatus
  var _jobType : String as JobType
  var _score : String as Score
  var _rank : int as Rank
  var _fullName : String as FullName
  var _company : String as Company
  var _productCode : String as ProductCode
  var _producer : String as Producer
  var _producerCodeOfService : String as ProducerCodeOfService
  var _addressLine1 : String as AddressLine1
  var _city : String as City
  var _state : String as State
  var _postalCode : String as PostalCode
  var _periodStart : Date as PeriodStart
  var _periodEnd : Date as PeriodEnd
  var _officialId : String as OfficialId
  var _aniCompanies : List<String> as ANICompanies = {}
  var _aniPersons : List<String> as ANIPersons = {}
  var _phones : List<String> as Phones

  override function toString() : String {
    var sb = new StringBuilder()
    sb.append(typeof this)
    sb.append("[")

    sb.append("PolicyNumber=").append(PolicyNumber).append(", ")
    sb.append("URN=").append(URN).append(", ")
    sb.append("PeriodID=").append(PeriodID).append(", ")
    sb.append("PeriodStatus=").append(PeriodStatus).append(", ")
    sb.append("JobType=").append(JobType).append(", ")
    sb.append("Score=").append(Score).append(", ")
    sb.append("Rank=").append(Rank).append(", ")
    sb.append("FullName=").append(FullName).append(", ")
    sb.append("Company=").append(Company).append(", ")
    sb.append("ProductCode=").append(ProductCode).append(", ")
    sb.append("Producer=").append(Producer).append(", ")
    sb.append("ProducerCodeOfService=").append(ProducerCodeOfService).append(", ")
    sb.append("AddressLine1=").append(AddressLine1).append(", ")
    sb.append("City=").append(City).append(", ")
    sb.append("State=").append(State).append(", ")
    sb.append("PostalCode=").append(PostalCode).append(", ")
    sb.append("PeriodStart=").append(PeriodStart).append(", ")
    sb.append("PeriodEnd=").append(PeriodEnd).append(", ")
    sb.append("SliceDate=").append(SliceDate)
    sb.append("OfficialId=").append(OfficialId).append(", ")
    sb.append("ANICompanies=").append(ANICompanies).append(", ")
    sb.append("ANIPersons=").append(ANIPersons).append(", ")
    sb.append("Phone=").append(Phones)

    sb.append("]")

    return sb.toString()
  }

  property get PolicyNumberDisplayString(): String {
    return _policyNumber.NotBlank ? _policyNumber : displaykey.EntityName.PolicyPeriod.PolicyNumber.Unassigned
  }

  property get PrimaryInsuredName() : String {
    return Company.HasContent ? Company : FullName
  }

  property get PolicyAddress() : String {
    return AddressLine1 + "\n" + City + ", " + State + " " + PostalCode
  }

  property get AdditionalInsureds() : List<String>{
    return _aniPersons.union(_aniCompanies).order()
  }


}
