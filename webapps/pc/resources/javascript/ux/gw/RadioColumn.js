/**
 * A grid plugin which renders a radio column, which does not allow more than one row to be selected.
 */
Ext.namespace('Ext.ux.gw');

Ext.define('Ext.ux.gw.RadioColumn', {
  alias: 'widget.radiocolumn',
  extend: 'Ext.grid.column.Column',

  _isGridEditorDisabled : function (colIndex, rowIndex, store, view) {
    var column = view.headerCt.getHeaderAtIndex(colIndex);
    var disabled = true;
    gw.GridUtil.processGridEditor(store, rowIndex, column, function (editorByRow) {
      if (!editorByRow[0].disabled) {
        disabled = false;
      }
    });
    return disabled;
  },

  _resetExtraValueForStoreWithGroupName : function(group) {
    Ext.data.StoreManager.each(function(store) {
      if (store.extraValues && store.extraValues[group]) {
        delete store.extraValues[group];
      }
    })
  },

  getFullIdForRadio : function (rIndex, store) {
    return gw.GridUtil.getFullIdForCell(store,store.getAt(rIndex),this.dataIndex)
  },

  /**
   * Registers events to track initial checked row using "extraValues" under the grid store.
   */
  initComponent : function() {
    this.callParent(arguments);

    function initRadioState(store, records, successful, eOpts) {
      store.extraValues = store.extraValues || {};
      var cellID = this.dataIndex;
      var rIndex = store.data.findIndexBy(function(record){
          var radioBtnValue = record.data[cellID];
          return radioBtnValue && radioBtnValue["text"];
      });
      if (rIndex >= 0) {
        store.extraValues[this.group] = this.getFullIdForRadio(rIndex, store);
      }
    }

    // TODO tpollinger In Selenium tests, the beforerender and/or afterrender/beforerefresh is not being called.
    // The store.extraValues is null in this cases. Run the test ListViewTest#testListBackedELV and notice that
    // an empty table is rendered with the store.extraValues in render as undefined.
    this.renderer = Ext.bind(this.renderer, this);
    this.on('boxready', function(radioColumn, width, height, eOpts){
      radioColumn.getOwnerHeaderCt().grid.store.on("load", initRadioState, this);
    });
  },

  /**
   * Updates "extraValues" of the grid store when checked row changes
   */
   //@SenchaUpgrade overriding private method
   processEvent: function(type, view, cell, recordIndex, cellIndex, e, record, row) {
    var me = this;
     var group = me.group;

     if (type == 'mousedown' || (type == 'keydown' && (e.getKey() == e.ENTER || e.getKey() == e.SPACE))) {
       var store = view.getStore(),
       dataIndex = this.dataIndex,
       grid = view.ownerCt;

       // Note: Disable the cell click if the cell is not editable.
       var disabled = me._isGridEditorDisabled(cellIndex, recordIndex, store, view);
       if (!disabled) {
         gw.GridUtil.processCellClick(me, grid, record, recordIndex, dataIndex, function() {
           // TODO this should not be null, can be null in Selenium tests, see note above
           me._resetExtraValueForStoreWithGroupName(group);
           store.extraValues = store.extraValues || {};
           store.extraValues[group] = gw.GridUtil.getFullIdForCell(store,record,dataIndex);
           // notify all records updated, after a short timeout
           store.each(function(rec) {
             if (rec.get(dataIndex) === true) {
               rec.set(dataIndex, false);
             }
           })
           record.set(dataIndex, true);
         });
       }
     }
     return false;
  },

  /***
   * Renders the check row differently
   */
  renderer : function(value, p, record, rowIndex, colIndex, store, view) {
    var me = this;
    //@SenchaUpgrade AHK - 4/2/2013 - It seems that sometimes (always?) we get passed in something like the GroupingSummary
    // that contains the store, rather than the store itself, as the store parameter.  That seems like it's probably a bug
    // on the ExtJS side.
    store = view.getStore();

    // TODO tpollinger: Hack: Row sensitive editors need to be disabled if no editor is defined in the editors
    // section. This needs to get simplified and consolidated with general cell editing
    var disabled = me._isGridEditorDisabled(colIndex, rowIndex, store, view);
    if (!disabled) {
      //@SenchaUpgrade CSS naming convention:
      p.tdCls += ' x-grid3-radio-col-td';
      // TODO tpollinger store.extraValues should not be null
      // It seems extraValues not yet setup before initial rendering of the cells in some cases
      var v = false;
      if (store.extraValues) {
        v = store.extraValues[this.group] == this.getFullIdForRadio(rowIndex, store);
      } else {
        v = record.get(this.dataIndex);
// TODO: Do we want to work around extraValues missing by set it up here?
// The difference is as such: When the radio column is mis-configured such that multiple radio buttons
// are checked at the same time:
//   1. if the rendering is based on each record value, multiple radio buttons will appear checked;
//   2. if the rendering is based on a single extraValues item, only one of the checked radio buttons
// from server side will appear checked.
//
// The current logic is based on (#1), and it makes the mis-configuration apparent to the user;
// Uncommenting the following will switch to (#2).
//        if (v) {
//          store.extraValues = {};
//          store.extraValues[this.group] = this.getFullIdForRadio(rowIndex);
//        }
      }
      return '<div class="x-grid3-radio-col' + (v ? '-on' : '') + ' x-grid3-cc-' + this.id + '">&#160;</div>';

    } else {
      return '<div></div>';
    }
  }
});
