Ext.define('Titanium.tree.Column', {
    override: 'Ext.tree.Column',
    treeRenderer: function(value, metaData, record) {
        metaData.tdCls += ' ' + (Ext.baseCSSPrefix + 'tree-node-depth-' + record.getDepth());
        return this.callParent(arguments);
    }
});
