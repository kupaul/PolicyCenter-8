Ext.define('Gw.override.chart.Label', {
  override: 'Ext.chart.Label',
  constructor: function () {
    var me = this;

    // change default font for label:
    me.label = Ext.applyIf(me.label || {}, { font: "15px \'Open Sans\', sans-serif" });

    me.callParent(arguments);
  }
});

