package gw.lob.gl.financials

/**
 * Additional methods and properties provided by the costs that supply this interface.
 */
@Export
interface GLCostMethods {
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
  property get Location() : PolicyLocation
  /**
   *  The DisplayOrder showing where this cost should print on the quote page
   */
  property get DisplayOrder() : int //for non-exposure costs; exposure costs should return -1 
}
