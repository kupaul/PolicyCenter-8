package gw.web.admin

uses gw.web.community.UWAuthorityGrantUIWrapper
uses gw.api.util.CurrencyUtil

@Export
class UWAuthorityProfileDetailUIHelper {

  var _profile: UWAuthorityProfile

  construct(profile: UWAuthorityProfile) {
    _profile = profile
  }


  function validComparisonTypes(issueType : UWIssueType) : ValueComparator[] {
    if (issueType == null or issueType.Comparator == "None") {
      return {}
    } else {
      return {issueType.Comparator, "Any"}
    }
  }

  function requiresValue(issueType : UWIssueType) : boolean {
    return !(issueType == null or issueType.Comparator == "None" or issueType.Comparator == "Any")
  }

  function requiresCurrency(comparisonType : ValueComparator) : boolean {
    return comparisonType.Code == ValueComparator.TC_MONETARY_GE as String
        or comparisonType.Code == ValueComparator.TC_MONETARY_LE as String
  }

  function shouldDisplayCurrencyColumn() : Boolean {
    return gw.api.util.CurrencyUtil.isMultiCurrencyMode()
        and comparisonTypesIncludeMonetaryAmountComparison()
  }

  private function comparisonTypesIncludeMonetaryAmountComparison() : Boolean {
    for (grant in _profile.Grants) {
      for (comparison in validComparisonTypes(grant.IssueType)) {
        if (requiresCurrency(comparison)) return true
      }
    }
    return false
  }

  function updateValueAndCurrency(grant : UWAuthorityGrantUIWrapper) {
    grant.ApproveAnyValue = grant.ComparisonType == "Any"

    if (!requiresValue(grant.IssueType)) {
      grant.Value = null
    }
    if (requiresCurrency(grant.ComparisonType)) {
      if (grant.Currency == null) {
        grant.Currency = CurrencyUtil.getDefaultCurrency()
      }
    } else {
      grant.Currency = null
    }
  }
}