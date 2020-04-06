package gw.note
uses java.util.ArrayList

enhancement NoteSearchCriteriaEnhancement : NoteSearchCriteria {
  function setSearchCriteria(activity : Activity) {
    if (activity != null) {
      if (this.RelatedTo == null or this.RelatedTo == activity) {
        this.Activity = activity 
        this.RelatedTo = activity
      } else if (this.RelatedTo != activity) {
        this.Activity = null
      }
    }
  }
  
  function getRelatedToSearchCriteria(policyPeriod : PolicyPeriod) : Object[] {
    var relatedToOptions = new ArrayList<Object>()
    if (policyPeriod != null) {
      relatedToOptions = this.getRelatedToOptionsForPolicyFile(policyPeriod) as java.util.ArrayList<java.lang.Object> 
    } else {
      relatedToOptions = this.getRelatedToOptionsForAccount() as java.util.ArrayList<java.lang.Object>
    }
    if (this.Activity != null) {
      relatedToOptions.add(this.Activity)
    }
    return relatedToOptions.toTypedArray()
  }
}