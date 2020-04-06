Ext.define('Gw.override.chart.LegendItem', {
  override: 'Ext.chart.LegendItem',

  onMouseOver: function() {
    var me = this;
    me.series._index = me.yFieldIndex;
    me.series.highlightItem();
  }
});
