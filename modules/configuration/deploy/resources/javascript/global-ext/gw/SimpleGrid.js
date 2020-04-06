/**
 * Key config parameters for gw grid:
 * <li> id - The ExtJs component id, i.e., the server renderId of the corresponding ListView widget
 * <li> gwBaseId - Id of the nearest naming container of the server ListView widget (may be the ListView
 *                   itself or a containing widget)
 * <li> dataUrl - the fully qualified id (i.e., server renderId) of the dominant RowIterator widget, used
 *                   for pagination, sorting, etc.
 */
Ext.define('gw.SimpleGrid', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.simplegrid',
  requires: [
    'Ext.grid.plugin.CellEditing',
    'Ext.grid.feature.Summary',
    'Ext.grid.plugin.BufferedRenderer',
    'Ext.grid.feature.GroupingSummary'
  ],

  statics: {
    CELL_MENU_CLS: 'g-cell-menu',
    SELECTED: ':selected',
    SUMMARY_FEATURE_ID : 'gsummary',
    GROUPING_FEATURE_ID : 'ggrouping',
    FILTER_FEATURE_ID : 'gfitlers',
    GROUPINGSUMMARY_FEATURE_ID : 'ggroupingsummary',
    ROW_CSS : ':css',
    ROW_OFFSET : ':offset',
    FLAGS : ':flags',
    FLAGGED : ':flagged'
  },

  stateful: true,
  disableSelection: true,
  deferRowRender: false,
  columnLines: true,
  shrinkWrap: true,  // IMPORTANT: to avoid grid content being cut off without a scroll bar in ExtJS 4.2
  shrinkWrapDock: true,  // IMPORTANT: to avoid grid content being cut off without a scroll bar in ExtJS 4.2

  viewConfig: {
    loadMask: false,
    stripeRows: true, // alternate row style
    getRowClass: function (record) {
      return record.get(':css');
    }
  },

  /**
   * Loops through each hidden column in the grid, and unhide it if it contains errors
   * @private
   */
  _unhideInvalidColumns: function() {
    var me = this,
      columns = me.headerCt.getGridColumns(),
      i, rIndex, column;

    for (i = 0; i < columns.length; i++) {
      column = columns[i];
      if (column.hidden && column.hideable) {
        rIndex = me.store.findBy( function(r) {
          var columnData = r.get(column.dataIndex);
          if (columnData && columnData.invalid){
            return true;
          }
        });
        if (rIndex >= 0) {
          column.show();
        }
      }
    }
  },

  _generateDynamicModel: function (fields) {
    var me = this;
    return Ext.define(me.gDynamicModelName, {
      extend: 'Ext.data.Model',
      fields: fields,

      _updateSum: function (grid, field, record) {
        var column = grid.getColumnById(field);

        if (column && column.summaryType && column.summaryType.indexOf('reflect') >= 0) {
          var store = grid.getStore();
          var grp = record.get(store.groupField) || '';
          var fieldMapping = column.mapping || column.dataIndex;

          if (column.summaryType == 'noreflect') {
            // do not call server
            var getSumHTML = '<span class="' + gw.app.getEventSourceCls()+ '">' + gw.app.localize('Java.ListView.GetSum') + '</span>';
            var oldSum = store.proxy.reader.rawData.summaryData[0][fieldMapping];
            oldSum = oldSum.text;
            if (oldSum.match('^<div[^>]+altVal')) {
              getSumHTML = ['<div class="' + gw.ext.Util.getAltValueClass() + '">', getSumHTML, '</div>'].join('')
            }
            var data = {}
            data[fieldMapping] = {};
            data[fieldMapping].text = getSumHTML;
            grid.updateSummaryData(grp, data);

          } else {
            // calculate new sum value at server side:
            var params = {}
            var fullId;
            store.each(function (record) {
              if ((grp === '' || record.get(store.groupField) == grp) && record.isModified(field)) {
                var value = record.get(field);
                if (value && value.text !== undefined) {
                  value = value.text // unbox composite value
                }
                fullId = gw.GridUtil.getFullIdForCell(store, record, field)
                params[fullId] = value;
              }
            })
            gw.app.requestViewRoot(fullId.replace(/(^.+:)[0-9]+:(.+)$/, '$1$2Footer'),
                {calSum: params},
                'NO_MASK_ELEM',
                {gridId: store.storeId, group: grp, fieldMapping: fieldMapping})
          }
        }
      },

      get: function (fieldName) {
        var result = this.callParent(arguments);
        if (Ext.isObject(result) && (result.xtype === 'checkbox' || result.xtype === 'radio')) {
          return result.value;
        }
        return result;
      },

      set: function (fieldName, value) {
        if (!(arguments.length == 1 && Ext.isObject(fieldName))) {
          var oldValue = this.data[fieldName];
          var dvInput = gw.GridUtil.getFirstInputInTemplateCell(oldValue);
          if ((oldValue && oldValue.text !== undefined && oldValue.cb == undefined) || dvInput) {
            if (value && value.value != undefined) {
              //footer cells and reflection seem to be the only cases where value come in as an object
              value.text = value.value;
              value = Ext.apply({}, value, oldValue);
            } else if(!Ext.isObject(value)) {
              value = Ext.apply({}, {text: value.toString(), value: value}, oldValue);
            }

          }
          // For single dv input in cell.
          var item = gw.GridUtil.getFirstInputInTemplateCell(value)
          if (item && value.text != undefined) {
            // TODO: fix for PL-18609: check if setting item['text'] is the correct fix
            item['value'] = item['text'] = value.text;
          }
        }

        // update record field:
        this.callOverridden(arguments);

        // TODO: Refactor: Card 371: This could be tied into the store on an update event and then call the server update.
        // TODO tpollinger: The alt footer value and the update sum should not get called when the model/record
        // gets initialized. One of the only ways to check this reliably is to override the model's constructor
        // and add an initialization flag. Check that the flag is not set for calling server updates. This ensures
        // that no unneeded calls to the server are made.
        if (this.store && this.store.storeId) {
          if (value && value.altVal) {
            // update alt footer value, which may cause updating record field again:
            gw.app.requestViewRoot(gw.GridUtil.getFullIdForCell(this.store, this, fieldName),
                {calcAltModelValue: (value && value.text !== undefined) ? value.text : value},
                'NO_MASK_ELEM',
                {altValRec: [this, fieldName]});
          }
          var grid = Ext.ComponentMgr.get(this.store.storeId);
          if (grid) {
            this._updateSum(grid, fieldName, this);
          }
        }
      },

      unjoin: function (store) {
        if (this.menus) {
          Ext.iterate(this.menus, function (mId, item) {
            item.menu.destroy();
          });
          delete this.menus;
        }

        this.callOverridden(arguments);
      }
    })
  },

  _destroyDynamicModel : function(){
    Ext.undefine(this.gDynamicModelName);
    Ext.ModelManager.unregisterType(this.gDynamicModelName);
  },

  _createStore : function(fields){
    var me = this;
    var data = me.data;
    var checkboxField, storeConfig;

    checkboxField = Ext.Array.findBy(fields, function(item, index){
      return item.name === '_Checkbox';
    });
    if(checkboxField){
      Ext.apply(checkboxField, {
        convert: function (v) {
          if (Ext.isBoolean(v)) {
            return v;
          }

          if (Ext.isObject(v)) {
            return v.value;
          }

          return (v === null || v === '') ? '' : v === 'true';
        }
      });
    }

    storeConfig = {
      model: me._generateDynamicModel(fields),
      remoteSort: true, // sort at server side
      remoteGroup: true, // group at server side
      storeId: me.id,
      listeners: {
        load: me.storeLoaded,
        scope: me
      }
    };

    if (data) {
      storeConfig.root = 'root'; // root property

      // remember initial sorting and paging info:
      if (data.options) {
        // Paging option. Set the pageSize if limit is set
        if (data.options.limit !== undefined) {
          storeConfig.pageSize = data.options.limit;
        }

        // Sorting options
        // TODO: Refactor: Card XXX: Paging Control And Sorting Update
        if (data.options.sort) {
          storeConfig.sorters = data.options.sort;
        }

        if (data.options.group) {
          storeConfig.groupers = Ext.Array.map(data.options.group, function (group) {
            // @SenchaUpgrade it's important to explicitly set direction to null, otherwise it'll mess up sort spec
            return {property: group.property, direction: null};
          })
        }

        // Store the original configuration options as last options
        // TODO: Refactor: Do we still need access to lastOptions? We should only need the current options
        storeConfig.lastOptions = {params: data.options};
      }

      // Set the pageSize to 0 if no paging has been configured. The default for paging configuration is no paging
      if (storeConfig.pageSize === undefined) {
        storeConfig.pageSize = 0;
      }

      if (data.summaryData && data.summaryData.gSummaryType === 'groupingsummary') {
        var fakeFld = ':grp';
        // create a fake grouping, which is required for displaying summary row:
        Ext.apply(storeConfig, { groupField: fakeFld });
      }
    }

    return Ext.create('gw.ModelStore', storeConfig);
  },

  _createFeatures : function(fields){
    var me = this,
        columnFilters = me.columnFilters,
        data = me.data,
        features = me.features || [],
        hasGroupingFeature = me.enableGrouping;

    if (columnFilters) {
      Ext.each(columnFilters, function (filter) {
        Ext.apply(filter, {type: 'list', single: true});
      });

      var colFilters = {
        id : gw.SimpleGrid.FILTER_FEATURE_ID,
        ftype: 'filters',
        encode: true,
        updateBuffer: 1,
        local: false,
        filters: columnFilters
      };

      features.push(colFilters);
    }

    if (data) {
      var summaryData = this.data.summaryData;
      if (summaryData) {
        if(summaryData.gSummaryType === 'groupingsummary'){
          var fakeFld = ':grp';
          hasGroupingFeature = false;
          fields.push(fakeFld); // fake store field
          me.columns.push({dataIndex: fakeFld, hideable: false}); // fake column, and disallow users from toggling its visibility
          // css to hide the fake group
          me.columns[this.columns.length - 1].hidden = true;
          me.cls = (this.cls || '') + ' g-no-group';

          features.push({
            id: gw.SimpleGrid.GROUPINGSUMMARY_FEATURE_ID,
            ftype: 'groupingsummary',
            showSummaryRow: true,
            enableGroupingMenu: false,
            hideGroupedHeader: false,
            remoteRoot: 'summaryData',
            groupHeaderTpl: '{name}'
          });
        } else if(summaryData.gSummaryType === 'summary'){
          features.push({
            id: gw.SimpleGrid.SUMMARY_FEATURE_ID,
            ftype: 'summary',
            showSummaryRow: (data.root !== undefined),
            remoteRoot: 'summaryData'
          });
        }
      }

      if(hasGroupingFeature){
        features.push({
          id: gw.SimpleGrid.GROUPING_FEATURE_ID,
          ftype:'grouping',
          enableGroupingMenu: true,
          hideGroupedHeader: false,
          groupHeaderTpl:'{name}'
        })
      }
    }

    me.features = features;
  },

  /**
   * Updates state for buttons flagged only to this record.
   * @param record data record
   * @return Returns true, if the record contains cell-iterator flags
   */
  _updateFlaggedButtonsForRecord:function (record) {
    var recordFlagged = record.get(gw.SimpleGrid.FLAGGED);
    if (recordFlagged) { // the record contains cell-iterator
      // find all "checked" fields of the same record:
      var checkedCells = [];
      record.fields.eachKey(function (key) {
        var cellValue = record.get(key);
        if (cellValue && cellValue.cb == true) {
          checkedCells.push(cellValue)
        }
      });
      gw.GridUtil.updateFlaggedButtons(recordFlagged, checkedCells, Ext.ComponentManager.get(record.stores[0].storeId));
      return true;
    }
    return false;
  },

  getCellEditingPlugin: function () {
    return this.getPlugin('gridCellEditing');
  },

  getClickedCellButton: function (evt) {
    return evt.getTarget('.' + gw.app.getEventSourceCls(), 4, true);
  },

  getClickedCellMenu: function (evt) {
    return evt.getTarget('.' + gw.SimpleGrid.CELL_MENU_CLS, 4, true);
  },

  getGridTotalCount: function () {
    var store = this.getStore();
    var count = 0;

    // There seems to be a bug in the Ext JS data store. The totalCount variable is not initialized if there
    // are no records loaded. This happens if the store is empty, see Ext.data.Store#onProxyLoad.
    // Calling getCount() in this instance.
    count = store.getTotalCount();
    if (count == undefined) {
      count = store.getCount();
    }

    return count;
  },

  getColumnById:function (dataIndex) {
    var me = this;
    var cols = me.view.headerCt.getGridColumns();
    for (var i = 0; i < cols.length; i++) {
      if (dataIndex === cols[i].dataIndex) {
        return cols[i];
      }
    }
  },

  /**
   * Updates row selections, if the grid has been rendered.
   */
  updateRowSelections: function () {
    var me = this;
    if (me.hasSelection && me.rendered) {
      var selectedIndex = me.store.findBy(function (record) {
        if (record.get(gw.SimpleGrid.SELECTED) === true) {
          return true;
        }
      });
      if (selectedIndex >= 0) {
        var sm = me.getSelectionModel();
        // Suspend events in order to avoid a server callback. The server has this already selected
        sm.suspendEvents(false);
        sm.select(selectedIndex, false);
        sm.resumeEvents();
      }
    }
  },

  /**
   * Updates state for buttons depending row selection
   */
  updateFlagged: function () {
    if (this[gw.SimpleGrid.FLAGGED]) {
      //todo: extjs upgrade4 check this implementation for bRowCB. Commented out looks wrong: _Checkbox is in
      // the row object, not the grid object.
      //var bRowCB = this.store.data.containsKey('_Checkbox');
      // TODO: Redesign: Card 372: CB and _Checkbox will be removed from the JSON format. Use Ext JS' selection model
      var bRowCB = false;
      var fields = this.store.model.prototype.fields.items; //this.store.getProxy().getReader().fields;
      for (var i = 0; i < fields.length; i++) {
        if (fields[i] == '_Checkbox' || fields[i].name == '_Checkbox') {
          bRowCB = true;
          break;
        }
      }
      var checkedRows = this.store.queryBy(function (record) {
        if (bRowCB) { // the record has a row checkbox column:
          return record.get('_Checkbox') == true;
        } else { // the record doesn't have a record-level checkbox:
          var cellWithCheckbox = record.fields.findBy(function (fld, key) {
            var value = record.get(key);
            return value && value.cb != null;
          });
          return cellWithCheckbox != null && record.get(cellWithCheckbox.name).cb == true;
        }
      });

      gw.GridUtil.updateFlaggedButtons(this[gw.SimpleGrid.FLAGGED], checkedRows.getRange(), this);
    }
  },

  storeLoaded: function () {
    var me = this;

    if (this.hasSelection) {
      // update row selection
      this.updateRowSelections()
    }

    me._unhideInvalidColumns();

    // update button state
    this.updateFlagged(); // grid level
    this.store.each(this._updateFlaggedButtonsForRecord); // cell level

    // TODO: @SenchaEnhancement: Ext Grid does not support an initial sorting direction configuration.
    // The JSON configuration from the server can only indicate whether a column is sortable or not.
    // We need to ask Sencha to add support for a configuration property to indicate the initial row selection.
    // Update the sort state. The sort state can get out of sync if a sort action is canceled
    // by the server while sorting during a validation error in the page
    if (this.store.sorters && this.store.sorters.items) {
      for (var i = 0; i < this.store.sorters.items.length; i++) {
        var sorter = this.store.sorters.items[i];
        var col = this.getColumnById(sorter.property);
        if (col) {
          var serverSortDir = sorter.direction;
          var currentSortDir = col.sortState;
          // Do not set a sorting direction if non has been selected yet on the client.
          // By default, the sorting shows as not sorted and the server rows may be in any order.
          // The client will initiate a particular sort order, typically ascending first.
          if (currentSortDir && currentSortDir != serverSortDir) {
            col.setSortState(serverSortDir);
          }
        }
      }

      // Update the pager control values
      // TODO: Refactor: Card XXX: We might want to redesign the pager control:
      // Bind the pager store to the grid store and have
      // the server send the current page number ready for the client.
      if (this.gwPagingId) {
        var pager = Ext.ComponentManager.get(this.gwPagingId);
        // TODO: Try not to use rawData
        var gridOptions = this.view.store.proxy.reader.rawData.options;
        // If there is no paging, put the default paging option to none
        if (!gridOptions || gridOptions.limit == undefined) {
          gridOptions = {
            start: 1,
            limit: 0
          };
        }
        if (pager && gridOptions) {
          var start = gridOptions.start;
          var limit = gridOptions.limit;
          var page = start / limit + 1;

          // Update the toolbar store (pager's owning component)
          if (pager.ownerCt) {
            pager.ownerCt.store.pageSize = limit;
            pager.ownerCt.store.currentPage = page;
            pager.ownerCt.store.totalCount = this.getGridTotalCount();
          }

          // Update the drop down pager if it has already been updated before the grid store is loaded
          pager.suspendEvents(false);
          pager.setValue(page);
          pager.resumeEvents();
        }
      }

      var summaryFeature = me.getSummaryFeature();
      if (summaryFeature !== undefined) {
        summaryFeature.showSummaryRow = (me.store.totalCount > 0);
      }
    }
  },

  initComponent: function () {
    var me = this;

    if (!me.stateId) {
      me.stateId = me.id;
    }

    if (me.gStripeRows === false) {
      var newViewConfig = {};
      Ext.apply(newViewConfig, me.viewConfig);
      newViewConfig.stripeRows = false;
      me.viewConfig = newViewConfig;
    }

    // Add default row fields: offset, flags & css field:
    var fields = me.fields;
    fields.push(
      gw.SimpleGrid.ROW_OFFSET,
      gw.SimpleGrid.FLAGS,
      gw.SimpleGrid.FLAGGED,
      gw.SimpleGrid.ROW_CSS
    );

    if (!this.plugins) {
        this.plugins = [];
        var cellEditingPlugin = new Ext.grid.plugin.CellEditing({
            pluginId: 'gridCellEditing',
            clicksToEdit: 1 // single click to activate editor
        });
        this.plugins.push(cellEditingPlugin);
    }

    // Hookup selection change listener
    if (!this.selModel) {
      this.selModel = {
        listeners: {select: this.rowSelectHandler, scope: this}
      }
    }

    // When disableSelection is true, user can't change selected row;
    // However, server may still mark some rows as pre-selected (i.e., hasSelection will be true).
    this.trackMouseOver = !this.disableSelection
    if (this.hasSelection) {
      fields.push({name: gw.SimpleGrid.SELECTED, type: 'bool'})
    }

    this._createFeatures(fields);

    this.gDynamicModelName = this.id + '-model';
    this.store = this._createStore(fields);
    Ext.apply(this.store.proxy, {
      extraParams: {
        viewRootId: this.dataUrl || this.id,
        updateData: true
      }
    });

    // Add paging control to grid, if needed. Don't add a paging control if the grid does not page
    if (this.data && this.data.options && this.data.options.limit != undefined) {
      if ((this.data.total && this.data.total > this.data.options.limit) || this.displayInfo) {
        var dominantRowIteratorId = (this.id == this.gwBaseId ? this.id : this.dataUrl);
        this.tbar = Ext.apply(this.tbar || {}, {
          store: this.store,
          gridId: this.id,
          // The paging/record count display id is <lvId>:_ListPaging.
          // This id is needed for testing and updating the LV page count. lvId is the grid's LV
          // id or the dataUrl (dominant row iterator) if the LV has a render id only (no explicit id)
          pagingId: dominantRowIteratorId + ':_ListPaging',
          recordCountId: dominantRowIteratorId + ':_RecordCount',
          pagingDisabled: this.data.options.pagingDisabled,
          displayInfo: this.displayInfo,
          prependButtons: true, // add other buttons before the pagination
          plugins: {ptype: 'gtbconfig'}, // default config for gw toolbar
          xtype: 'gpaging'
        });

        if (this.tbar.items) {
          this.tbar.items.push('-'); // a divider between pagination and other controls
        }

        // TODO: Refactor:  The servers should send these ids.
        this.gwPagingId = this.tbar.pagingId;
      }
    }

    // add filters to panel toolbar
    if (this.filters) {
      gw.GridUtil.addFiltersToPanel(this, this.filters);
      delete this.filters;
    }

    // Use BufferedRenderer if the height is fixed and the page size is big
    if (this.store.pageSize > 50 && this.height) {
      this.plugins.push({
        ptype:'bufferedrenderer',
        variableRowHeight: this.variableRowHeight
      });
    }

    this.callParent(arguments);

    /**
     * Cancels mousedown to stop row-section, if a button or menu in cell is clicked
     */
    this.view.on('beforeitemmousedown', function (gridview, record, item, index, e, eOpts) {
      if ('mousedown' === e.type && ( gridview.panel.getClickedCellButton(e) || gridview.panel.getClickedCellMenu(e))) {
        return false;
      }
    });

    this.view.on({
      /**
       * @SenchaUpgrade It's problematic to update store data when the grid has an active editor.
       * For example, when tabbing off a data-only PostOnChange cell after change, and the data or data range
       * the next cell is changed due to POC. Keeping the old editor around could show stale data and cause subsequent
       * problem.
       * The workaround is to dismiss editor before refresh, and reactivate the editor after the refresh.
       */
      beforerefresh: function (view) {
        var comp = view.ownerCt;
        var editingPlugin = comp.getCellEditingPlugin();

        if (editingPlugin.editing && editingPlugin.context) {
          var gPosition = {
            row: editingPlugin.context.rowIdx,
            column: editingPlugin.context.colIdx
          };

          // cancel editor
          editingPlugin.cancelEdit();

          // restore editor:
          function restoreEditor() {
            comp.getCellEditingPlugin().startEditByPosition(gPosition);
          }

          if (Ext.AbstractComponent.layoutSuspendCount) {
            Ext.globalEvents.on('afterlayout', restoreEditor, undefined, {single: true})
          } else {
            view.on('refresh', restoreEditor, undefined, {single: true})
          }
        }
      }
    });

    /**
     * @SenchaUpgrade A temp workaround for PL-26839. Waiting for Sencha for the real fix (ticket filed).
     * With this workaround, at least the Grid will not disappear, but the user may need to click back
     * into a cell editor again before the next change.
     *
     * Dismiss the editor if the Grid size has changed.
     */
    this.view.on('resize', function (view) {
      var comp = view.ownerCt;
      var editingPlugin = comp.getCellEditingPlugin();

      if (editingPlugin.editing) {
        editingPlugin.cancelEdit();
      }
    });

    this.view.on('viewready', function () {
      this.updateRowSelections();

      // load data after toolbars are rendered and paging toolbar is bound to the store, to update toolbar state
      if (this.data && this.data.root) {
        gw.ext.Util.updateStore(this.store, this.data);
        delete this.data;
      }
    }, /*grid*/this);

    /**
     * Handle open-menu or action inside a cell
     */
    this.on('cellclick', function (gridView, td, cellIndex, record, tr, rowIndex, evt) {
      var store = gridView.getStore();
      var fieldName = gridView.headerCt.getHeaderAtIndex(cellIndex).dataIndex;
      var t = evt.getTarget();

      // cell checkbox:
      // TODO: Refactor: Card 372: Need to clean up the CB with row check and cell check
      if (fieldName != '_Checkbox' && t.className.indexOf(Ext.baseCSSPrefix + 'grid-checkcolumn') != -1) {
        evt.stopEvent();
        // Clone the data, so that the new value will differ from old value during set()
        var val = record.get(fieldName);
        var newData;
        if (Ext.isObject(val)) {
          //val is an object when the cell has a value AND a checkbox
          if (val.cb !== undefined) {
            newData = {};
            Ext.apply(newData, record.get(fieldName));
            newData.cb = !val.cb;
          }
        } else {
          newData = !val;
        }

        gw.GridUtil.processCellClick(gridView.headerCt.getHeaderAtIndex(cellIndex), gridView.panel, record, rowIndex, fieldName,
            function () {
              record.set(fieldName, newData)
            }
        );

        // update flagged buttons:
        var bCellLevelCB = gridView.panel._updateFlaggedButtonsForRecord(record);
        if (!bCellLevelCB) {
          // this checkbox is associated with the containing gridView:
          gridView.panel.updateFlagged();
        }

      } else if (t.type == 'button') {
        //evt.stopEvent();

        // TODO tpollinger: Card 372: The whole of the radio group needs to be refactored and consolidated with
        // gw.GridUtil.processRadioCellClick. That latter utility does some of the unchecking of grouped
        // radio controls too (although they are not cell radio groups), but it would be good to unify this a bit.
        // Refactor: Create a Radio Group, Checkbox Group, Radio column, checkbox column class and delegate
        // rendering and click processing from ExtGrid to these classes.
        // Refactor: Normalize server JSON response to one type for a given radio/checkbox group control
        var radioGroup = record.get(fieldName);
        if (radioGroup && radioGroup.xtype != 'radiogroup') {
          // Is there a DV input group with a radio group?
          var radioGroup = gw.GridUtil.getFirstInputInTemplateCell(radioGroup);
          if (radioGroup && radioGroup.xtype != 'radiogroup') {
            radioGroup = null;
          }
        }

        // Handle a radio group cell: Get the currently selected radio (for instance ask for change confirmation),
        // handle the change and update the store.
        if (radioGroup) {
          var processRadioClick = function (column, grid, record, rowIndex, columnId, oldValue, value, clickCallback) {
            if (!me.radioField) {
              me.radioField = new Ext.form.field.Base();
            }
            me.radioField.eventParam = gw.GridUtil.getFullIdForCell(grid.getStore(), record, columnId);
            me.radioField.completeEdit = clickCallback;
            Ext.apply(me.radioField, {postOnChange: radioGroup.postOnChange, confirm: radioGroup.confirm});
            gw.app.handleChange(me.radioField, value, oldValue, clickCallback);
          }

          var oldValue = record.get(fieldName);
          var value = t.attributes['inputValue'].value;

          processRadioClick(this, gridView.panel, record, rowIndex, fieldName, oldValue, value, function () {
            for (var i = 0; i < radioGroup.items.length; i++) {
              radioGroup.items[i].checked = (radioGroup.items[i].inputValue == value);
            }
            record.set(fieldName, value);
          });

        } else {
          var grid = gridView.panel;
          var column = grid.getColumnById(fieldName);

          // Handle the change event for this radio input field. Don't handle if this is a radio column configuration
          if (column.xtype != 'radiocolumn') {
            gw.GridUtil.processRadioCellClick(true, column, grid, record, rowIndex, fieldName);
          }
        }

      } else {
        // TODO: Refactor: Card 372: dvInput are not declared in the editor section
        // The column editor is set here as otherwise "beforeedit" is not being called. startEdit
        // checks whether a column editor is set and will terminate if none is available.
        var column = gridView.headerCt.getHeaderAtIndex(cellIndex);
        if (!column.getEditor()) {
          var editorCfg = null;
          var grid = gridView.panel;
          gw.GridUtil.processGridEditor(grid.getStore(), rowIndex, column, function (editorByRow) {
            if (editorByRow[0]) {
              editorCfg = editorByRow[0];
              return false;
            }
          });
          // Editor configurations may be declared in an inputDV
          if (!editorCfg) {
            var fieldValue = grid.getStore().getAt(rowIndex).get(column.dataIndex);
            editorCfg = gw.GridUtil.getFirstInputInTemplateCell(fieldValue);
          }
          if (editorCfg) {
            grid.setRowEditor(editorCfg, rowIndex, column.dataIndex);
          }
        }

        var cellButton = gridView.panel.getClickedCellButton(evt);
        var cellMenu = gridView.panel.getClickedCellMenu(evt);

        if (cellButton || cellMenu) {
          // TODO tpollinger: stopEvent does not hinder an event propagation to activate a combo box next to
          // a menu opener. Added evt.suspendEvents(false) below.
          // Reproduction steps:
          // Start PX | Administration | Under Organization Tree, select: Org Tree > Default Org > Western Auto Group >
          //    Auto - Level1 > Auto - TeamA > Edit > Click on the menu opener next to Betty Baker for instance. Notice
          //    that both the menu opens and the combo box is set in edit mode. The Ext JS handleEvents still keeps
          //    the second listener for the beforeedit Ext Grid method, event though stopEvent below has been called.
          // TODO tpollinger: Not adding the stop event will fail the following:
          // Start PX | Editable LV | Click the toggle date button in the cell.
          // Notice that when removing stop event, two toggle events are sent to the server cancelling the first toggle.
          evt.stopEvent();

          // look up button config from the record:
          var btnConfig = record.get(fieldName);

          // look up the child item, if any
          // Menu button
          if (cellMenu) {
            record.menus[cellMenu.getAttribute('id')].showMenu();
          } else {
            var itemIndex = cellButton.getAttribute('itemIndex');
            if (itemIndex) {
              var nestedIndices = itemIndex.split(':');

              if (nestedIndices.length > 1) {
                for (var i = 0; i < nestedIndices.length; i++) {
                  itemIndex = nestedIndices[i];
                  btnConfig = btnConfig.items[itemIndex];
                }
              } else {
                if (btnConfig.xtype == 'templatevaluepanel' || btnConfig.xtype === 'gfieldset') {
                  //FormatCell render items
                  btnConfig = record.get(fieldName).items;
                }
                btnConfig = (Ext.isArray(btnConfig) ? btnConfig : btnConfig.item)[itemIndex];
              }
            }
            gw.app.handleCompAction(btnConfig || {}, evt, cellButton);
          }

          // TODO tpollinger: stopEvent: see comment above under stopEvent
          // Call suspendEvents only if it is defined. Seems some events (browser click) don't have this defined
          if (evt.suspendEvents) {
            evt.suspendEvents(false);
          } else {
            // TODO @SenchaUpgrade: One particular test with combobox and menu in a cell would activate the combobox
            // when trying to open the menu. See test: withTest("gw.smoketest.px.webb.TemplateWidgetTest", "testTemplateWidgetInLVCell")
            // Forcing further event processing to end.
            return false;
          }
        }
      }
    });
  },

  rowSelectHandler: function (sm, record, rowIndex) {
    gw.app.requestViewRoot(gw.GridUtil.getFullIdForCell(this.getStore(), record, '_ViewDetail'),
        {updateData: true});
  },

  /**
   * @SenchaUpgrade
   * Do not save state for store. This will lead to extra Ajax requests since we have
   * remoteSort, remoteGroup and etc
   */
  getState: function () {
    var state = this.callParent(arguments);
    delete state.storeState;
    return state;
  },
  applyState: function (state) {
    delete state.storeState;
    this.callParent(arguments);
  },

  /**
   * Set the row editor or editor configuration.
   * @param {Object} editor editor component or editor configuration
   * @param {String} rowIndex row index for a row sensitive editor
   * @param {String} dataIndex data index for the grid column
   *
   * TODO: Refactor: Card 372: Editors should be uniformly set in the grid's editor section.
   * Complex dvInput sections are not declared in the editor column section, hence a column editor will not
   * be set if a cell is activated for editing.
   *
   * TODO: Rename this to setEditorCfg. row editors is an Ext JS full row span editor and has nothing to do
   * with the column editor configuration. The name below is confusing.
   */
  setRowEditor: function (editor, rowIndex, dataIndex) {
    var column = this.getColumnById(dataIndex);

    // See whether the current column editor is the same as the passed in editor
    var editorCfg = editor;
    editor = column.getEditor();
    if (editor && editor.id == editorCfg.id) {
      return;
    }

    // Strip the editor configuration from non editor related configurations
    // TODO: Card 372/PL-22651: Possible memory leak: The combobox editor config id needs to have its id cleared
    if (!(editorCfg instanceof Ext.Component)) {
      // Remove menu opener and other auxiliary editor decorators
      // TODO: Card 372: Redesign how complex cell editors should be shown: For instance
      // fly-out editors that have more real estate than the small cell.
      if (editorCfg.item || editorCfg.id) {
        editorCfg = Ext.apply({}, editorCfg);
        delete editorCfg.item;
        delete editorCfg.id;
      }
    }

    // Set the new editor. If the editor is a configuration object, a new editor component is created
    column.setEditor(editorCfg);
  },

  onDestroy : function(){
    var me = this;
    me.callParent(arguments);
    me._destroyDynamicModel();
  },

  /**
   * Update the summary data store with summary details from data.<br/>
   * The data needs to follow the following structure:
   * <pre>
   * {
     *   c&lt;i&gt;: {
     *     text: &lt;Display value&gt;
     *     cls: &lt;Style class to apply for summary data value&gt;
     *     ... (other summary data properties)
     *   }
     * }
   * </pre>
   * where i is the index into the column index (c1, c2, c3, ...)
   * @param {String} groupValue the summary group value key
   * @param {Object} data the summary data to update
   */
  updateSummaryData: function (groupValue, data) {
    var me = this;
    var store = me.getStore();

    var summaryData = store.proxy.reader.rawData.summaryData;
    for (var i = 0; i < summaryData.length; i++) {
      if (summaryData[i][":grp"] == groupValue) {

        Ext.Object.each(data, function (columnName, value) {
          var record = store.last(false); // any record in the store
          summaryData[i][columnName].text = gw.GridUtil.formatSummaryData(value);

          //
          // Force updating the summary row, by fake an edit event on the trigger data cell.
          // @SenchaUpgrade TODO: Any better way to update the summary row?
          //
          var fldName = record.fields.findBy(function (item) {
            if (item.mapping == columnName) {
              return true
            }
          }).name;

          if (summaryData.gSummaryType === 'groupingsummary' && summaryData[i][":grp"] == groupValue) {
            record = store.findRecord(':grp', groupValue); // find a record in this group
          }
          store.fireEvent('update', store, record, Ext.data.Model.EDIT, [fldName]);

        }, store);

        break;
      }
    }
  },

  getSummaryFeature : function (){
    var me = this,
        view = me.view;
    return view.getFeature(gw.SimpleGrid.GROUPINGSUMMARY_FEATURE_ID) || view.getFeature(gw.SimpleGrid.SUMMARY_FEATURE_ID);
  }
});
