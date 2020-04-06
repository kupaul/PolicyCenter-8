package gw.pcf.line.common

uses gw.lob.wc.rating.WCRatingPeriod
uses gw.api.util.StringUtil

@Export
class RatingTxDetailsPanelSetUIHelper {

  function standardPremLabel(splitPeriod : boolean, ratingPeriod : WCRatingPeriod ) : String {
    if (splitPeriod) {
      return displaykey.Web.Quote.WC.StandardPremium.SplitPeriod(StringUtil.formatDate(ratingPeriod.RatingStart, "short"),
          StringUtil.formatDate(ratingPeriod.RatingEnd, "short") )
    } else {
      return displaykey.Web.Quote.WC.StandardPremium.OnePeriod
    }
  }

  // Get any jurisdictions that exist on this branch, but additionally any that exist in the prior branch.
  // This is necessary in case a jurisdiction was removed as of the policy start on this branch.  In that case,
  // the jurisdiction does not exist, and should not have cost, it *will* have transactions that need to
  // be displayed (and they'll refer to a cost on the prior branch).
  function getJurisdictions(thePeriod : PolicyPeriod) : WCJurisdiction[]
  {
    var jurisByIDs = thePeriod.WorkersCompLine.RepresentativeJurisdictions.partitionUniquely( \ juris -> juris.FixedId )
    for ( juris in thePeriod.BasedOn.WorkersCompLine.RepresentativeJurisdictions )
    {
      if ( not jurisByIDs.containsKey( juris.FixedId ) )  // in case we removed a jurisdiction as of the start of the period in this branch
      {
        jurisByIDs.put( juris.FixedId, juris )
      }
    }
    return jurisByIDs.Values.toTypedArray().sortBy( \ juris -> juris.State )
  }
}
