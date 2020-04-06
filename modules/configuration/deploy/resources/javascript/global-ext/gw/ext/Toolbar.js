Ext.define('gw.ext.Toolbar', {
  extend: 'Ext.toolbar.Toolbar',
  alias: 'widget.gtoolbar',
  constructor: function() {
    this.plugins = this.plugins||[];
    this.plugins.push({ptype:'gtbconfig'});
    return this.callParent(arguments);
  }
});
