package gw.policy

enhancement PolicyPeriodSideBySideEnhancement : PolicyPeriod {
  /**
   * Reopens the PolicyPeriod for edit if it is currently quoted.
   */
  function editIfQuoted() {
    if (typekey.PolicyPeriodStatus.TC_QUOTED.equals(this.Status)) {
      this.JobProcess.edit()
    }
  }
}
