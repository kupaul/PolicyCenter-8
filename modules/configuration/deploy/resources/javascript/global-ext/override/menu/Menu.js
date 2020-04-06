Ext.define('Gw.override.menu.Menu', {
  override: 'Ext.menu.Menu',

  // @SenchaUpgrade override private method to work around ExtJs bug:
  // Specifying default type for menu items on the menu is not supported
  lookupItemFromObject: function (cmp) {
    if (cmp.xtype == null && this.defaultType != null && this.defaultType != 'panel') {
      cmp.xtype = this.defaultType;
    }
    return this.callOverridden(arguments);
  },
  /**
   * Extends super to support multi-column and flattened menu:
   */
  initComponent: function () {
    var items = this.items || (Ext.isArray(this.initialConfig) ? this.initialConfig : this.initialConfig.items);
    var bMultiColumn = this.numEntriesPerColumn > 0 && items && items.length > this.numEntriesPerColumn;
    if (bMultiColumn) { // multi-column menu

      Ext.apply(this, {
        border: false,
        bodyBorder: false,
        plain: true,
        showSeparator: false
      })
      this.addCls(Ext.baseCSSPrefix + 'columnmenu');
      this.items = [];

      var x = [];
      for (var i = 0; i < items.length; i++) {
        if (i > 0 && i % this.numEntriesPerColumn == 0) { // starts a new column
          this.items.push({items: x});
          x = []
        }

        if (this.flattened) {
          gw.ext.Util.appendAndFlattenMenu(items[i], x)
        } else {
          x.push(items[i])
        }
      }
      if (x.length > 0) {
        this.items.push({items: x})
      }

      this.defaults = Ext.applyIf({
        floating: false,
        plain: true,
        flex: 1,
        style: {height: '100%'},
        border: false,
        bodyBorder: false,
        xtype: 'menu',
        cls: Ext.baseCSSPrefix + 'columnmenu-inner',
        defaultType: 'gmenuitem'
      }, this.defaults);

      if (Ext.isArray(this.initialConfig)) {
        this.initialConfig = undefined
      } else if (this.initialConfig) {
        this.initialConfig.items = undefined
      }
      delete items
    }
    else if (this.flattened) { // flattened single-column menu
      var flattened = []
      Ext.each(this.items, function (item) {
        gw.ext.Util.appendAndFlattenMenu(item, flattened)
      })
      delete this.items
      this.items = flattened
    }

    this.callOverridden(arguments);

    if (bMultiColumn) {
      // force overriding the hard-coded layout of menu at the end:
      this.layout = {
        type: 'table',
        autoScroll: true,
        tableAttrs: {
          cls: Ext.baseCSSPrefix + 'columnmenu-table'
        },
        tdAttrs: {
          // AHK - 4/23/2013 - The cls here on tdAttrs appears to have no affect on the rendering.  The one
          // attached to tableAttrs, however, works
          cls: Ext.baseCSSPrefix + 'columnmenu-cell',
          style: {"vertical-align": "top"}
        }
      };
    }
  }

});