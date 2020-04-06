Ext.define('Gw.override.tab.Tab', {
  override: 'Ext.tab.Tab',

  initComponent: function () {
    this.callOverridden(arguments);

    // TODO: rename to gTabId. Set GW tab id, so that it'll be rendered into HTML
    if (this.card && this.card.tabId) {
      this.id = this.card.tabId;
    }
  },

  listeners: {
    /**
     * Fetch new tab content when user clicks on a different tab
     */
    click: function () {
      if (this.active == false && this.card.tabId) {
        gw.app.handleAction(null, this.card.tabId);
      }
    }
  }
});
