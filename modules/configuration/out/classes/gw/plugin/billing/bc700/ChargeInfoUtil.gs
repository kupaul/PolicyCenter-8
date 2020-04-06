package gw.plugin.billing.bc700

uses java.util.HashMap
uses wsi.remote.gw.webservice.bc.bc700.entity.types.complex.ChargeInfo
  
@Export
class ChargeInfoUtil
{
  /**
  * Create ChargeInfos array from all the CHARGED transactions of the period.
  * Example of UNCHARGED transactions are premiums created by a submission with reporting plan.
  * In that case, only taxes transactions are charged.
  */
  static function getChargeInfos(period : entity.PolicyPeriod) : ChargeInfo[] {
    return getChargeOrWrittenInfos(period, true)
  }
  
  static function getInstallmentInfos(period : entity.PolicyPeriod) : ChargeInfo[] {
    return getChargeOrWrittenInfos(period, false)
  }
  
  private static function getChargeOrWrittenInfos(period : entity.PolicyPeriod, useCharged : boolean) : ChargeInfo[]{
    var chargesMap = new HashMap<String, ChargeInfo>()
    var chargedTransactions = period.AllTransactions.where( \ t -> (useCharged ? t.Charged : t.Written) )
    for(txn in chargedTransactions){
      var key = createHashCode(txn)
      if(chargesMap.containsKey( key ))
      {
        var charge = chargesMap.get( key )
        charge.Amount = charge.Amount.add( txn.Amount )
      }else{
        var charge = new ChargeInfo();
        charge.Amount = txn.Amount
        charge.ChargePatternCode = txn.Cost.ChargePattern.Code
        charge.ChargeGroup = txn.Cost.ChargeGroup
        // charge.DepositOverride = ??
        // charge.HoldStatus = ??
        // charge.CommissionRateOverrides = ??
        chargesMap.put( key, charge )
      }
    }
    return chargesMap.Values.toTypedArray()
  }
  
  static function createHashCode(txn : Transaction) : String {
    return txn.EffDate.format( "short" ) + txn.ExpDate.format( "short" ) 
      + txn.Cost.ChargePattern.Code + "." + txn.Cost.ChargeGroup
  }
}
