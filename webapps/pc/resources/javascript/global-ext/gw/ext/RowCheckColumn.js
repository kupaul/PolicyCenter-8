Ext.define('gw.ext.RowCheckColumn', {
  extend: 'Ext.ux.CheckColumn',
  alias: 'widget.rowcheckcolumn',
  text: '',
  menuDisabled: true,

  initComponent: function () {
    this.baseHdCheckboxCls = 'x-grid-checkcolumn';
    this.checkedHdCheckboxCls = this.baseHdCheckboxCls + '-checked';
    this.hdCheckboxText = '<div style="margin-left: auto; margin-right: auto;" class="' + this.baseHdCheckboxCls + '"/>&#160;</div>';

    this.on({
      /**
       * Update row checkboxes when the header checkbox is clicked
       */
      headerclick: function (ct, column) {
        // toggle header checkbox:
        var headerIcon = column.el.down('.' + this.baseHdCheckboxCls);
        if(headerIcon){
          headerIcon.toggleCls(column.checkedHdCheckboxCls);
          var checked = headerIcon.hasCls(column.checkedHdCheckboxCls);

          // check (or uncheck) all rows
          var grid = ct.ownerCt;
          grid.store.each(function (record, recordIndex) {
            column.updateCheckedState(grid, recordIndex, checked);
            return true;
          });

          // update button state:
          grid.updateFlagged();
        }
      },

      /**
       * register event to show or hide header checkbox when store data changes
       * @param column
       */
      beforerender: function (column) {
        var store = column.ownerCt.ownerCt.store;

        store.on('load', function () {
          //Only displays the header checkbox when there is at least one row-level checkbox:
          var store = this.ownerCt.ownerCt.store;
          var showHeaderCB = store.findBy(function (record) {
            return record.get(column.dataIndex) !== '';
          }) >= 0;

          var text = showHeaderCB ? this.hdCheckboxText : '';
          if (text != this.text) {
            this.setText(text);
          }
        }, column);
      }
    });

    this.callParent(arguments);
  },

  renderer: function (value, p) {
    if (value === '') {
      return '';
    } else {
      p.tdCls += ' g-no-bg-img'; //disable dirty indicator
      return this.callParent(arguments);
    }
  },

  /**
   * @return {Boolean} true, if the checked state is changed
   */
  updateCheckedState: function (grid, recordIndex, checked) {
    var dataIndex = this.dataIndex;
    var record = grid.store.getAt(recordIndex);
    var value = record.get(dataIndex);
    if (value === '') {
      return false; // checkbox n/a
    }

    if (checked != value) {
      record.set(dataIndex, checked);
      this.fireEvent('checkchange', this, recordIndex, checked);
      return true;
    }

    return false;
  },

  processEvent: function (type, view, cell, recordIndex, cellIndex, e) {
    if (type == 'mousedown' || (type == 'keydown' && (e.getKey() == e.ENTER || e.getKey() == e.SPACE))) {
      var record = view.panel.store.getAt(recordIndex),
        dataIndex = this.dataIndex;

      // toggle checked state
      if (!this.updateCheckedState(view.panel, recordIndex, !record.get(dataIndex))) {
        return false;
      }

      // update CheckValues buttons
      view.panel.updateFlagged();

      // cancel selection.
      return false;

    } else {
      return this.callParent(arguments);
    }
  }
});
