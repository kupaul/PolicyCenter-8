package gw.plugin.job.impl

uses gw.plugin.jobnumbergen.IJobNumberGenPlugin
uses java.lang.Integer
uses java.util.concurrent.atomic.AtomicInteger
uses gw.api.database.Query


@Export
class JobNumberGenPlugin implements IJobNumberGenPlugin {
  
  static var counter = new AtomicInteger(0)

  /**
   * This cheater implementation does a few tricks to make the job numbers semi-random
   * but also gradually increasing, while taking care not to generate duplicates.
   */
  override function genNewJobNumber( p0: Job ) : String {
    var potentialNumber : int
    do {
      potentialNumber = genPotentialNumber() as int
    } while (jobWithNumberExists(potentialNumber as String))
    return potentialNumber as String
  }

  private function genPotentialNumber(): String {
    var counterString = Integer.toString(counter.AndIncrement)
    while (counterString.length() < 5) {
      counterString = "0" + counterString
    }
    return counterString + org.apache.commons.lang.RandomStringUtils.random(5, "0123456789")
  }

  private function jobWithNumberExists(jobNumber: String): boolean {
    return Query.make(Job).compare(Job#JobNumber.PropertyInfo.Name, Equals, jobNumber).select().HasElements    
  }

}
