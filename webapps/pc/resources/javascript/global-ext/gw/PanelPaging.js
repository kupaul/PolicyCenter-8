/**
 * A paging component for iterator which doesn't have a store associated to it.
 */
// TODO : see if we can create a store and use extjs paging
Ext.define('gw.PanelPaging', {
  extend: 'Ext.toolbar.Toolbar',
  alias: 'widget.gpanelpaging',
  requires: ['Ext.toolbar.TextItem', 'Ext.form.field.Number'],
  beforePageText: 'Page',
  afterPageText: 'of {0}',
  firstText: 'First Page',
  prevText: 'Previous Page',
  nextText: 'Next Page',
  lastText: 'Last Page',
  inputItemWidth: 30,
  currentPage: 1,
  pageSize: undefined,
  total: undefined,
  viewRootId: undefined,


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
        scope: me
      },
      {
        ui: 'plain',
        itemId: 'prev',
        tooltip: me.prevText,
        overflowText: me.prevText,
        iconCls: Ext.baseCSSPrefix + 'tbar-page-prev',
        disabled: true,
        handler: me.movePrevious,
        scope: me
      },
      '-',
      me.beforePageText,
      {
        xtype: 'numberfield',
        itemId: 'inputItem',
        name: 'inputItem',
        id: me.pagingId,
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
        scope: me
      },
      {
        ui: 'plain',
        itemId: 'last',
        tooltip: me.lastText,
        overflowText: me.lastText,
        iconCls: Ext.baseCSSPrefix + 'tbar-page-last',
        disabled: true,
        handler: me.moveLast,
        scope: me
      }
    ];
  },

  initComponent: function () {
    var me = this,
      pagingItems = me.getPagingItems(),
      userItems = me.items || me.buttons || [];

    if (me.prependButtons) {
      me.items = userItems.concat(pagingItems);
    } else {
      me.items = pagingItems.concat(userItems);
    }
    delete me.buttons;

    if (me.displayInfo) {
      me.items.push('->');
      me.items.push({xtype: 'tbtext', itemId: 'displayItem'});
    }

    me.callParent();
    me.on('beforerender', me.onLoad, me, {single: true});
  },

  onLoad: function () {
    var me = this,
      isEmpty,
      afterText,
      pageCount,
      isDisable;
    isEmpty = (this.total === undefined || this.total === 0);
    isDisable = (this.pagingDisabled == true || isEmpty);
    if (!isEmpty) {
      pageCount = Math.ceil(me.total / me.pageSize);
      afterText = Ext.String.format(me.afterPageText, isNaN(pageCount) ? 1 : pageCount);
    }
    Ext.suspendLayouts();
    me.child('#afterTextItem').setText(afterText);
    me.child('#inputItem').setDisabled(isDisable).setValue(me.currentPage);
    me.child('#first').setDisabled(me.currentPage === 1 || isDisable);
    me.child('#prev').setDisabled(me.currentPage === 1 || isDisable);
    me.child('#next').setDisabled(me.currentPage === pageCount || isDisable);
    me.child('#last').setDisabled(me.currentPage === pageCount || isDisable);
    Ext.resumeLayouts(true);
  },
  moveFirst: function () {
    this.loadPage(1);
  },

  /**
   * Move to the previous page, has the same effect as clicking the 'previous' button.
   */
  movePrevious: function () {
    var me = this,
      prev = me.currentPage - 1;
    if (prev > 0) {
      me.loadPage(prev);
    }
  },

  moveNext: function () {
    var me = this,
      next = me.currentPage + 1;
    if (next <= me.getPageCount()) {
      me.loadPage(next);
    }
  },

  moveLast: function () {
    var me = this,
      last = me.getPageCount();
    this.loadPage(last);
  },

  // @private
  readPageFromInput: function () {
    var v = this.child('#inputItem').getValue(),
      pageNum = parseInt(v, 10);

    if (!v || isNaN(pageNum)) {
      this.child('#inputItem').setValue(this.currentPage);
      return false;
    }
    return pageNum;
  },

  onPagingFocus: function () {
    this.child('#inputItem').select();
  },

  onPagingKeyDown: function (field, e) {
    var me = this,
      k = e.getKey(),
      increment = e.shiftKey ? 10 : 1,
      pageNum,
      pageCount = me.getPageCount();

    if (k == e.RETURN) {
      e.stopEvent();
      pageNum = me.readPageFromInput();
      if (pageNum !== false) {
        pageNum = Math.min(Math.max(1, pageNum), pageCount);
        if (me.fireEvent('beforechange', me, pageNum) !== false) {
          this.loadPage(pageNum);
        }
      }
    } else if (k == e.HOME || k == e.END) {
      e.stopEvent();
      pageNum = k == e.HOME ? 1 : pageCount;
      field.setValue(pageNum);
    } else if (k == e.UP || k == e.PAGE_UP || k == e.DOWN || k == e.PAGE_DOWN) {
      e.stopEvent();
      pageNum = me.readPageFromInput();
      if (pageNum) {
        if (k == e.DOWN || k == e.PAGE_DOWN) {
          increment *= -1;
        }
        pageNum += increment;
        if (pageNum >= 1 && pageNum <= pageCount) {
          field.setValue(pageNum);
        }
      }
    }

  },

  onPagingBlur: function (e) {
    var curPage = this.currentPage;
    this.child('#inputItem').setValue(curPage);
  },

  getPageCount: function () {
    var me = this;
    return Math.ceil(me.total / me.pageSize);
  },

  loadPage: function (page, options) {
    var me = this;
    me.currentPage = page;
    options = Ext.apply({
      start: (page - 1) * me.pageSize,
      limit: me.pageSize
    }, options);
    // TODO : remove the last undefined argument
    gw.app.requestViewRoot(me.viewRootId, options, undefined);
  }
});
