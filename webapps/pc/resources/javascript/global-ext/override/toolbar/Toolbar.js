/**
 * Do not add leading separator or adjacent toolbar separators
 */
Ext.define('Gw.override.toolbar.Toolbar', {
  override: 'Ext.toolbar.Toolbar',
  cls:'g-paging',
  initComponent: function () {
    this.on('beforeadd', function (container, comp, index) {
      if (comp instanceof Ext.toolbar.Separator && (
        index === 0 || container.items.get(index - 1) instanceof Ext.toolbar.Separator
        )) {
        comp.destroy();
        return false;
      }
    });

    this.callParent(arguments);
  }
});