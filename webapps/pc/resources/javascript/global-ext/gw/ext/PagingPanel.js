/**
 * A container which render the paging control in the title bar.
 */
Ext.define('gw.ext.PagingPanel', {
  extend:'Ext.panel.Panel', // TODO: use container to reduce overhead, when there's no pagination
  alias:'widget.gpagingpanel',
  constructor: function() {
    this.plugins = this.plugins||[];
    this.plugins.push({ptype:'glayout'});
    return this.callParent(arguments);
  },

  initComponent:function () {
    if (this.options) {
      var currPage = this.options.start / this.options.limit + 1;
      this.tbar = {
        pageSize:this.options.limit,
        total:this.options.total,
        currentPage:currPage,
        viewRootId:this.id,
        // This id is needed for testing and updating the page count.
        pagingId:this.id + ':_ListPaging',
        recordCountId:this.id + ':_RecordCount',
        pagingDisabled: this.options.pagingDisabled,
        xtype:'gpanelpaging'
      };
    }
    this.callParent(arguments);
  }
});
