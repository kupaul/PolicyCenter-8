package gw.lob.cp

uses gw.api.domain.account.Mergeable
uses gw.contact.AddlInterestDetailMergeableImpl

@Export
class CPBldgAddlInterestMergeableImpl extends AddlInterestDetailMergeableImpl<CPBldgAddlInterest> {
  construct(addlInterstDetail : CPBldgAddlInterest) {
    super(addlInterstDetail)
  }

  override function mergeFields(merged : CPBldgAddlInterest) : boolean {
    var superRetVal = super.mergeFields(merged)

    // Once we are able to merge buildings, this will have to be changed
    // to merge merged.CPBuilding into Survivor.CPBuilding

    if (merged.CPBuilding typeis Mergeable) {
       throw "CPBuilding is mergeable, and should no longer be ignored."
    }

    return superRetVal
  }
}