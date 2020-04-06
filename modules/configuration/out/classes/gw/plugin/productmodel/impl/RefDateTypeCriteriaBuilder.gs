package gw.plugin.productmodel.impl
uses gw.api.productmodel.Product

@Export
class RefDateTypeCriteriaBuilder {
  /**
   * Constructs an instance of RefDateLookupCriteria using the
   * given state and the line itself.
   *
   * @return A RefDateLookupCriteria for the given state and line
   * @throws IllegalArgumentException if line is null
   */
  static function createCriteria(line : PolicyLine, state : Jurisdiction) : RefDateLookupCriteria {
    return new RefDateLookupCriteria() {
      :State = state,
      :PolicyLinePatternCode = line.PatternCode,
      :ProductCode = line.Branch.Policy.ProductCode,
      :UWCompanyCode = line.Branch.UWCompany.Code
    }
  }

  /**
   * Constructs an instance of RefDateLookupCriteria using the
   * given state and period.
   *
   * @return A RefDateLookupCriteria for the given state and period
   * @throws IllegalArgumentException if period is null
   */
  static function createCriteria(period : PolicyPeriod, state : Jurisdiction) : RefDateLookupCriteria {
    return new RefDateLookupCriteria() {
      :State = state,
      :ProductCode = period.Policy.ProductCode,
      :UWCompanyCode = period.UWCompany.Code
    }
  }

  /**
   * Constructs an instance of RefDateLookupCriteria using the
   * given state and product.
   *
   * @return A RefDateLookupCriteria for the given state and product
   * @throws IllegalArgumentException if period is null
   */
  static function createCriteria(product : Product, uwCompany : UWCompany, state : Jurisdiction) : RefDateLookupCriteria {
    return new RefDateLookupCriteria() {
      :State = state,
      :ProductCode = product.Code,
      :UWCompanyCode = uwCompany.Code
    }
  }
}
