package gw.job.uw

enhancement ListOfUWIssueBlockingPointEnhancement : List<typekey.UWIssueBlockingPoint> {

  /**
   * Find the earliest blocking point from among this list which is strictly after a given blocking point.
   * 
   * <p>Typical usage: UWIssueBlockingPoint.All.earliestAfter(bp)
   */
  function earliestAfter(blockingPoint : UWIssueBlockingPoint) : UWIssueBlockingPoint {
    return this.after(blockingPoint).earliest()
  }

  /**
   * Find the latest blocking point from among this list which is strictly before a given blocking point.
   * 
   * <p>Typical usage: UWIssueBlockingPoint.All.latestBefore(bp)
   */  
  function latestBefore(blockingPoint : UWIssueBlockingPoint) : UWIssueBlockingPoint {
    return this.before(blockingPoint).latest()
  }
  
  /**
   * Filter this list to only those blocking points strictly after a given blocking point.
   * 
   * <p>Typical usage: UWIssueBlockingPoint.All.after(bp)
   */
  function after(blockingPoint : UWIssueBlockingPoint) : List<UWIssueBlockingPoint> {
    return (blockingPoint == null ? {} : this.where(\ bp -> bp.Priority < blockingPoint.Priority))
  }
  
  /**
   * Filter this list to only those blocking points strictly before a given blocking point.
   * 
   * <p>Typical usage: UWIssueBlockingPoint.All.before(bp)
   */
  function before(blockingPoint : UWIssueBlockingPoint) : List<UWIssueBlockingPoint> {
    return this.where(\ bp -> bp.Priority > blockingPoint.Priority)
  }

  /**
   * Find the earliest blocking point in this list.
   */  
  function earliest() : UWIssueBlockingPoint {
    return this.maxBy(\ bp -> bp.Priority)
  }
  
  /**
   * Find the latest blocking point in this list.
   */
  function latest() : UWIssueBlockingPoint {
    return this.minBy(\ bp -> bp.Priority)
  }
  
}
