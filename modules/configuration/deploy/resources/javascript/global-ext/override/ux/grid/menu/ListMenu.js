Ext.define('Gw.override.ux.grid.menu.ListMenu', {
  override: 'Ext.ux.grid.menu.ListMenu',

  createMenuStore: function () {
    var me = this,
        options = [],
        i, len, value;

    // SenchaUpgrade : Ext 4.2.2 - Configured options for Ext.ux.grid.filter.ListFilter disappear (EXTJSIV-11582)
    if (!me.options) {
      me.options = me.grid.store.collect(me.dataIndex, false, true);
    }

    for (i = 0, len = me.options.length; i < len; i++) {
      value = me.options[i];
      switch (Ext.type(value)) {
        case 'array':
          options.push(value);
          break;
        case 'object':
          options.push([value[me.idField], value[me.labelField]]);
          break;
        default:
          if (value != null) {
            options.push([value, value]);
          }
      }
    }

    me.store = Ext.create('Ext.data.ArrayStore', {
      fields: [me.idField, me.labelField],
      data:   options,
      listeners: {
        load: me.onLoad,
        scope:  me
      }
    });

    me.loaded = true;
    me.autoStore = true;
  },

  show : function () {
    var me = this;
    // @SenchaUpgrade : ExtJs 4.2.2 when data is empty somehow 'createMenuStore' didn't get triggered by the grid store's 'load' event.
    // call createMenuStore explicitly if the store is empty
    if (!me.store) {
      me.createMenuStore();
    }
    me.callParent();
  }
});
