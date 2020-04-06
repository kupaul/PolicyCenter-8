Ext.define('Gw.override.button.Button', {
  override: 'Ext.button.Button',

  showMenu: function () {
    gw.ext.Util.createAndShowOnDemandMenuIfNeeded(this);
    return this.callOverridden(arguments);
  }
});
