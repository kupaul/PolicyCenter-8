/**
 * @SenchaUpgrade
 *
 *
 * Remove this override if we are upgrading to ExtJS 4.2.3 onwards
 * This is the override given by Sencha to fix PL-29752(LV is broken after hiding and shuffling columns)
 */
Ext.define('GW.grid.header.Container', {
  override : 'Ext.grid.header.Container',
  compatibility: '4.2.2', // only if framework version is 4.2.2

  applyColumnsState : function(columns) {
    if (!columns || !columns.length) {
      return;
    }

    var me = this,
            items = me.items.items,
            count = items.length,
            i = 0,
            length = columns.length,
            c, col, columnState, index,
            moved = false;

    for (c = 0; c < length; c++) {
      columnState = columns[c];

      for (index = count; index--;) {
        col = items[index];
        if (col.getStateId && col.getStateId() == columnState.id) {
          // If a column in the new grid matches up with a saved state...
          // Ensure that the column is restored to the state order.
          // i is incremented upon every column match, so all persistent
          // columns are ordered before any new columns.
          // Do not call Container method to move the column. We are not rendered yet.
          if (i !== index) {
            this.items.insert(i, this.items.getAt(index));
            moved = true;
          }

          if (col.applyColumnState) {
            col.applyColumnState(columnState);
          }
          ++i;
          break;
        }
      }
    }

    // Because we did not call the container method to move the column, the cached columns needs to be purged.
    if (moved) {
      me.purgeCache();
    }
  }
});