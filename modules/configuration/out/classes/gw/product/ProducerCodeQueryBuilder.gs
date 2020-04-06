package gw.product

uses gw.api.database.ISelectQueryBuilder
uses gw.search.EntityQueryBuilder
uses gw.address.AddressQueryBuilder
uses gw.api.database.Query
uses gw.api.util.SecureProducerSearchUtil
uses gw.api.database.Relop
uses gw.search.StringColumnRestrictor

@Export
class ProducerCodeQueryBuilder extends EntityQueryBuilder<ProducerCode> {

  var _secure : Boolean
  var _useCreateAccountSecurity: Boolean
  var _filterByUserSecurityZones : Boolean
  var _code : String
  var _codeRestrictor : StringColumnRestrictor
  var _description : String
  var _descriptionRestrictor : StringColumnRestrictor
  var _parentCode : String
  var _parentCodeRestrictor : StringColumnRestrictor
  var _branchCode : String
  var _branchCodeRestrictor : StringColumnRestrictor
  var _missingPrefUW : Boolean
  var _status : ProducerStatus
  var _statusUse : ProducerStatusUse
  var _currency : Currency

  var _branch : Group
  var _producer : Organization
  var _producerUser : User
  var _prefUW : User

  var _addressQueryBuilder : AddressQueryBuilder

  function withSecure(value : Boolean) : ProducerCodeQueryBuilder {
    _secure = value
    return this
  }
   
  function withCreateAccountSecurity(value : Boolean) : ProducerCodeQueryBuilder {
    _useCreateAccountSecurity = value
    return this
  }

  function withFilterByUserSecurityZones(value : Boolean) : ProducerCodeQueryBuilder {
    _filterByUserSecurityZones = value
    return this
  }
    
  function withCode(value : String) : ProducerCodeQueryBuilder {
    withCodeRestricted(value, StartsWith)
    _code = value
    return this
  }

  function withCodeRestricted(value : String, restrictor : StringColumnRestrictor) : ProducerCodeQueryBuilder {
    _code = value
    _codeRestrictor = restrictor
    return this
  }

  function withDescription(value : String) : ProducerCodeQueryBuilder {
    withDescriptionRestricted(value, StartsWith)
    return this
  }

  function withDescriptionRestricted(value : String, restrictor : StringColumnRestrictor) : ProducerCodeQueryBuilder {
    _description = value
    _descriptionRestrictor = restrictor
    return this
  }

  function withParentCode(value : String) : ProducerCodeQueryBuilder {
    withParentCodeRestricted(value, StartsWith)
    return this
  }

  function withParentCodeRestricted(value : String, restrictor : StringColumnRestrictor) : ProducerCodeQueryBuilder {
    _parentCode = value
    _parentCodeRestrictor = restrictor
    return this
  }

  function withBranchCode(value : String) : ProducerCodeQueryBuilder {     
    withBranchCodeRestricted(value, Equals)
    return this
  }

  function withBranchCodeRestricted(value : String, restrictor : StringColumnRestrictor) : ProducerCodeQueryBuilder {
    _branchCode = value
    _branchCodeRestrictor = restrictor
    return this
  }

  function withMissingPrefUW(value : Boolean) : ProducerCodeQueryBuilder {
    _missingPrefUW = value
    return this
  }
  
  function withStatus(value : ProducerStatus) : ProducerCodeQueryBuilder {     
    _status = value
    return this
  }
  
  function withStatusUse(value : ProducerStatusUse) : ProducerCodeQueryBuilder {     
    _statusUse = value
    return this
  }
  
  function withBranch(value : Group) : ProducerCodeQueryBuilder {     
    _branch = value
    return this
  }
  
  function withProducer(value : Organization) : ProducerCodeQueryBuilder {     
    _producer = value
    return this
  }
  
  function withProducerUser(value : User) : ProducerCodeQueryBuilder {     
    _producerUser = value
    return this
  }
  
  function withPrefUW(value : User) : ProducerCodeQueryBuilder {     
    _prefUW = value
    return this
  }

  function withCurrency(value : Currency) : ProducerCodeQueryBuilder {
    _currency = value
    return this
  }

