Ext.define('Gw.override.view.Table', {
  override: 'Ext.view.Table',

  /**
   * @SenchaUpgrade Override this method to use 'data-recordId' in favor of 'data-recordIndex', to work around a bug:
   *    When a Grid panel has row grouping enabled, editing the group-by field will cause a record to move to a different
   *    group, during the process the "data-recordIndex" may be temporarily out of sync from the store, and cause
   *    stack overflow (PL-26354)
   */
  getRecord: function (node) {
    var me = this,
        recordId,
        recordIndex;

    // If store.destroyStore has been called before some delayed event fires on a node, we must ignore the event.
    if (me.store.isDestroyed) {
      return;
    }

    node = me.getNode(node);
    if (node) {
      recordId = node.getAttribute('data-recordId');
      if (recordId) {
        var record = me.dataSource.data.get(recordId);
        if (record) {
          return record;
        }
      }

      // If we're grouping, the indexes may be off
      // because of collapsed groups, so just grab it by id
      if (!me.hasActiveGrouping()) {
        recordIndex = node.getAttribute('data-recordIndex');
        if (recordIndex) {
          recordIndex = parseInt(recordIndex, 10);
          if (recordIndex > -1) {
            // The index is the index in the original Store, not in a GroupStore
            // The Grouping Feature increments the index to skip over unrendered records in collapsed groups
            return me.store.data.getAt(recordIndex);
          }
        }
      }
      return me.store.getByInternalId(recordId);
    }
  },

  /**
   * @SenchaUpgrade Workaround cell tabbing bug: When a confirmation dialog is open and prevents changing active cell,
   * tabbing would go to the end of Grid; and when the change is committed, the value gets saved to the last record
   * in the grid.
   */
  walkCells: function () {
    if (Ext.Msg.isVisible()) {
      return false; // If a confirmation dialog is open, do not allow walking the cells
    }

    return this.callParent(arguments);
  }

});
