package gw.lob.pa

uses gw.api.domain.account.Mergeable
uses gw.contact.AddlInterestDetailMergeableImpl

@Export
class PAVhcleAddlInterestMergeableImpl extends AddlInterestDetailMergeableImpl<PAVhcleAddlInterest> {
  construct(addlInterstDetail : PAVhcleAddlInterest) {
    super(addlInterstDetail)
  }

  override function mergeFields(merged : PAVhcleAddlInterest) : boolean {
    var superRetVal = super.mergeFields(merged)

    // Once we are able to merge vehicles, this will have to be changed
    // to merge merged.PAVehicle into Survivor.PAVehicle

    if (merged.PAVehicle typeis Mergeable) {
       throw "PAVehicle is mergeable, and should no longer be ignored."
    }

    return superRetVal
  }
}