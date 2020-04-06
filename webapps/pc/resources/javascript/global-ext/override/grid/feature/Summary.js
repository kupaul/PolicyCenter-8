Ext.define('Gw.override.grid.feature.Summary', {
  override: 'Ext.grid.feature.Summary',
  onStoreUpdate: function() {
    var me = this,
        view = me.view,
        record = me.createSummaryRecord(view),
        newRowDom = view.createRowElement(record, -1),
        oldRowDom, partner,
        p;

    if (!view.rendered) {
      return;
    }

    // Summary row is inside the docked summaryBar Component
    if (me.dock) {
      oldRowDom = me.summaryBar.el.down('.' + me.summaryRowCls, true);
    }
    // Summary row is a regular row in a THEAD inside the View.
    // Downlinked through the summary record's ID'
    else {
      oldRowDom = me.view.getNode(record);
    }

    if (newRowDom && oldRowDom) {
      p = oldRowDom.parentNode;
      p.insertBefore(newRowDom, oldRowDom);
      p.removeChild(oldRowDom);

      partner = me.lockingPartner;
      // For locking grids...
      // Update summary on other side (unless we have been called from the other side)
      if (partner && partner.grid.rendered && !me.calledFromLockingPartner) {
        partner.calledFromLockingPartner = true;
        partner.onStoreUpdate();
        partner.calledFromLockingPartner = false;
      }
    }
    // If docked, the updated row will need sizing because it's outside the View
    if (me.dock) {
      me.onColumnHeaderLayout();
    }
  }
});
