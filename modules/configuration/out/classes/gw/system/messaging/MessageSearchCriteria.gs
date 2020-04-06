package gw.system.messaging
uses java.lang.Integer
uses gw.datatype.annotation.DataType
uses gw.api.database.IQueryBeanResult
uses gw.api.database.Query
uses gw.search.EntitySearchCriteria

@Export
class MessageSearchCriteria extends EntitySearchCriteria<Message> {
  
  var _destination : Integer as Destination
  var _jobNumber : String as JobNumber
  var _accountNumber : String as AccountNumber
  var _policyNumber : String 
  var _productCode : String
  var _jobType : JobIntSubtype as JobType
  var _messageStatus : MessageSearchStatus as MessageStatus  

  construct() {
  }
  
  @DataType("patterncode")
  property get ProductCode() : String {
    return _productCode
  }
  
  property set ProductCode(value : String) {
    _productCode = value
  }
  
  @DataType("policynumber")
  property get PolicyNumber() : String {
    return _policyNumber
  }
  
  property set PolicyNumber(value : String) {
    _policyNumber = value
  }
  
  override protected function doSearch() : IQueryBeanResult<Message> {
    var messageQuery = new Query<Message>(Message)
    var periodTable = messageQuery.join("PolicyPeriod")
    var policyTable = periodTable.join("Policy")
    var accountTable = policyTable.join("Account")
    var jobTable = periodTable.join("Job")
    if (MessageStatus == MessageSearchStatus.TC_FAILED) {
      messageQuery.compareIn("Status", gw.pl.messaging.MessageStatus.ERROR_STATES)
    } else if (MessageStatus == MessageSearchStatus.TC_NEEDRETRY) {
      messageQuery.compareIn("Status", gw.pl.messaging.MessageStatus.RETRYABLE_STATES)
    }
    
    if (Destination != null) {
      messageQuery.compare("DestinationID", Equals, Destination);
    }

    if (PolicyNumber != null) {
      periodTable.compare("PolicyNumber", Equals, PolicyNumber);
    }

    if (AccountNumber != null) {
      accountTable.compare("AccountNumber", Equals, AccountNumber);
    }

    if (ProductCode != null) {
      policyTable.compare("ProductCode", Equals, ProductCode);
    }

    if (JobNumber != null) {
      jobTable.compare("JobNumber", Equals, JobNumber);
    }

    if (JobType != null) {
      jobTable.compare("SubType", Equals, JobType);
    }

    
    return messageQuery.select()
  }

  override protected property get InvalidSearchCriteriaMessage() : String {
    return null
  }

  override protected property get MinimumSearchCriteriaMessage() : String {
    return null
  }

}
