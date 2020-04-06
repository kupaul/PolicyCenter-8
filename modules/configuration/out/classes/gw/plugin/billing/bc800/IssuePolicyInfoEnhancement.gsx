package gw.plugin.billing.bc800

uses gw.api.util.DateUtil
uses gw.plugin.job.IPolicyRenewalPlugin
uses gw.plugin.Plugins
uses wsi.remote.gw.webservice.bc.bc800.entity.types.complex.IssuePolicyInfo
uses wsi.remote.gw.webservice.bc.bc800.entity.anonymous.elements.IssuePolicyInfo_NewInvoiceStream

@Export
enhancement IssuePolicyInfoEnhancement : IssuePolicyInfo
{
  function sync(period : PolicyPeriod) : IssuePolicyInfo{
    this.syncPolicyChange(period)
    commonSync(period)
    return this
  }

  function syncForPreview(period : PolicyPeriod) : IssuePolicyInfo{
    this.syncPolicyChangeForPreview(period)
    commonSync(period)
    this.PolicyNumber = period.PolicyNumber ?: period.ID.toString()
    return this
  }
  
  private function commonSync(period : PolicyPeriod){
    this.AccountNumber = period.Policy.Account.AccountNumber
    this.AssignedRisk = period.AssignedRisk
    this.PaymentPlanPublicId = period.SelectedPaymentPlan.BillingId
    this.ProducerCodeOfRecordId = period.ProducerCodeOfRecord.PublicID
    this.ProductCode = period.Policy.ProductCode
    this.UWCompanyCode = period.UWCompany.Code.Code
    if (period.ModelDate != null)
      this.ModelDate = period.ModelDate.XmlDateTime
    else
      this.ModelDate = DateUtil.currentDate().XmlDateTime
    this.JurisdictionCode = period.BaseState.Code
    this.BillingMethodCode = period.BillingMethod.Code
    this.PeriodStart = period.PeriodStart.XmlDateTime
    this.PeriodEnd = period.PeriodEnd.XmlDateTime
    this.TermNumber = period.TermNumber
    this.AltBillingAccountNumber = period.AltBillingAccountNumber
    var advancedOptionsSelected = period.CustomBilling
    if (advancedOptionsSelected and period.InvoiceStreamCode == null) {
      this.NewInvoiceStream = new IssuePolicyInfo_NewInvoiceStream()
      this.NewInvoiceStream.AnchorDate = period.NewInvoiceStream.FirstAnchorDate.XmlDateTime
      this.NewInvoiceStream.DayOfWeek = period.NewInvoiceStream.DayOfWeek.Code
      this.NewInvoiceStream.Description = period.NewInvoiceStream.Description
      this.NewInvoiceStream.FirstDayOfMonth = period.NewInvoiceStream.FirstDayOfMonth
      this.NewInvoiceStream.SecondDayOfMonth = period.NewInvoiceStream.SecondDayOfMonth
      this.NewInvoiceStream.DueDateBilling = period.NewInvoiceStream.DueDateBilling
      this.NewInvoiceStream.Interval = period.NewInvoiceStream.Interval.Code
      this.NewInvoiceStream.PaymentInstrumentID = period.NewInvoiceStream.PaymentInstrumentID
      this.NewInvoiceStream.PaymentMethod = period.NewInvoiceStream.PaymentMethod.Code
      this.NewInvoiceStream.UnappliedDescription = period.NewInvoiceStream.UnappliedFundDescription
      this.NewInvoiceStream.UnappliedFundID = period.NewInvoiceStream.UnappliedFundID
    }
    this.InvoiceStreamId = advancedOptionsSelected ? period.InvoiceStreamCode : null
    this.Currency = period.PreferredSettlementCurrency.Code
    var plugin = Plugins.get(IPolicyRenewalPlugin)
    if(plugin.isRenewalOffered(period)){
      this.OfferNumber = period.Job.JobNumber
    }
  }  
}
