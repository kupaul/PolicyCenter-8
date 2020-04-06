package gw.lob.cp.financials

/**
 * Additional methods and properties provided by the costs that supply this interface.
 */
@Export
interface CPCostMethods
{
  /**
   *  The Coverage related to this Cost
   */
  property get Coverage() : Coverage
  /**
   *  The Coverage related to this Cost
   */
  property get OwningCoverable() : Coverable
  /**
   *  The Jurisdiction related to this Cost
   */
  property get State() : Jurisdiction
  /**
   *  The Location related to this Cost
   */
  property get Location() : CPLocation
  /**
   *  The Building related to this Cost
   */
  property get Building() : CPBuilding
}
