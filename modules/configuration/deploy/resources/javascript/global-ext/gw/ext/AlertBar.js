Ext.define('gw.ext.AlertBar', {
    extend: 'gw.columns',
    alias: 'widget.galertbar',
    cls: 'g-alert-bar',

    initComponent: function() {
        if (this.items.length == 2) {
            Ext.apply(this.items[1], {
                xtype:'glink' // TODO: simply image button type during server side rendering
            });
        }
        this.callParent(arguments);
    }
});
