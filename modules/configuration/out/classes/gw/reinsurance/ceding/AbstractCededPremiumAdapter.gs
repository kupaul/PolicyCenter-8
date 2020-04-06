
package gw.reinsurance.ceding
uses gw.api.reinsurance.RICededPremiumAdapter
uses gw.api.reinsurance.RICededPremiumAmount
uses java.lang.IllegalArgumentException
uses java.util.Date
uses gw.pl.persistence.core.Bundle
uses gw.api.reinsurance.RIUtil

@Export
abstract class AbstractCededPremiumAdapter<T extends RICededPremium, H extends RICededPremiumHistory> implements RICededPremiumAdapter {

  protected var _owner : T
  construct(owner : T) {
    _owner = owner
  }

  // Methods to handle creation of LoB-specific entities
  
  /**
   * Create a ceded premium transaction, in owner's Bundle and with its type-appropriate
   * foreign key pointing at owner.
   */
  abstract function createRawCedingTransaction(owner : T, calcHistory : H) : RICededPremiumTransaction
  
  /**
   * Create a ceded premium history entity, in owner's Bundle and with its type-appropriate
   * foreign key pointing at owner.
   */
  abstract function createRawHistoryRecord(owner : T) : RICededPremiumHistory
  
  
  // Implementation of RICededPremiumAdapter interface
  
  /**
   * Get all of the RICededPremiumTransaction entities associated with this RICededPremium object.
   * @return An array of entities which implement RICededPremiumTransaction
   */
  abstract override property get Cedings() : RICededPremiumTransaction[]

  /**
   * Get all of the RICededPremiumHistoryentities associated with this RICededPremium object.
   * @return An array of entities which implement RICededPremiumHistory
   */
  abstract override property get History(): RICededPremiumHistory[]

 /**
   * Get the financial Cost that was ceded against to generate the Cedings.
   * @return a reference to an entity which implements pc.domain.financials.Transaction
   */
  abstract override property get Cost() : entity.Cost
  
  /**
   * Create a new RICededPremiumTransaction entity associated with this RICededPremium entity.
   * @param amount an object which contains the results of the ceding calculation for this transaction
   * @return a reference to an entity which implements RICededPremiumTransaction
   */

   override function createCedingTransaction(amount : RICededPremiumAmount, calcHistory : RICededPremiumHistory, ts : Date) : RICededPremiumTransaction {
    var txn = createRawCedingTransaction(_owner, calcHistory as H)
    
    txn.EffectiveDate    = amount.RICededPremiumContainer.EffectiveDate
    txn.ExpirationDate   = amount.RICededPremiumContainer.ExpirationDate
    txn.Agreement        = amount.Agreement
    txn.Program          = amount.Program
    txn.CededRiskAmount  = amount.CededRisk
    txn.CedingRate       = amount.CedingRate
    txn.CommissionRate   = amount.Agreement.Commission
    if (amount.Agreement typeis Facultative) {
      txn.MarkupRate     = amount.Agreement.MarkUp
    } else {
      txn.MarkupRate     = null
    }
    txn.BasisGNP         = amount.BasisGNP
    txn.CededPremium     = amount.CededPremium
    txn.CededPremiumMarkup = amount.CededPremiumMarkup
    txn.Commission       = amount.Commission
    txn.CalculationOrder = amount.CalculationOrder
    txn.DatePosted       = amount.DatePosted
    txn.DateWritten      = (amount.DatePosted > amount.DateWritten) ? amount.DatePosted : amount.DateWritten
    txn.CalcTimestamp    = ts
    return txn
  }

   override function createOffsetTransaction(onset : RICededPremiumTransaction, calcHistory : RICededPremiumHistory,
                                             ts : Date) : RICededPremiumTransaction {
    if (onset.RICededPremium != _owner) {
      throw new IllegalArgumentException("Trying to attach an RICededPremiumAmount to the wrong RICededPremium")
    }
    
    var txn = createRawCedingTransaction(_owner, calcHistory as H)
    
    // These will be set later by the caller
    txn.EffectiveDate      = null
    txn.ExpirationDate     = null
    txn.BasisGNP           = null
    txn.CededPremium       = null
    txn.CededPremiumMarkup = null
    txn.Commission         = null
    
    txn.Agreement          = onset.Agreement
    txn.Program            = onset.Program
    txn.CededRiskAmount    = onset.CededRiskAmount
    txn.CedingRate         = onset.CedingRate
    txn.CalculationOrder   = onset.CalculationOrder
    txn.CommissionRate     = onset.CommissionRate
    txn.MarkupRate         = onset.MarkupRate
    txn.CalcTimestamp      = ts
    txn.DatePosted         = RIUtil.adjustEffectiveTimeForRI(ts)
    txn.DateWritten        = (txn.DatePosted > onset.DateWritten) ? txn.DatePosted : onset.DateWritten

    return txn
  }

   override function createAndAddHistory(recalcDate : Date, reason : RIRecalcReason, comment : String) : RICededPremiumHistory {
     var calcHistory = createRawHistoryRecord(_owner)

     calcHistory.DateOfRecalculation = recalcDate
     calcHistory.Reason = reason
     calcHistory.CommentText = comment
     
     return calcHistory
   }

   override function addToBundle(bundle : Bundle) : RICededPremium {
     return bundle.add(_owner as KeyableBean) as RICededPremium
   }
 }
