package gw.lob.pa.financials

/**
 * Additional methods and properties provided by the costs that supply this interface.
 */
@Export
interface PACostMethods
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
   *  The Vehicle related to this Cost
   */
  property get Vehicle() : PersonalVehicle
}
