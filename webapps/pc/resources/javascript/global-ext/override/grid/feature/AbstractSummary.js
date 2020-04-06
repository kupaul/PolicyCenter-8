Ext.define('Gw.override.grid.feature.AbstractSummary', {
  override: 'Ext.grid.feature.AbstractSummary',

  // @SenchaUpgrade - override private function
  getSummary: function(store, type, field, group){
    var me = this;
    var gridColumns = me.grid.view.headerCt.getGridColumns();
    var matchingColumn = Ext.Array.findBy(gridColumns, function(item, index){
      return item.dataIndex === field;
    });

    var rawData = store.proxy.reader.rawData;
    if(rawData && rawData.summaryData && rawData.summaryData[0][matchingColumn.mapping] ){
      return rawData.summaryData[0][matchingColumn.mapping];
    }
    return '';
  }
});
