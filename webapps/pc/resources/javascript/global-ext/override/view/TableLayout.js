/**
 * @SenchUpgrade Referencing private ExtJS method
 * Override the default behavior to allow flex column to work when LV has shrinkWrap=true.
 */
Ext.define('Gw.override.view.TableLayout', {
  override: 'Ext.view.TableLayout',

  finishedLayout: function () {
    var me = this;

    if (me.ownerContext.widthModel.shrinkWrap) {
      me.setColumnWidths(me.ownerContext);
    }

    me.callParent(arguments);
  }
});
