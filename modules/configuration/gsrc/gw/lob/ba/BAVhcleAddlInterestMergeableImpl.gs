package gw.lob.ba

uses gw.api.domain.account.Mergeable
uses gw.contact.AddlInterestDetailMergeableImpl

@Export
class BAVhcleAddlInterestMergeableImpl extends AddlInterestDetailMergeableImpl<BAVhcleAddlInterest> {
  construct(addlInterstDetail : BAVhcleAddlInterest) {
    super(addlInterstDetail)
  }

  override function mergeFields(merged : BAVhcleAddlInterest) : boolean {
    var superRetVal = super.mergeFields(merged)

    // Once we are able to merge vehicles, this will have to be changed
    // to merge merged.BAVehicle into Survivor.BAVehicle

    if (merged.BAVehicle typeis Mergeable) {
       throw "BAVehicle is mergeable, and should no longer be ignored."
    }

    return superRetVal
  }
}