/**
 * Extends Ext PagingToolbar
 */
Ext.define('gw.Paging', {
  extend: 'Ext.toolbar.Paging',
  alias: 'widget.gpaging',
  /**
   * Gets the standard paging items in the toolbar
   * @private
   */
  getPagingItems: function () {
    var me = this;

    return [
      {
        ui: 'plain',
        itemId: 'first',
        tooltip: me.firstText,
        overflowText: me.firstText,
        iconCls: Ext.baseCSSPrefix + 'tbar-page-first',
        disabled: true,
        handler: me.moveFirst,
        scope: me,
        noaction: 1
      },
      {
        ui: 'plain',
        itemId: 'prev',
        tooltip: me.prevText,
        overflowText: me.prevText,
        iconCls: Ext.baseCSSPrefix + 'tbar-page-prev',
        disabled: true,
        handler: me.movePrevious,
        scope: me,
        noaction: 1
      },
      '-',
      me.beforePageText,
      {
        xtype: 'numberfield',
        id: me.pagingId,
        itemId: 'inputItem',
        name: 'inputItem',
        cls: Ext.baseCSSPrefix + 'tbar-page-number',
        allowDecimals: false,
        minValue: 1,
        hideTrigger: true,
        enableKeyEvents: true,
        keyNavEnabled: false,
        selectOnFocus: true,
        submitValue: false,
        // mark it as not a field so the form will not catch it when getting fields
        isFormField: false,
        width: me.inputItemWidth,
        margins: '-1 2 3 2',
        listeners: {
          scope: me,
          keydown: me.onPagingKeyDown,
          blur: me.onPagingBlur
        }
      },
      {
        xtype: 'tbtext',
        itemId: 'afterTextItem',
        text: Ext.String.format(me.afterPageText, 1)
      },
      '-',
      {
        ui: 'plain',
        itemId: 'next',
        tooltip: me.nextText,
        overflowText: me.nextText,
        iconCls: Ext.baseCSSPrefix + 'tbar-page-next',
        disabled: true,
        handler: me.moveNext,
        scope: me,
        noaction: 1
      },
      {
        ui: 'plain',
        itemId: 'last',
        tooltip: me.lastText,
        overflowText: me.lastText,
        iconCls: Ext.baseCSSPrefix + 'tbar-page-last',
        disabled: true,
        handler: me.moveLast,
        scope: me,
        noaction: 1
      },
      '-',
      {
        ui: 'plain',
        itemId: 'refresh',
        tooltip: me.refreshText,
        overflowText: me.refreshText,
        iconCls: Ext.baseCSSPrefix + 'tbar-loading',
        handler: me.doRefresh,
        scope: me
      }
    ];
  },

  showHidePagingControls: function () {
    var inputItem = this.child('#inputItem');
    this.inputItem = inputItem;
    var inputIndex = this.items.indexOf(this.inputItem);

    this.first = this.getComponent('first');
    this.prev = this.getComponent('prev');
    this.next = this.getComponent('next');
    this.last = this.getComponent('last');

    // TODO: Refactor: Card XXX: Revisit the logic below for showing paging toolbar controls
    // Depends on Sencha toolbar implementation
    var otherItems = [this.first, this.prev, this.next, this.last];

    if (this.store.pageSize < this.store.getTotalCount()) { // currently paged
      Ext.each(this.items.getRange(inputIndex - 2, inputIndex + 2), function (item) {
        item.show();
      });
      Ext.each(otherItems, function (item) {
        item.show();
      });
    } else { // not yet paged
      Ext.each(this.items.getRange(inputIndex - 2, inputIndex + 2), function (item) {
        item.hide();
      });
      Ext.each(otherItems, function (item) {
        item.hide();
      });
    }

    if (this.pagingDisabled) {
      this.inputItem.disable();

      Ext.each(otherItems, function (item) {
        item.disable();
      });
    }
  },

  showOrHideToolbar: function () {
    var allHidden = true;
    this.items.each(function (item) {
      if (!item.hidden) {
        allHidden = false;
      }
    });

    if (allHidden) {
      this.hide();
    } else {
      this.show();
    }
  },

  // TODO: Refactor listener registration
  listeners: {

    change: function (pbar) {
      this.showHidePagingControls();
      this.showOrHideToolbar();
    },

    add: function (pbar, component) {
      if (this.hidden) {
        this.showOrHideToolbar();
      }
    }
  },

  /**
   * Overrides super to do special handling for child items
   */
  initComponent: function () {
    this.callParent(arguments);

    // set id for the grid record count
    var displayItem = this.child('#displayItem');
    if (displayItem && this.recordCountId) {
      displayItem.id = this.recordCountId;
    }

    var refreshItem = this.child('#refresh');
    refreshItem.hide();
    refreshItem.previousSibling().hide();
  }
});
