Ext.define('gw.CenterPanel', {
  extend: 'gw.StretchContainer',
  xtype: 'gcenterpanel',

  autoScroll: true,
  id: 'centerPanel',
  region: 'center',

  /**
   * Hook to inject default properties in specific views
   * prior instantiation.
   */
  applyDefaults: function (config) {
    config = this.callParent([config]);

    // Login
    if (config.id === 'Login') {
      Ext.apply(config, {
        ui: 'login-page',
        managedHeight: false
      });
    }

    return config;
  },

  /**
   * Hook to inject default properties in specific views
   * post instantiation.
   */
  onAdd: function (component, index) {
    this.callParent(arguments);

    // Login
    if (component.id === 'Login') {
      Ext.each(component.query('field'), function (item) {
        item.labelAlign = 'right';
      });
    }
  }
});
