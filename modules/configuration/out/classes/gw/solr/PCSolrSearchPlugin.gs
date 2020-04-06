package gw.solr

uses gw.api.solr.SolrResponse
uses gw.api.system.PCDependenciesGateway
uses gw.plugin.solr.ISolrSearchPlugin
uses gw.plugin.solr.SolrSearchStore
uses gw.solr.mapper.BuildANICompanyName
uses gw.solr.mapper.BuildANIPersonName
uses gw.solr.mapper.BuildCompanyName
uses gw.solr.mapper.BuildOfficialIds
uses gw.solr.mapper.BuildPNIPhones
uses gw.solr.mapper.BuildPersonName
uses gw.solr.mapper.BuildTypeOf
uses gw.solr.utils.PCSolrUtils
uses org.apache.solr.client.solrj.SolrRequest
uses org.apache.solr.client.solrj.request.QueryRequest

uses java.lang.ExceptionInInitializerError
uses java.util.Collections
uses java.util.Map
uses gw.api.solr.SolrUtil
uses org.slf4j.Logger
uses gw.plugin.Plugins
uses gw.api.util.DisplayableException

/**
 *  Submits PC solr search requests
 */
@Export
class PCSolrSearchPlugin extends AbstractSolrSearchPlugin implements ISolrSearchPlugin<SolrPolicySearchCriteria, SolrPolicyResultDocument> {

  protected static final var LOGGER : Logger = PCSolrUtils.Logger
  
  final var _appId : String as AppId = "pc"
  final var _documentID : String as DocumentID = "policy"
  final var _documentType : String as DocumentType = AppId + "_policy"
  final var _pcCorePrefix : String as PCCorePrefix = "pc-gwsolr"

  construct() {
    super("PCSolrSearchPlugin")
  }

  static property get Enabled() : boolean {
    return Plugins.isEnabled(ISolrSearchPlugin<SolrPolicySearchCriteria, SolrPolicyResultDocument>)
  }

  static function checkEnabled() {
    if (not Enabled) {
      throw new DisplayableException(displaykey.SolrSearchPlugin.Error.NotEnabled)
    }
  }

  override function search(searchCriteria : SolrPolicySearchCriteria) : SolrResponse<SolrPolicyResultDocument> {
    checkEnabled()
    LOGGER.trace("PCSolrSearchPlugin.search(SolrPolicySearchCriteria)")
    var searchRequest = new SolrPolicySearchRequest(searchCriteria)
    var solrQuery = constructSearchQuery(searchRequest)
    if(LOGGER.DebugEnabled) LOGGER.debug("Query: " + solrQuery)
    var solrServer = PCDependenciesGateway.getSolrServerMgr().findServer(searchRequest.getDocumentType())
    var queryRequest = new QueryRequest(solrQuery, SolrRequest.METHOD.POST) // must use POST!
    var solrResponse = queryRequest.process(solrServer)
    
    var results : List<SolrPolicyResultDocument>
    if(solrResponse.Status == 0) {
      if(LOGGER.DebugEnabled) LOGGER.debug("Query response:" + (solrResponse != null ? "\n" + solrResponse : "(null)"))
      results = searchRequest.processQueryResponse(solrResponse, 0, SolrSearchStore.ACTIVE)
    } else {
      LOGGER.warn("Query failed with response code " + solrResponse.Status + ", content = " + solrResponse.toString())
      results = Collections.emptyList<SolrPolicyResultDocument>()
    }
/*
    var periodList = results.where(\ result -> result.PeriodStatus != PolicyPeriodStatus.TC_BOUND.Code)*.PeriodID
    var includedList = Query.make(PolicyPeriod).compareIn("PublicID", periodList).select()*.PublicID
    var excludedList = periodList.subtract(includedList).toSet()
    var response = new SolrResponse<SolrPolicyResultDocument>(results.where(\ result ->not excludedList.contains(result.PeriodID)))
    return response
 */
    return new SolrResponse<SolrPolicyResultDocument>(results)

  }

  // override of function cannot be replaced with property
  override function setParameters(params : Map<Object,Object>) {
    super.setParameters(params)
  }
  
