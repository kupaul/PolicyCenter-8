/**
 * Privacy widget which never reveals existing value from server
 */
Ext.define('gw.ext.privacy', {
  extend: 'Ext.form.field.Text',
  alias: 'widget.privacy',

  initComponent: function () {
    var me = this;
    if (me.value) { // non-empty value from server:
      me.setReadOnly(true); // disable editing
      me.submitValue = false; // disable submitting to server
      // create menu:
      var menuId = me.id + '_MENU';
      var items = [];
      var privacyMenuItems = gw.ext.Util.getPrivacyFieldMenuItems();
      Ext.each(gw.ext.Util.getPrivacyFieldMenuItems(), function (itemText, index) {
        items.push({text: itemText, handler: me.deletePrivacyValue, compId: me.id, id: index == 0 ? menuId + ':edit' : undefined})
      }, me);
      me.item = [
        {
          icon: "images/app/drop_button.png",
          width: 16,
          height: 16,
          xtype: "button",
          id: menuId,
          menu: {
            items: items
          }}
      ];
    }
    me.callParent(arguments);
  },

  /**
   * Deletes old value from server, and enables editing
   * @param item menu item
   * @private
   */
  deletePrivacyValue: function (item) {
    var comp = Ext.ComponentManager.get(item.compId);
    comp.setRawValue('');
    comp.setReadOnly(false);
    comp.submitValue = true;
    comp.item.el.remove();
    comp.focus();
  }
});