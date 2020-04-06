package gw.rating.rtm

uses gw.api.database.Query
uses gw.api.database.Restriction
uses gw.pl.persistence.core.Bundle

enhancement RateTableEnhancement : entity.RateTable {

  property get Empty() : boolean {
    return Owned and Factors.Empty
  }

  property get Owned() : boolean {
    return this.RefTable == null
  }

  property get Reference() : boolean {
    return !Owned
  }

  property get TableOwningFactors() : RateTable {
    return this.Owned ? this : this.RefTable
  }

  property get Factors() : List<KeyableBean> {
    return getFactorQuery(TableOwningFactors).select().toList()
  }

  property get NumRows() : int {
    return getFactorQuery(TableOwningFactors).select().Count
  }

  private function getFactorQuery(table : RateTable)  : Restriction<KeyableBean> {
    return Query.make<KeyableBean>(this.Definition.FactorRowEntity)
      .compare("RateTable", Equals, table)
  }

  function makeOwned() {
    var bundle = gw.transaction.Transaction.getCurrent()
    for (row in this.RefTable.Factors) {
      var r = bundle.add(row)
      var copy = r.copy()
      copy.setFieldValue("RateTable", this)
    }
    this.RefTable = null
  }

  function removeFactors() {
    removeFactors(gw.transaction.Transaction.getCurrent())
  }

  function removeWithFactors() {
    var bundle = gw.transaction.Transaction.getCurrent()
    removeFactors(bundle)
    bundle.delete(this)
  }

  private function removeFactors(bundle : Bundle) {
    if (!Owned) return
    this.Factors.each(\ f -> {
      f = bundle.add(f)
      f.remove()
    })
  }

  property get ReferencingRateTables() : List<RateTable> {
    return Query.make(RateTable).compare("RefTable", Equals, this).select().toList()
  }

}
