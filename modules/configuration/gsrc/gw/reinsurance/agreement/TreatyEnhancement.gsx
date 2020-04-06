package gw.reinsurance.agreement
uses gw.api.database.Query
uses gw.api.database.Relop

enhancement TreatyEnhancement : entity.Treaty {

  function isAttachedToAnyProgram() : boolean {
    if (this typeis Treaty) {
      var q = Query.make(ProgramTreaty)
      q.compare("Treaty", Relop.Equals, this)
      return q.select().HasElements
    } else {
      return false
    }
  }
}
