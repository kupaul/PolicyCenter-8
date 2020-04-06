Ext.define('gw.ext.BarInput', {
  extend: 'Ext.form.field.Display',
  alias: 'widget.gbarinput',

  getDisplayValue: function () {
    return gw.ext.Util.renderBarInput(this);
  },

  initComponent: function () {
    this.on('boxready', function (comp) {
      // Override the top level element id to avoid conflict with the inner div id:
      // TODO: Need to clean up this widget implementation.
      comp.getEl().dom.setAttribute('id', comp.id + '-wrap');
    });

    this.callParent(arguments);
  }
});
