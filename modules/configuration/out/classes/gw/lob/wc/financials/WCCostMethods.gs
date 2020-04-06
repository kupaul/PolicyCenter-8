package gw.lob.wc.financials
uses java.lang.Integer

/**
 * Additional methods and properties provided by the costs that supply this interface.
 */
@Export
interface WCCostMethods
{
  /**
   *  The Jurisdiction related to this Cost
   */
  property get JurisdictionState() : Jurisdiction

  /**
   *  The Coverable related to this Cost
   */
  property get OwningCoverable() : Coverable
  /**
   *  The LocationNum related to this Cost
   */
  property get LocationNum() : Integer
  /**
   *  The ClassCode related to this Cost
   */
  property get ClassCode() : String
  /**
   *  The Description for this Cost
   */
  property get Description() : String
  
}
