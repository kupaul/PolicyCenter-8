package gw.plugin.reinsurance
uses gw.api.reinsurance.RIRiskVLFinder

enhancement ReinsurableEnhancement : entity.Reinsurable {
  property get RIRisk() : RIRisk{
    var versionList = this.RIVersionList
    if(versionList <> null){
      return versionList.getRIRisk(this)
    }
    return null
  }
  
  property get RIVersionList() : RIRiskVersionList {
    var branch = this.BranchUntyped as PolicyPeriod
    var versionList = branch.RIRiskVersionLists.firstWhere(\ r -> r.RiskNumber == this.RiskNumber)
    if(versionList <> null){
      return versionList
    }
    return RIRiskVLFinder.getVersionListForBranch(this.RiskNumber, this.Bundle, branch)
  }
  
  property get UWIssueKey() : String {
    return "Reinsurable:${this.FixedId.Value}"
  }
}
