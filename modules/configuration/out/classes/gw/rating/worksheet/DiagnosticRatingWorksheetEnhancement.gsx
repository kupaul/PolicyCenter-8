package gw.rating.worksheet

uses entity.DiagnosticRatingWorksheet
uses java.lang.String
uses gw.rating.worksheet.domain.Worksheet
uses gw.rating.worksheet.domain.WorksheetEntryContainer
uses java.lang.Throwable
uses gw.rating.CostData
uses java.util.Map
uses gw.rating.RateFlowLogger

enhancement DiagnosticRatingWorksheetEnhancement : entity.DiagnosticRatingWorksheet {
  function populateTextData(container : WorksheetEntryContainer, description : String) {
    var partialWorksheet = new Worksheet() {:Description = description, :WorksheetEntries = container.WorksheetEntries }
    this.TextData = partialWorksheet.toXml().asUTFString()
  }

  function saveStackTrace(t : Throwable) {
    if (t == null) {
      this.DiagnosticCapture = "(No stack trace available)"
    } else {
      this.DiagnosticCapture = t.StackTraceAsString
    }
  }

  function saveCostKeys(data : CostData) {
    data?.eachKey(\ k -> {
      if (k typeis Key) {
        addKeyReference(k)
      }
    })
  }

  function saveParams(params : Map<CalcRoutineParamName,Object>, paramSet : CalcRoutineParameterSet) {
    var rfLogger = RateFlowLogger.Logger

    params.eachKeyAndValue(\ key, value -> {
      var param = paramSet.Parameters.firstWhere(\ p -> p.Code == key)
      if (rfLogger.DebugEnabled) {
        rfLogger.debug("DiagnosticRatingWorkSheet:saveParams(...) [param, key, value] = " + param + ", " + key + ", " + value)
      }
      if (param != null) {
        var ref = new DiagRateflowParamRef(this.Branch, this.EffectiveDate, this.ExpirationDate)
        this.addToEntityReferences(ref)
        ref.CalcRoutineParameter = param
        if (value typeis EffDated) {
          ref.Reference = value
        } else {
          ref.StringValue = value!=null ? value.toString() : null
        }
      }
    })
  }

  function addKeyReference(k : Key) {
    var ref = new DiagRatingWorksheetRef(this.Branch, this.EffectiveDate, this.ExpirationDate)
    this.addToEntityReferences(ref)
    ref.ReferenceFixedKey = k
  }

}
