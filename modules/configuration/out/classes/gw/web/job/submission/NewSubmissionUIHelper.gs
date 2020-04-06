package gw.web.job.submission

uses gw.api.web.job.submission.SubmissionUtil
uses gw.api.util.DisplayableException
uses pcf.SubmissionManager
uses gw.api.util.JurisdictionMappingUtil

@Export
class NewSubmissionUIHelper {

  var _currentLocation : pcf.NewSubmission

  construct(currentLocation : pcf.NewSubmission) {
    _currentLocation = currentLocation

  }

  function initializeProducerSelection(acct : Account) : ProducerSelection
  {
    var rtn = NewSubmissionUtil.getOrCreateProducerSelection(acct)
    SubmissionUtil.validateForSubmission(rtn)
    return rtn
  }

  function changedProducer(acct : Account, selectionOfProducer: ProducerSelection)
  {
    var producerCodeRange = selectionOfProducer.getRangeOfActiveProducerCodesForCurrentUser() as ProducerCode[]
    if( producerCodeRange.Count == 1 )
    {
      selectionOfProducer.ProducerCode = producerCodeRange[0]
    }
    else
    {
      selectionOfProducer.ProducerCode = null
    }
    refreshProductOffers(acct, selectionOfProducer)
  }

  function refreshProductOffers(acct : Account, selectionOfProducer: ProducerSelection)
  {
    if (selectionOfProducer.Account <> acct) {
      selectionOfProducer.Account = acct
      selectionOfProducer.State =
        JurisdictionMappingUtil.getJurisdiction(acct.AccountHolderContact.PrimaryAddress)
    }
    var productOffers = performNameClearance(acct, selectionOfProducer)
    gw.api.web.PebblesUtil.invalidateIterators(_currentLocation, ProductSelection )
  }

  function performNameClearance(acct: Account, selectionOfProducer: ProducerSelection) : ProductSelection[]
  {
    if(selectionOfProducer.DefaultPPEffDate == null) {
      throw new gw.api.util.DisplayableException(displaykey.Web.SubmissionManagerLV.DefaultPPEffDateRequired)
    }
    if( canPerformNameClearance(acct, selectionOfProducer) )
    {
      var offers = acct.getAvailableProducts(selectionOfProducer.SubmissionPolicyProductRoot) as ProductSelection[]
      for (offer in offers)
      {
        offer.NumToCreate = 0
      }
      return offers
    }
    else
    {
      return null
    }
  }

  function canPerformNameClearance(acct: Account, selectionOfProducer: ProducerSelection) : boolean
  {
    return acct != null && perm.Account.newSubmission(acct) &&
        selectionOfProducer.Producer != null && selectionOfProducer.ProducerCode != null
  }

  function createMultipleSubmissions( offers : ProductSelection[] , acct: Account, selectionOfProducer: ProducerSelection, typeOfQuote: QuoteType)
  {
    SubmissionUtil.setLastProducerSelection( selectionOfProducer )
    var submissions = SubmissionUtil.createSubmissions( offers, acct, selectionOfProducer, typeOfQuote )
    if( submissions.Count == 0 )
    {
      throw new DisplayableException( displaykey.Web.ProductOffers.NoSubmissionsCreated )
    }
    SubmissionManager.go( submissions[0].Policy.Account )
  }
}