Ext.define('Gw.override.grid.plugin.CellEditing', {
  override: 'Ext.grid.plugin.CellEditing',

  _isCellEditable:function (colIdx, rowIdx, column, grid) {
    var disabled = null;
    var bPrivacy = false;

    var record = grid.store.getAt(rowIdx);
    var cellValue = record.get(column.dataIndex);
    var fieldValue = cellValue;
    var dvInput = gw.GridUtil.getFirstInputInTemplateCell(fieldValue)
    if (dvInput) {
      return dvInput.editable
    }
    if (fieldValue && fieldValue.text != undefined) {
      fieldValue = fieldValue.text;
    }

    gw.GridUtil.processGridEditor(grid.store, rowIdx, column, function (editorByRow) {
      if (editorByRow[0]) {
        disabled = editorByRow[0].disabled || false;
        bPrivacy = (editorByRow[0].xtype == 'privacy');
      } else {
        disabled = true;
      }
    }, true);
    if (disabled != null) {
      if (!disabled && bPrivacy && fieldValue && Ext.isObject(cellValue) && cellValue.hasOwnProperty("item")) {
        disabled = true;
      }
      return !disabled;
    }

    if (column.getEditor && column.getEditor() != null && column.getEditor().disabled) {
      return false;
    }
  },

  init: function () {
    this.callParent(arguments);

    this.on('beforeedit', function (editor, editEvt) {
      var me = this;
      var column = editEvt.column;

      // If a Confirmation Msg Box is present, do not allow edit to continue
      if (!me._isCellEditable(editEvt.colIdx, editEvt.rowIdx, column, editEvt.grid) || Ext.Msg.isVisible()) {
        return false;
      }

      // If this is a single dv input.
      // TODO: Card 372: Server refactor for DV editors
      var fieldValue = editEvt.record.get(editEvt.field);
      var dvInput = gw.GridUtil.getFirstInputInTemplateCell(fieldValue);
      if (dvInput) {
        editEvt.grid.setRowEditor(dvInput, editEvt.rowIdx, editEvt.column.dataIndex);

        // Stop normal Ext JS editor processing if the editor is a radio cell and the column is not configured as
        // a radio column.
      } else if (column.xtype != 'radiocolumn') {
        var beginEdit = true;

        gw.GridUtil.processGridEditor(editor.grid.store, editEvt.rowIdx, column, function (editorByRow) {
          var editorCfg = editorByRow[0];
          var editorType = editorCfg.xtype;

          // If the editor is a radio input, don't add an editor configuration as an implicit
          // editor has already been created. Stop the normal Ext JS editor processing
          if (!gw.GridUtil.hasEditor(editorType)) {
            beginEdit = false;

            // TODO: Redesign: Card 372: Look into making field container editors (if any) as flyouts.
          } else if (!(editorCfg.xtype == 'fieldcontainer')) {
            editorCfg.eventParam = gw.GridUtil.getFullIdForCell(editor.grid.store, editEvt.record, editEvt.field);
            if (!(editorCfg instanceof Ext.form.Field)) {
              if (editor.editing) {
                editor.completeEdit();
              }
              column.setEditor(editorCfg);

              return false;
            }
          }
        });

        // Checking for Confirmation Msg Box again because tabbing out produces confirmation dialog later
        if (!beginEdit || Ext.Msg.isVisible()) {
          return false;
        }
      }
    })
  },

  /**
   * Special handling for ENTER key on cell editor - Some LVs are configured to navigate through rows/cells on ENTER key.
   * @SenchaUpgrade: override private method
   */
  onSpecialKey: function (ed, field, e) {
    if (e.getKey() === e.ENTER) {
      var grid = this.getCmp(),
        view = grid.getView(),
        record = this.getActiveRecord(),
        position = view.getPosition(record, this.getActiveColumn()),
        bQuickAdd = grid.gQuickAdd,
        bCellNav = bQuickAdd || grid.gCellNavOnEnter,
        bRowNav = bCellNav || grid.gRowNavOnEnter,
        bForceRowNav,
        cellData;

      var direction = bCellNav ? (e.shiftKey ? 'left' : 'right') : // navigate horizontally
        bRowNav ? (e.shiftKey ? 'up' : 'down') : // navidate vertically
          null;

      if (direction) {
        e.stopEvent();

        // @SenchaUpgrade mimic the "Tab" behavior in super class, by calling non-public methods:
        do {
          if (bCellNav &&
            (cellData = grid.getStore().getAt(position.row).get(view.headerCt.getHeaderAtIndex(position.column).dataIndex)) &&
            cellData.endOfCellNav) { // if this cell is marked as end of cell-nav, force wrapping to the next row:
            position.column = grid.headerCt.getGridColumns().length - 1;
          }

          position = view.walkCells(position, direction, e, /*preventWrap*/false);
        } while (position && (!view.headerCt.getHeaderAtIndex(position.column).getEditor(grid.getStore().getAt(position.row)) || !this.startEditByPosition(position)));

        if (position) {
          return; // we have navigated to a different row or cell
        }
      }

      if (bQuickAdd) { // No more cell to navigate to, add a new row:
        // TODO: optimize to not post form data or update entire store during quickAdd?
        gw.app.requestViewRoot(grid.id, {quickAdd: true, updateData: true}, undefined, {postCallback: function () {
          // start at the beginning of the last row:
          var position = view.getPosition(grid.getStore().last(), grid.headerCt.getGridColumns()[0]);

          while (position && (!view.headerCt.getHeaderAtIndex(position.column).getEditor(grid.getStore().getAt(position.row)) || !this.startEditByPosition(position))) {
            position = view.walkCells(position, 'right', e, /*preventWrap*/false);
          }
        }, postCallbackScope: this});

        return; // we are done
      }
    }

    return this.callParent(arguments);
  },

  showEditor: function (ed, context, value) {
    /**
     * AHK - 4/10/2013 - We want text areas to expand to fill the entire cell, while using the configured
     * number of rows as a minimum size.  The best way that I've found to do that is to override the code
     * that shows the editor so that we explicitly set the height on the textarea at that time.
     * See PL-23772
     * @SenchaUpgrade Ideally there would be some more supported way of doing this
     */
    if (ed.field && ed.field.xtype == 'textarea') {
      var configuredHeight = (ed.field.rows * 17) + 8; // AHK - line-height is 17, vertical padding is 6px total, cell border is 2px total
      var rowHeight = context.row.offsetHeight;
      ed.field.height = (rowHeight > configuredHeight ? rowHeight : configuredHeight);
    }
    // AHK - 5/30/2013
    // In some odd cases involving check boxes, the call to showEditor will fail in Table.getCell (Table.js line 522)
    // because the row can't be found.  So as a total hack, if we know the parent call will fail, just don't make it,
    // since right now the only cases it fails in are cases where we don't even have an editor to show
    // @SenchaUpgrade
    var row = this.grid.getView().getNode(context.record, true);
    if (row) {
      this.callParent(arguments);
    }
  },

  /**
   * @SenchaUpgrade workaround ExtJs4.2.1 bug to restore context after "beforeedit" returns false
   * https://support.sencha.com/index.php#ticket-12906
   */
  startEdit: function (record, columnHeader, /* private */ context) {
    var originalContext = this.context;
    var val = this.callParent(arguments);
    if (val === false) {
      this.context = originalContext; // restore old context
    }
    return val;
  }
});
