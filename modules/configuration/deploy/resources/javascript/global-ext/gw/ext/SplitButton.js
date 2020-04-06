Ext.define('gw.ext.SplitButton', {
  extend: 'Ext.button.Split',
  alias: 'widget.gsplitbutton',

  initComponent: function () {
    if (this.menu && !this.menu.items && !this.ondemandmenu) {
      delete this.menu;
      this.split = false;   // hide the arrow.  @SenchaUpgrade this.split is private
    }
    this.callParent(arguments);
  },

  listeners: { click: gw.app.onCompAction }
});
