package gw.quoting

/**
 * This class has a PolicyPeriod GX Model containing quoting request data and the costs for the coverages and coverables.
 * It has the ID of the PolicyQuote persisted in the database.
 */
@Export
class QuoteData {

  var _policyQuoteID : Object as PolicyQuoteID
  var _policyPeriod : gw.webservice.pc.pc800.gxmodel.quotingpolicyperiodmodel.PolicyPeriod as PolicyPeriod

}
