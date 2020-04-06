/**
 * Adds widget id and special style class to each node in the MenuLink tree
 */
Ext.define('Gw.override.tree.Column', {
  override: 'Ext.tree.Column',
  treeRenderer: function (value, metaData, record) {
    var eventId = record.get('eventId');

    if (eventId) {
      metaData.tdAttr += (' id=' + eventId);
    }

    metaData.tdCls += (' g-accordion-item g-accordion-depth-' + record.getDepth());
    return this.callParent(arguments);
  }
});