  function withAddress(addressQueryBuilder : AddressQueryBuilder ) : ProducerCodeQueryBuilder {     
    _addressQueryBuilder = addressQueryBuilder
    return this
  }

  override function doRestrictQuery(selectQueryBuilder : ISelectQueryBuilder) {
    if (_filterByUserSecurityZones) {
      // if filter by user security zone, there will be no need to check based on user's producer code array list
      addFilterBySecurityZones(selectQueryBuilder)
    } else if (_secure) {
      if (_useCreateAccountSecurity) {
        if (!SecureProducerSearchUtil.addCreateAccountSecurityRestrictions(User.util.CurrentUser, selectQueryBuilder)) {
          selectQueryBuilder.forceEmpty()
          return  // query cannot have results
        }
      } else {
        // Security restrictions based on being able to view associated policyperiod or account
        if (!SecureProducerSearchUtil.addSecurityRestrictions(User.util.CurrentUser, selectQueryBuilder)) {
          selectQueryBuilder.forceEmpty()
          return  // query cannot have results
        }
      }
    }

    if (_code != null) {
      _codeRestrictor.restrict(selectQueryBuilder, "Code", _code)
    }

    if (_producer != null) {
      selectQueryBuilder.compare("Organization", Equals, _producer)
    }

    if (_description != null) {
      _descriptionRestrictor.restrict(selectQueryBuilder, "Description", _description)
    }

    if (_parentCode != null) {
      var parentProducerCodeTable = selectQueryBuilder.join("Parent")
      _parentCodeRestrictor.restrict(parentProducerCodeTable, "Code", _parentCode)
    }

    if (_branch != null) {
      selectQueryBuilder.compare("Branch", Equals, _branch)
    }

    if (_branchCode != null) {
      var branchTable = selectQueryBuilder.join("Branch")
      _branchCodeRestrictor.restrict(branchTable, "BranchCode", _branchCode)
    }

    if (_producerUser != null) {
      selectQueryBuilder.or(\ restriction -> {
        var userProducerCodeTable = restriction.subselect("ID", CompareIn, UserProducerCode, "ProducerCode")
        userProducerCodeTable.compare("User", Equals, _producerUser)
        //or match via group
        var groupProducerCodeTable = restriction.subselect("ID", CompareIn, GroupProducerCode, "ProducerCode")
        var groupUserTable = groupProducerCodeTable.subselect("Group", CompareIn, GroupUser, "Group")
        groupUserTable.compare("User", Equals, _producerUser)
      })
    }

    if (_currency != null) {
      var currencyJoin = selectQueryBuilder.subselect("ID", CompareIn, CommissionPlan, "ProducerCode")
      currencyJoin.compare("Currency", Relop.Equals, _currency)
    }

    if (_status != null) {
      selectQueryBuilder.compare("ProducerStatus", Equals, _status)
    } else if (_statusUse != null) {
      var pcStatuses = ProducerStatus.getTypeKeys(false).toTypedArray()
      var pcStatusUses = pcStatuses.where(\ p -> p.hasCategory(_statusUse))
      selectQueryBuilder.compareIn("ProducerStatus", pcStatusUses)
      var orgTable = selectQueryBuilder.join("Organization")
      orgTable.compareIn("ProducerStatus", pcStatusUses)
    }

    if (_addressQueryBuilder != null) {
      var address = selectQueryBuilder.join("Address")
      _addressQueryBuilder.restrictQuery(address)
    }

    if (_missingPrefUW) {
      selectQueryBuilder.compare("PreferredUnderwriter", Equals, null)
    } else if (_prefUW != null) {
      // only include the prefUW criteria if missingPrefUW is not set to true
      selectQueryBuilder.compare("PreferredUnderwriter", Equals, _prefUW)
    }
   }

  private function addFilterBySecurityZones(selectQueryBuilder : ISelectQueryBuilder) {
    var user = User.util.CurrentUser
    var zones = user.SecurityZones
    var groupQuery = Query.make(Group)
    groupQuery.compareIn("ID", zones*.Groups*.ID)
    var orgTable = selectQueryBuilder.join("Organization")
    orgTable.subselect("ID", CompareIn, groupQuery, "Organization")
  }
}
