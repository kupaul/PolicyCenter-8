package gw.plugin.account.impl

uses gw.api.productmodel.Product
uses gw.plugin.account.IAccountPlugin
uses java.lang.StringBuilder
uses java.util.Date
uses java.util.Random
uses gw.api.productmodel.ProductLookup

@Export
class AccountPlugin implements IAccountPlugin {

  /**
   * Populates the extension fields in "summary" from "account".
   * This function should mutate the "summary" parameter only. It
   * will be called after the fields defined in the product have
   * already been populated.
   */
  override function populateAccountSummary(summary: AccountSummary, Account: Account ) : void {
  }

  override function performNameClearance(account : Account, policyProductRoot : PolicyProductRoot): NameClearanceResult {
    var nameClearanceResult = new NameClearanceResult(policyProductRoot)

    nameClearanceResult.OtherProdsAvail = false
    var myProducerCode = policyProductRoot.ProducerCode

    // Set the basic product availability based upon the account type, which is set in the product model.
    // This section will add all Products that are available according to the product model configuration
    // to the name clearance result.  The later sections will potentially set the status of some products
    // to something other than Available.
    for (product in ProductLookup.getAll()) {
      if (product.isContactTypeSuitableForProductAccountType(typeof account.AccountHolder.AccountContact.Contact)) {
        nameClearanceResult.addProductOffer( product, ProductSelectionStatus.TC_AVAILABLE ).MaxCreate = 5
      }
    }

    // If there is a bound policy on this account with a different producer code,
    // set its status to Risk Reserved to prevent another producer from submitting it
    if (myProducerCode != null) {
      var boundPolicies = account.IssuedPolicies
      var it = boundPolicies.iterator()
      while (it.hasNext()) {
        var summary = it.next()
        var producerCode = summary.ProducerCodeOfRecord
        if (producerCode != null
            and not myProducerCode.Code.equals(producerCode.Code)
            and isPeriodInForce(summary, Date.CurrentDate)) {
          for (productOffer in nameClearanceResult.ProductOffers) {
            if (productOffer.Product == summary.Product) {
              productOffer.ProductSelectionStatus = ProductSelectionStatus.TC_RISKRESERVED
              break
            }
          }
        }
      }
    }

    // For DEMO purposes only!!!
    // Show as Not Applicable any policies that are not allowed for this specific producer code,
    // but might be allowed for others.  The algorithm for this is going to be entirely unique
    // to each customer, so for demo purposes it will just check for one of our product names
    // in the producer code description, and if it exists, only allow that product.
    for (product in ProductLookup.getAll()) {
      if (myProducerCode.Description != null and myProducerCode.Description.indexOf(product.Name) >= 0) {
        for (productOffer in nameClearanceResult.ProductOffers) {
          if (productOffer.Product != product) {
            productOffer.ProductSelectionStatus = ProductSelectionStatus.TC_NOTAPPLICABLE
          }
        }
      }
    }

    // For TESTING purposes only!!!
    // Any product offer status can be set for all products through the primary address line 2.
    // If this is set, all the products found above get that status.
    var contact = account.AccountHolder.AccountContact.Contact
    if (contact.PrimaryAddress != null) {
      var line2 = contact.PrimaryAddress.AddressLine2
      if (line2 != null and line2.startsWith( "OfferStatus:" )) {
        var statusCode = line2.substring( line2.indexOf( ":" ) + 1).trim()
        var status: ProductSelectionStatus = statusCode
        if (status != null) {
          for (productOffer in nameClearanceResult.ProductOffers) {
              productOffer.ProductSelectionStatus = status
          }
        }
      }
    }

    return nameClearanceResult
  }

  /**
   * Returns a random string of 10 digits.
   */
  override function generateAccountNumber(account: Account): String {
    var accountNumber = new StringBuilder()
    var rand = new Random()
    for (i in 0..9) {
      var digit = rand.nextInt(10)
      accountNumber.append(digit)
    }
    return accountNumber.toString()
  }

  /**
   * Returns true if risk is reserved for an account and a product. More
   * specifically, returns true if the account has a PolicyPeriod for the
   * product which is in-force as of today's date and which is associated
   * with a different producer.
   *
   * @see #isPeriodInForce(gw.pc.policy.period.entity.PolicyPeriodSummary , Date)
   */
  override function isRiskReserved(period: PolicyPeriod): boolean {
    var todaysDate = Date.CurrentDate
    var productCode = period.Policy.Product.Code
    var producerCode = period.ProducerCodeOfRecord
    var boundPolicies = period.Policy.Account.IssuedPolicies
    var iter = boundPolicies.iterator()
    while (iter.hasNext()) {
      var policyPeriod = iter.next()
      if (isPeriodInForce(policyPeriod, todaysDate) and policyPeriod.ProductCode == productCode
            and not (policyPeriod.ProducerCodeOfRecord == producerCode)) {
        return true
      }
    }
    return false
  }

  /**
   * Returns true if "policyPeriod" is in force as of "inForceDate". This will
   * be true if all of the following conditions hold:
   * <ol>
   * <li> The period is not Canceled
   * <li> The inForceDate is on or after the period effective date
   * <li> The period's period expiration date is null or is after inForceDate
   * </ol>
   * This does <i>not</i> check the status of "policyPeriod"; it is assumed that
   * the summary was returned from {@link Account#getIssuedPolicies()} and so
   * is already guaranteed to be bound.
   */
  private function isPeriodInForce(policyPeriod: PolicyPeriodSummary, inForceDate: Date): boolean {
   return policyPeriod.CancellationDate == null
           and policyPeriod.PeriodStart != null
           and not inForceDate.before(policyPeriod.PeriodStart)
           and policyPeriod.PeriodEnd != null
           and policyPeriod.PeriodEnd.after(inForceDate)
  }

  override function transferPolicies(policies: Policy[], fromAccount: Account, toAccount: Account) {
    toAccount.makeActive()
  }

  override function freezeAccount(account: Account) {
    // Do nothing by default
  }

  override function mergeAccounts(fromAccount: Account, toAccount: Account) {
    // Do nothing by default
  }

  override function checkCanMergeWithAccount(fromAccount : Account, toAccount : Account) : String {
    if (!toAccount.getAccountHolderContact().getSubtype().equals(fromAccount.getAccountHolderContact().getSubtype())) {
      return displaykey.Java.Account.Error.MergeAccounts.AccountHolderTypesMismatch(toAccount.getAccountHolderContact().getSubtype(), fromAccount.getAccountHolderContact().getSubtype())
    }
    if (toAccount.getAccountStatus().equals(AccountStatus.TC_WITHDRAWN)) {
      return displaykey.Java.Account.Error.MergeAccounts.ToAccountIsWithdrawn(toAccount)
    }
    if (fromAccount.getAccountStatus().equals(AccountStatus.TC_WITHDRAWN)) {
      return displaykey.Java.Account.Error.MergeAccounts.FromAccountIsWithdrawn(fromAccount)
    }
    return null
  }
  
  override function isEditable(account: Account): Boolean {
    return true
  }

  override function getInverseRelationshipType(relationshipType : AccountRelationshipType) : AccountRelationshipType {
    switch (relationshipType) {
      case "parent":
        return "child"
      case "child":
        return "parent"
      case "commonowner":
        return "commonowner"
      default:
        return relationshipType
    }
  }
}
