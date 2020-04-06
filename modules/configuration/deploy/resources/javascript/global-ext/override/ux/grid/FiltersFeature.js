Ext.define('Gw.override.ux.grid.FiltersFeature', {
  override: 'Ext.ux.grid.FiltersFeature',

    init: function(grid) {
        var me = this,
            view = me.view,
            headerCt = view.headerCt;

        me.bindStore(view.getStore(), true);

        // Listen for header menu being created
        headerCt.on('menucreate', me.onMenuCreate, me);

        view.on('refresh', me.onRefresh, me);
        grid.on({
            scope: me,
            // PL-29527 SimpleGrid filters are not stateful, so do not restore filter settings
            // beforestaterestore: me.applyState,
            beforestatesave: me.saveState,
            beforedestroy: me.destroy
        });

        // Add event and filters shortcut on grid panel
        grid.filters = me;
        grid.addEvents('filterupdate');
        me.createFilters();
    }
});
