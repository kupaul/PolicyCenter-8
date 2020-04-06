Ext.define('Gw.override.layout.container.boxOverflow.Menu', {
  override: 'Ext.layout.container.boxOverflow.Menu',

  /**
   * @SenchaUpgrade override private API: specify default child type for overflow menu
   * Passes along config info to the overflown item, in order to attach action handler properly
   */
  createMenuConfig: function (component) {
    var id = component.initialConfig.id;
    var config = this.callOverridden(arguments);
    Ext.applyIf(config, {xtype: 'gmenuitem', eventId: id});
    return config;
  }
});