package gw.web.reinsurance

uses gw.api.util.DisplayableException

@Export
class AgreementScreenUIHelper {

  var _agreement : RIAgreement
  var _inPopup : boolean

  construct(agreement : RIAgreement, inPopup : boolean) {
    _agreement = agreement
    _inPopup = inPopup
  }

  function coverageMode() : String {
    switch(_agreement.Subtype) {
      case typekey.RIAgreement.TC_ANNUALAGGREGATERITREATY:
      case typekey.RIAgreement.TC_NETEXCESSOFLOSSRITREATY:
      case typekey.RIAgreement.TC_EXCESSOFLOSSRITREATY:
      case typekey.RIAgreement.TC_PEREVENTRITREATY:
      case typekey.RIAgreement.TC_FACNETEXCESSOFLOSSRIAGREEMENT:
      case typekey.RIAgreement.TC_FACEXCESSOFLOSSRIAGREEMENT:
          return "nonproportional"
      case typekey.RIAgreement.TC_QUOTASHARERITREATY:
          return "quotashare"
      case typekey.RIAgreement.TC_SURPLUSRITREATY:
          return "surplus"
      case typekey.RIAgreement.TC_FACPROPORTIONALRIAGREEMENT:
          return "facproportional"
        default:
        throw "Unsupported agreement type: ${_agreement}"
    }
  }

  function otherTermMode() : String {
    switch(_agreement.Subtype) {
      case typekey.RIAgreement.TC_ANNUALAGGREGATERITREATY:
      case typekey.RIAgreement.TC_PEREVENTRITREATY:
      case typekey.RIAgreement.TC_NETEXCESSOFLOSSRITREATY:
      case typekey.RIAgreement.TC_EXCESSOFLOSSRITREATY:
      case typekey.RIAgreement.TC_FACNETEXCESSOFLOSSRIAGREEMENT:
      case typekey.RIAgreement.TC_FACEXCESSOFLOSSRIAGREEMENT:
          return "nonproportional"
      case typekey.RIAgreement.TC_QUOTASHARERITREATY:
      case typekey.RIAgreement.TC_SURPLUSRITREATY:
      case typekey.RIAgreement.TC_FACPROPORTIONALRIAGREEMENT:
          return "proportional"
        default:
        throw "Unsupported agreement type: ${_agreement}"
    }
  }

  function delete() {
    if (_agreement typeis Treaty and _agreement.isAttachedToAnyProgram()) {
      throw new DisplayableException(displaykey.Web.Reinsurance.Treaty.DeleteError)
    } else if (_agreement typeis Facultative and _agreement.getAttachments(gw.transaction.Transaction.getCurrent()).HasElements) {
      throw new DisplayableException(displaykey.Web.Reinsurance.FacAgreement.DeleteError)
    } else {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
        bundle.add(_agreement).remove()
      })
    }
  }

  function makeActive() {
    _agreement.validate()
    if (_inPopup) {
      // Don't create a new bundle in a popup
      // The agreement may have already been edited and added to the bundle of the page underneath
      _agreement.Status = TC_ACTIVE
    } else {
      gw.transaction.Transaction.runWithNewBundle(\ bundle -> {
        bundle.add(_agreement).Status = TC_ACTIVE
      })
    }
  }

  function validateAgreementNumberIsUnique() : String {
    var query = gw.api.database.Query.make(RIAgreement)
    query.compare(RIAgreement#AgreementNumber.PropertyInfo.Name, Equals, _agreement.AgreementNumber)
    query.compare(RIAgreement#ID.PropertyInfo.Name, NotEquals, _agreement.ID)
    if (query.select().Empty) {
      return null
    } else {
      return displaykey.Web.Reinsurance.Agreement.Verify.DuplicateAgreementNumber(_agreement.AgreementNumber)
    }
  }
}
