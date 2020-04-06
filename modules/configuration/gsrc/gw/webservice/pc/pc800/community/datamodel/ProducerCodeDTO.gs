package gw.webservice.pc.pc800.community.datamodel

uses gw.api.database.Query
uses gw.api.webservice.exception.BadIdentifierException
uses gw.xml.ws.annotation.WsiExportable
uses java.util.Date
uses gw.pl.persistence.core.Bundle
uses java.util.ArrayList

@Export
@WsiExportable("http://guidewire.com/pc/ws/gw/webservice/pc/pc800/community/datamodel/ProducerCodeDTO")
final class ProducerCodeDTO {

  var _address : AddressDTO as Address
  var _appointmentDate : Date as AppointmentDate
  var _branchPublicID : String as BranchPublicID
  var _code : String as Code
  var _commissionPlanIDs : CommissionPlanDTO[] as CommissionPlans = {}
  var _description : String as Description
  var _parentPublicID : String as ParentPublicID
  var _preferredUnderwriterPublicID : String as PreferredUnderwriterPublicID
  var _publicID : String as PublicID
  var _terminationDate : Date as TerminationDate

  var _producerStatus : ProducerStatus as ProducerStatus

  function populateFromProducerCode(producerCode : ProducerCode) {
    if (this.Address == null) {
      this.Address = new AddressDTO()
    }
    this.Address.AddressLine1 = producerCode.Address.AddressLine1
    this.Address.AddressLine2 = producerCode.Address.AddressLine2
    this.Address.AddressLine3 = producerCode.Address.AddressLine3
    this.Address.AddressType = producerCode.Address.AddressType
    this.Address.City = producerCode.Address.City
    this.Address.Country = producerCode.Address.Country
    this.Address.County = producerCode.Address.County
    this.Address.Description = producerCode.Address.Description
    this.Address.PostalCode = producerCode.Address.PostalCode
    this.Address.PublicID = producerCode.Address.PublicID
    this.Address.State = producerCode.Address.State

    this.Address.AddressLine1Kanji = producerCode.Address.AddressLine1Kanji
    this.Address.AddressLine2Kanji = producerCode.Address.AddressLine2Kanji
    this.Address.CEDEX = producerCode.Address.CEDEX
    this.Address.CEDEXBureau = producerCode.Address.CEDEXBureau
    this.Address.CityKanji = producerCode.Address.CityKanji

    this.AppointmentDate = producerCode.AppointmentDate
    this.BranchPublicID = producerCode.Branch.PublicID
    this.Code = producerCode.Code
    this.Description = producerCode.Description
    this.ParentPublicID = producerCode.Parent.PublicID
    this.PreferredUnderwriterPublicID = producerCode.PreferredUnderwriter.PublicID
    this.ProducerStatus = producerCode.ProducerStatus
    this.PublicID = producerCode.PublicID
    this.TerminationDate = producerCode.TerminationDate
    this.CommissionPlans = createCommissionPlanDTOs(producerCode.CommissionPlans)
  }

  private function createCommissionPlanDTOs(commissionPlans : CommissionPlan[]) : CommissionPlanDTO[] {
    var plans = new ArrayList<CommissionPlanDTO>()
    commissionPlans.each( \ elt -> {
      var plan = new CommissionPlanDTO()
      plan.populateFromCommissionPlan(elt)
      plans.add(plan)
    })
    return plans
  }

  function createProducerCode(bundle : Bundle) : ProducerCode {
    var producerCode = new ProducerCode(bundle)
    return populateProducerCode(producerCode)
  }

  function updateProducerCode(producerCode : ProducerCode) {
    populateProducerCode(producerCode)
  }

  private function createCommissionPlan(planDTO: CommissionPlanDTO) : CommissionPlan {
    var commissionPlan = new CommissionPlan()
    commissionPlan.CommissionPlanID = planDTO.CommissionPlanID
    commissionPlan.Currency = planDTO.Currency
    return commissionPlan
  }

  private function populateProducerCode(producerCode : ProducerCode) : ProducerCode {
    producerCode.AppointmentDate = this.AppointmentDate
    producerCode.Code = this.Code
    this.CommissionPlans.each( \ planDTO -> {
      if (producerCode.Currencies.contains(planDTO.Currency)) {
        planDTO.updateCommissionPlan(producerCode.CommissionPlans.singleWhere( \ elt -> elt.Currency == planDTO.Currency))
      } else {
        producerCode.addToCommissionPlans(createCommissionPlan(planDTO))
      }
    })
    producerCode.Description = this.Description
    producerCode.ProducerStatus = this.ProducerStatus
    producerCode.PublicID = this.PublicID
    producerCode.TerminationDate = this.TerminationDate

    producerCode.Address.AddressLine1 = this.Address.AddressLine1
    producerCode.Address.AddressLine2 = this.Address.AddressLine2
    producerCode.Address.AddressLine3 = this.Address.AddressLine3
    producerCode.Address.AddressType = this.Address.AddressType
    producerCode.Address.City = this.Address.City
    producerCode.Address.Country = this.Address.Country
    producerCode.Address.County = this.Address.County
    producerCode.Address.Description = this.Address.Description
    producerCode.Address.PostalCode = this.Address.PostalCode
    producerCode.Address.State = this.Address.State

    producerCode.Address.AddressLine1Kanji = this.Address.AddressLine1Kanji
    producerCode.Address.AddressLine2Kanji = this.Address.AddressLine2Kanji
    producerCode.Address.CEDEX = this.Address.CEDEX
    producerCode.Address.CEDEXBureau = this.Address.CEDEXBureau
    producerCode.Address.CityKanji = this.Address.CityKanji

    if (this.Address.PublicID != null) {
      producerCode.Address.PublicID = this.Address.PublicID
    }

    if (this.BranchPublicID != null) {
      var foundGroup = findBeanByPublicIDOrThrow<Group>(this.BranchPublicID)
      producerCode.Branch = foundGroup
    } else {
      producerCode.Branch = null
    }

    if (this.ParentPublicID != null) {
      var foundParent = findBeanByPublicIDOrThrow<ProducerCode>(this.ParentPublicID)
      producerCode.Parent = foundParent
    } else {
      producerCode.Parent = null
    }

    if (this.PreferredUnderwriterPublicID != null) {
      var foundUnderwriter = findBeanByPublicIDOrThrow<User>(this.PreferredUnderwriterPublicID)
      producerCode.PreferredUnderwriter = foundUnderwriter
    } else {
      producerCode.PreferredUnderwriter = null
    }

    return producerCode
  }


  private function findBeanByPublicIDOrThrow<T extends KeyableBean>(producerCodePublicID : String) : T {
    var bean = Query.make(T).compare("PublicID", Equals, producerCodePublicID).select().AtMostOneRow
    if (bean == null) {
      throw new BadIdentifierException(displaykey.ProducerCodeModel.populateProducerCode.Error.CannotFindForeignKeyBeanWithPublicID(T, producerCodePublicID))
    }
    return bean
  }
}