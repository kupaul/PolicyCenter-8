package gw.admin.affinitygroup

uses gw.api.database.Query
uses java.util.Date
uses gw.api.productmodel.Product
uses gw.api.util.DisplayableException
uses gw.search.EntitySearchCriteria

@Export
class AffinityGroupSearchCriteria extends EntitySearchCriteria<AffinityGroup> {

  var _affinityGroupName: String as AffinityGroupName
  var _affinityGroupNameKanji: String as AffinityGroupNameKanji
  var _organization: String as Organization
  var _groupType: AffinityGroupType as AffinityGroupType
  var _producerCode: String as ProducerCode
  var _product: Product as Product
  var _jurisdiction: Jurisdiction as Jurisdiction
  var _onlyAvailableGroups: boolean as OnlyAvailableGroups
  var _startDate: Date as AffinityGroupStartDate
  var _endDate: Date as AffinityGroupEndDate

  override function doSearch() : AffinityGroupQuery {
    var query = constructBaseQuery()
    return query.select()
  }

  function performExactSearch() : AffinityGroupQuery {
    var query = constructBaseQuery()
    return query.select()
  }

  private function constructBaseQuery(): Query {
    var groupQuery = new Query<AffinityGroup>(AffinityGroup)
    if (this.AffinityGroupName != null) {
      groupQuery.contains("Name", this.AffinityGroupName.trim(), true)
    }
    if (this.AffinityGroupNameKanji != null) {
      groupQuery.contains("NameKanji", this.AffinityGroupNameKanji.trim(), true)
    }
    if (this.Organization != null) {
      var orgSubQuery = Query.make(entity.Organization)
      orgSubQuery.compare("Name", Equals, Organization)
      groupQuery.or(\r1 -> {
        r1.compare("Organization", Equals, null)
        r1.subselect("Organization", CompareIn, orgSubQuery, "Id")
      })
    }
    if (this.AffinityGroupType != null) {
      groupQuery.compare("AffinityGroupType", Equals, this.AffinityGroupType)
    }
    if (ProducerCode != null) {
      var prodCodeSubQuery = Query.make(AffinityGroupProducerCode)
      prodCodeSubQuery.join("ProducerCode").startsWith("Code", ProducerCode, true)
      groupQuery.and(\r1 -> {
        r1.or(\r2 -> {
          r2.subselect("Id", CompareNotIn, AffinityGroupProducerCode, "AffinityGroup")
          r2.subselect("Id", CompareIn, prodCodeSubQuery, "AffinityGroup")
        })
      })
    }
    if (Product != null) {
      var productSubQuery = Query.make(AffinityGroupProduct)
      productSubQuery.compare("ProductCode", Equals, Product.Code)
      groupQuery.and(\r1 -> {
        r1.or(\r2 -> {
          r2.subselect("Id", CompareNotIn, AffinityGroupProduct, "AffinityGroup")
          r2.subselect("Id", CompareIn, productSubQuery, "AffinityGroup")
        })
      })
    }
    if (Jurisdiction != null) {
      var jurisdictionSubQuery = Query.make(AffinityGroupJurisdiction)
      jurisdictionSubQuery.compare("Jurisdiction", Equals, Jurisdiction)
      groupQuery.and(\r1 -> {
        r1.or(\r2 -> {
          r2.subselect("Id", CompareNotIn, AffinityGroupJurisdiction, "AffinityGroup")
          r2.subselect("Id", CompareIn, jurisdictionSubQuery, "AffinityGroup")
        })
      })
    }
    if (AffinityGroupStartDate != null) {
      groupQuery.and(\r1 -> {
        r1.or(\r2 -> {
          r2.compare("StartDate", Equals, null)
          r2.compare("StartDate", LessThanOrEquals, AffinityGroupStartDate)
        })
      })
    }
    if (AffinityGroupEndDate != null) {
      groupQuery.and(\r1 -> {
        r1.or(\r2 -> {
          r2.compare("EndDate", Equals, null)
          r2.compare("EndDate", GreaterThanOrEquals, AffinityGroupEndDate)
        })
      })
    }
    if (this.OnlyAvailableGroups != null && this.OnlyAvailableGroups) {
      if (AffinityGroupStartDate != null || AffinityGroupEndDate != null) {
        throw new DisplayableException(displaykey.Web.PolicyLine.Validation.OnlyAvailableGroupPropertyNotSearchable)
      }
      var today = Date.Today
      groupQuery.and(\r1 -> {
        r1.or(\r2 -> {
          r2.compare("StartDate", Equals, null)
          r2.compare("StartDate", LessThanOrEquals, today)
        })
        r1.or(\r2 -> {
          r2.compare("EndDate", Equals, null)
          r2.compare("EndDate", GreaterThanOrEquals, today)
        })
      })
    }
    return groupQuery
  }

  override property get InvalidSearchCriteriaMessage(): String {
    return null
  }

  override property get MinimumSearchCriteriaMessage(): String {
    return null
  }
}
