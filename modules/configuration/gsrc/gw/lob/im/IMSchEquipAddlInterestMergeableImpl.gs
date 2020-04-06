package gw.lob.im

uses gw.api.domain.account.Mergeable
uses gw.contact.AddlInterestDetailMergeableImpl

@Export
class IMSchEquipAddlInterestMergeableImpl extends AddlInterestDetailMergeableImpl<IMSchEquipAddlInterest> {
  construct(addlInterstDetail : IMSchEquipAddlInterest) {
    super(addlInterstDetail)
  }

  override function mergeFields(merged : IMSchEquipAddlInterest) : boolean {
    var superRetVal = super.mergeFields(merged)

    // If we are ever able to merge equipment, this will have to be changed to
    // merge merged.ContractorsEquipment into Survivor.ContractorsEquipment

    if (merged.ContractorsEquipment typeis Mergeable) {
       throw "ContractorsEquipment is mergeable, and should no longer be ignored."
    }

    return superRetVal
  }
}