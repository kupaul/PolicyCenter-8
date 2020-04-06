Ext.define('gw.plugin.Toolbar', {
  extend: 'Ext.AbstractPlugin',
  alias: 'plugin.gtbconfig',

  /**
   * Overrides the owner container layout, before initComponent is invoked on the owning container.
   */
  constructor: function (config) {
    Ext.apply(config.cmp, {
      enableOverflow: true, // do not cut off toolbar content
      defaultType: 'gbutton'
    });

    this.callParent(arguments);
  }
});
