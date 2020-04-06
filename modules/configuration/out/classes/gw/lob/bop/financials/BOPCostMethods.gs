package gw.lob.bop.financials

/**
 * Additional methods and properties provided by the costs that supply this interface.
 */
@Export
interface BOPCostMethods
{
  /**
   *  The Coverage related to this Cost
   */
  property get Coverage() : Coverage
  /**
   *  The Coverable related to this Cost
   */
  property get OwningCoverable() : Coverable
  /**
   *  The Jurisdiction related to this Cost
   */
  property get State() : Jurisdiction
  /**
   *  The Location related to this Cost
   */
  property get Location() : BOPLocation
  /**
   *  The Building related to this Cost
   */
  property get Building() : BOPBuilding
}