  /**
   * Create a unique key.
   * IMPORTANT: Until and unless there is platform support for this, the unique keying
   * functionality MUST BE KEPT IN SYNC WITH policy-search-config.xml.
   */
  override function getSolrUniqueKey(period : PolicyPeriod) : String {
    checkEnabled()

    var indexLogger = gw.api.system.PCLoggerCategory.SOLR_INDEXING
// This policy is implemented in the digester
//    if (period.Status != TC_BOUND) {
//      indexLogger.trace("Period is unbound so public ID is used as unique key: ${period.PublicID}")
//      return period.PublicID
//    }
//
    var sb = new XformDigest() {:Capture = indexLogger.DebugEnabled}

    var changedContact = PCSolrUtils.getBeanFromBundle(period.PNIContactDenorm, period.Bundle) as Contact
    
    var pniContact = period.PNIContactDenorm
    
    // PLEASE KEEP THIS IN THE SAME ORDER AS schema.xml to make it easier to keep up-to-date.
    
    sb.append("urn", period.Policy.PublicID)             // should be ignored by digester
    sb.append("periodID", period.PublicID)               // should be ignored by digester
    sb.append("policyPublicID", period.Policy.PublicID)  // should be ignored by digester
    sb.append("periodStatus", period.Status.Code)
    
    sb.append("policyNumber", period.PolicyNumber)
    
    var pni = period.PrimaryNamedInsured
    if (pni.ContactDenorm typeis Person) {
      sb.append("fullName", BuildPersonName.mapRoleToFullName(pni))
    }
    var personNames = BuildANIPersonName.buildANIPersonNameList(period.PolicyContactRoles).sort()
    sb.append("ANIfullName", personNames)

    if (pni.ContactDenorm typeis Company) {
      sb.append("companyName", BuildCompanyName.mapRoleToCompanyName(pni))
    }
    var companyNames = BuildANICompanyName.buildANICompanyNameList(period.PolicyContactRoles)
    sb.append("ANIcompanyName", companyNames)

    sb.append("addressLine1", period.PolicyAddress.AddressLine1)
    sb.append("city", period.PolicyAddress.City)
    sb.append("state", period.PolicyAddress.State.Code)
    sb.append("postalCode", period.PolicyAddress.PostalCode)

    sb.append("product", period.Policy.Product.Code)
    sb.append("jurisdiction", period.BaseState.Code)
    sb.append("producer", period.ProducerCodeOfRecord.Organization.Name)
    sb.append("producerCodeOfService", period.Policy.ProducerCodeOfService.Code)

    sb.append("phone", BuildPNIPhones.extractPhones(changedContact?:pniContact))
    
    sb.append("policyStart", period.PolicyStartDate.ShortFormat) // should be ignored by digester   TODO: confirm this
    sb.append("policyEnd", period.PolicyEndDate.ShortFormat)     // should be ignored by digester
    sb.append("periodStart", period.PeriodStart.ShortFormat)     // should be ignored by digester
    sb.append("periodEnd", period.PeriodEnd.ShortFormat)         // should be ignored by digester
    sb.append("sliceDate", period.SliceDate.ShortFormat)         // should be ignored by digester

    // Q: Is pniContact the right thing to use here, or should we use pni.ContactDenorm
    // so that the SSN and the PNI FullName match?
    sb.append("officialId", BuildOfficialIds.buildOfficialId(pniContact.OfficialIDs))  
    sb.append("jobType", BuildTypeOf.mapType(period.Job))        // should be ignored by digester
    
    if (sb.Capture) {
      var digestString = sb.Digest
      indexLogger.debug("getSolrUniqueKey(${period.PublicID}) returned '${digestString}' derived from:")
      for (line in sb.DebugString.split("\n")) {
        indexLogger.debug("    ${line}")
      }
      return digestString
    } else {
      return sb.Digest
    }
  }

  private static class XformDigest {
    var xformer = initXformer()

    static function initXformer(): SolrUtil.DigestTransformer {
      checkEnabled()
      try {
        var xml =
              "<transformer name=\"digestTransformer\" class=\"com.guidewire.solr.pc.batchload.xform.PCDigestTransformer\""
            + " algorithm=\"SHA\""
            + " ignoreElems=\"urn, periodID, policyPublicID, sliceDate, periodStart, periodEnd, "
            +                        "policyStart, policyEnd, periodIdWithSliceDate, jobType\"/>";
        return SolrUtil.makeDigestTransformer(xml)
      } catch (e : ExceptionInInitializerError) {
        e.Cause.printStackTrace()
        throw e
      }
    }
  
    var buffer : List<String> = {}
    var _capture : boolean as Capture

    function append(label : String, values : List<String>) {
      values.each(\ str -> append(label, str))
    }

    function append(label : String, str : String) {
      if (str != null and str.trim().length > 0) {
        buffer.add(label.toUpperCase() + "=" + str)
      }
    }

    property get DebugString() : String {
      return buffer.toString()
    }

    property get Digest() : String {
      return xformer.createDigest(buffer)
    }
  }
}
