package gw.lob.bop

uses gw.api.domain.account.Mergeable
uses gw.contact.AddlInterestDetailMergeableImpl

@Export
class BOPBldgAddlInterestMergeableImpl extends AddlInterestDetailMergeableImpl<BOPBldgAddlInterest> {
  construct(addlInterstDetail : BOPBldgAddlInterest) {
    super(addlInterstDetail)
  }

  override function mergeFields(merged : BOPBldgAddlInterest) : boolean {
    var superRetVal = super.mergeFields(merged)

    // Once we are able to merge buildings, this will have to be changed
    // to merge merged.BOPBuilding into Survivor.BOPBuilding

    if (merged.BOPBuilding typeis Mergeable) {
       throw "BOPBuilding is mergeable, and should no longer be ignored."
    }

    return superRetVal
  }
}