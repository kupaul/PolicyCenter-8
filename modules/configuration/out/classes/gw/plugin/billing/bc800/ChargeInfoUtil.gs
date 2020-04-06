package gw.plugin.billing.bc800

uses gw.pl.currency.MonetaryAmount

uses wsi.remote.gw.webservice.bc.bc800.entity.types.complex.ChargeInfo
uses org.apache.commons.collections.keyvalue.MultiKey
uses java.util.Map
uses gw.util.Pair

/**
 * External helper class for returning Charges and Installments
 *
 * @see gw.webservice.pc.bc800.BillingInstructionInfoEnhancement
 */

@Export
class ChargeInfoUtil {
  /**
  * Create ChargeInfos array from all the CHARGED transactions of the period.
  *
  * Example of UNCHARGED transactions are premiums created by a submission with reporting plan.
  * In that case, only taxes transactions are charged.
  *
  * @param period Policy Period that contains the ChargeInfos
  * @return Array of ChargeInfo items that are charged
   */
  static function getChargeInfos(period : entity.PolicyPeriod) : ChargeInfo[] {
    return getChargeOrWrittenInfos(period, true)
  }

  /**
   * Create ChargeInfos array from all the INSTALLMENT transactions of the period.
   *
   * @param period Policy Period that contains the ChargeInfos
   * @return Array of ChargeInfo items that are not charged
   */
  static function getInstallmentInfos(period : entity.PolicyPeriod) : ChargeInfo[] {
    return getChargeOrWrittenInfos(period, false)
  }

  private static function
  getChargeOrWrittenInfos(period : entity.PolicyPeriod, useCharged : boolean) : ChargeInfo[] {
    var chargesMap : Map<MultiKey, Pair<ChargeInfo, MonetaryAmount>> = {}
    var chargedTransactions = period.AllTransactions.where(\ t -> (useCharged ? t.Charged : t.Written))
    for (txn in chargedTransactions) {
      var key = createChargeKey(txn)
      if (chargesMap.containsKey(key)) {
        var chargePair = chargesMap.get(key)
        chargesMap.put(key, Pair.make(chargePair.First, chargePair.Second.add(txn.AmountBilling)))
      } else {
        var chargeInfo = new ChargeInfo() {
          :ChargePatternCode = txn.Cost.ChargePattern.Code,
          :ChargeGroup = txn.Cost.ChargeGroup,
          :WrittenDate = txn.WrittenDate.XmlDateTime
        }
        chargesMap.put(key, Pair.make(chargeInfo, txn.AmountBilling))
      }
    }
    return chargesMap.Values.map( \ pair -> {
      pair.First.Amount = pair.Second.toString()
      return pair.First
    }).toTypedArray()
  }

  internal static function createChargeKey(transaction : Transaction) : MultiKey {
    return new MultiKey(transaction.EffDate, transaction.ExpDate, transaction.Cost.ChargePattern,
        transaction.Cost.ChargeGroup)
  }
}
