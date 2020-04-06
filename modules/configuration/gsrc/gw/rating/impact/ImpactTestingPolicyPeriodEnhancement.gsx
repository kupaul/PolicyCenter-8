package gw.rating.impact

enhancement ImpactTestingPolicyPeriodEnhancement : entity.ImpactTestingPolicyPeriod {

  
  /**
   * @return true if both test prep and test run operations were successful
   */
  property get Success() : boolean{
  
    if (this.TestPrepResult != TC_SUCCESS or this.TestRunResult != TC_SUCCESS) {
      return false
    }
        
    return true
          
  }
  
  /**
   * @return true if failures occurred in either the test prep or test run jobs
   */
  property get HasFailures() : boolean{
  
    if (this.TestPrepProgress == ImpactTestingJobProgress.TC_PROCESSED and this.TestPrepResult != TC_SUCCESS) {
      return true 
    }
    
    if (this.TestRunProgress == ImpactTestingJobProgress.TC_PROCESSED and this.TestRunResult != TC_SUCCESS) {
      return true 
    }
    
    return false
    
  }
  
  property get FailureMessage() : String{
  
    var message = ""
    
    if (this.TestPrepProgress == ImpactTestingJobProgress.TC_PROCESSED and this.TestPrepResult != TC_SUCCESS) {
      message += this.TestPrepResult.DisplayName
    }
    
    if (this.TestRunProgress == ImpactTestingJobProgress.TC_PROCESSED and this.TestRunResult != TC_SUCCESS) {
    
      if (message.HasContent) {
        message += ", "  
      }
      message += this.TestRunResult.DisplayName
            
    }
    
    return message
    
  }
  
  
  /** 
   * Resets properties related to impact testing jobs back to original state 
   */
  function resetAllJobProperties(){
    resetTestPrepProperties()
    resetTestRunProperties()
  }

  /**
   * Resets properties updated by test prep job
   */  
  function resetTestPrepProperties(){

    this.BaselinePeriod = null
    this.TestPeriod = null
    this.TestPrepProgress = null
    this.TestPrepResult = null
    this.TestPrepErrorMessage = null
    
  }
  
  /**
   * Resets properties updated by test run job
   */
  function resetTestRunProperties(){

    this.TestRunProgress = null        
    this.TestRunErrorMessage = null        
    this.TestRunResult = null
        
  }
  
  /** 
   * Mark ready for test prep job
   */
  function markReadyForTestPrep(){
  
    this.resetAllJobProperties()
    this.TestPrepProgress = TC_WAITING  
    
  }
  
  /** 
   * Mark ready for test run job
   */
  function markReadyForTestRun(){
    
    this.resetTestRunProperties()  
    this.TestRunProgress = TC_WAITING  
    
  }
  
  
}
