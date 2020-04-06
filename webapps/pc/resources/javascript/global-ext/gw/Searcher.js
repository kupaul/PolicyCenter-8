/**
 * Provides a textbox with a search icon
 */
Ext.define('gw.Searcher', {
  extend: 'Ext.form.field.Trigger',
  alias: 'widget.searcher',
  triggerCls: 'x-form-search-trigger', // default to search icon

  initComponent: function () {
    // create menu:
    if (this.gClearEnabled) {
      var clearId = this.id + '_CLEAR';
      var clearItem = {icon: "images/app/calendar_close.png", compId: this.id, handler: function () {
        this.setValue('')
      }, xtype: "button", id: clearId};

      if (!this.item) {
        this.item = [clearItem]
      } else if (!this.item.menu) { // if there are menuItems, clear button will be combined with the menuItem
        // only one item
        var items = [];
        var item = null;
        items.push(clearItem);
        items.push(this.item[0]);
        item = [
          {
            icon: "images/app/drop_button.png",
            width: 16,
            height: 16,
            xtype: "button",
            id: this.getId() + '_MENU',
            menu: {items: items}
          }
        ];
        delete this.item;
        this.item = item;
      }
      // TODO : make it work with multiple menuItems
    }

    this.on('specialkey', function (field, e) {
      if (e.getKey() == e.ENTER) {
        this.performSearch();
      }
    });

    this.callOverridden(arguments);
  },

  onRender: function () {
    this.callParent(arguments);
    this.triggerWrap.down('.x-form-trigger', true).id = this.triggerId // for testing purpose
  },

  onTriggerClick: function () {
    var me = this;
    me.callParent(arguments);
    me.performSearch();
  },

  performSearch: function() {
    gw.app.handleAction(null, this.triggerId,
      {postCallback: function () {
        // searcher may have been removed, so dom won't be available.
        if (this.el && this.el.dom) {
          this.setValue('')
        }
      }, postCallbackScope: this})
  }
});

