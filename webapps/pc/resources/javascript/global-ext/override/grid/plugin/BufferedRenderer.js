Ext.define('Gw.override.grid.plugin.BufferedRenderer', {
  override: 'Ext.grid.plugin.BufferedRenderer',

/**
 * @SenchaUpgrade override this method to fix a bug in ExtJs 4.2.1:
 * When a grid loads initially, no records get rendered, because setViewSize() is called at last to set a non-0 size
 * however and no other refresh event happens to render the records.
 */

  setViewSize: function(viewSize) {
    if (viewSize !== this.viewSize) {

      // Must be set for getFirstVisibleRowIndex to work
      this.scrollTop = this.view.el.dom.scrollTop;

      var me = this,
        store = me.store,
        elCount = me.view.all.getCount(),
        start, end,
        lockingPartner = me.lockingPartner;

      var oldSize = me.viewSize;
      me.viewSize = store.viewSize = viewSize;

      // If a store loads before we have calculated a viewSize, it loads me.defaultViewSize records.
      // This may be larger or smaller than the final viewSize so the store needs adjusting when the view size is calculated.
      if (elCount || oldSize === 0) {  // <--- OVERRIDE TO FIX BUG
        start = me.view.all.startIndex;
        end = Math.min(start + viewSize - 1, (store.buffered ? store.getTotalCount() : store.getCount()) - 1);

        // While rerendering our range, the locking partner must not sync
        if (lockingPartner) {
          lockingPartner.disable();
        }
        me.renderRange(start, end);
        if (lockingPartner) {
          lockingPartner.enable();
        }
      }
    }
    return viewSize;
  }

});
