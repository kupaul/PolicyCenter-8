package gw.lob.wc.forms

uses java.math.BigDecimal
uses java.util.Set
uses gw.forms.FormInferenceContext
uses gw.xml.XMLNode

@Export
class Form_WC_Payment_Info extends WCFormData
{
  var _paymentPlanDescription : String
  var _deposit : BigDecimal
  //var _paymentScheduleItems : Set<PaymentScheduleItem>
  
  override function populateInferenceData( context: FormInferenceContext, specialCaseStates: Set<Jurisdiction> ) : void {
    var period = context.Period
    var paymentPlan = period.SelectedPaymentPlan
    _paymentPlanDescription = paymentPlan.Name
    _deposit = paymentPlan.DownPayment
    /**
    if (context.Period.PaymentSchedule.PaymentScheduleItems != null) {
      _paymentScheduleItems = context.Period.PaymentSchedule.PaymentScheduleItems.toSet()
    }
    **/
  }

  override property get InferredByCurrentData() : boolean {
    return _paymentPlanDescription != null
  }

  override function addDataForComparisonOrExport( contentNode: XMLNode ) : void {
    contentNode.addChild(createTextNode( "PaymentPlanDescription", _paymentPlanDescription ) )
    contentNode.addChild(createTextNode( "Deposit", _deposit as String ) )
    /**
    if (_paymentScheduleItems.Count > 0) {
      contentNode.addChild(createScheduleNode( "Payment Schedule", "Events", _paymentScheduleItems.map( \ p -> (p.Amount + " on " + p.EventDate))))
    }
    **/
  }
}
