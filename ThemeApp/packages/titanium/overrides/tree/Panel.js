Ext.define('Titanium.tree.Panel', {
    override: 'Ext.tree.Panel',
    initComponent: function() {
        var me = this;

        if (me.ui === 'tree-navigation') {
            if(!Ext.isDefined(me.initialConfig.lines)) {
                me.lines = false;
            }
            if(!Ext.isDefined(me.initialConfig.border)) {
                me.border = false;
            }
        }
        
        me.callParent(arguments);
    }
});