package gw.lob.ba.financials

/**
 * Additional methods and properties provided by the costs that supply this interface.
 */
@Export
interface BACostMethods
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
   *  The Vehicle related to this Cost
   */
  property get Vehicle() : BusinessVehicle
}
