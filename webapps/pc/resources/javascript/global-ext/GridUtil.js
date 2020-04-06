gw.GridUtil = function(){
  /**
   * Counts checked flags
   * @param checkedItems an array of checked items
   * @param flagName
   * @param includeUnchecked
   */
  function countCheckedFlags(checkedItems, flagName, includeUnchecked, grid) {
    var count = 0;

    function _recContainsFlag(item) {
      var flagsProp = gw.SimpleGrid.FLAGS;
      var flags = item.get ? item.get(flagsProp) : item[flagsProp];
      return flags && (Ext.Array.indexOf(flags, flagName) != -1);
    }

    if (includeUnchecked) {
      grid.store.queryBy(function(record) {
        if (_recContainsFlag(record)) {
          // If we find just one record with this flag defined, we are done.
          count++
          return false
        }
      })
    } else {
      Ext.each(checkedItems, function(item) {
        if (_recContainsFlag(item)) {
          count++
        }
      });
    }
    return count;
  }

  /**
   * Evaluates flags based of checkbox state
   * @param {Ext.data.Model[]} checkedItems an array of checked items
   * @param flags flags
   */
  function evalCheckboxFlags(checkedItems, flags, grid) {
    var totalFlags = checkedItems.length;
    var conditions = flags.split(',');
    for (var i = 0; i < conditions.length; i++) {
      var condition = conditions[i];
      while (condition.substr(0, 1) == ' ') { // Remove initial space
        condition = condition.substr(1);
      }
      var parts = condition.split(' ');
      var countFlags = countCheckedFlags(checkedItems, parts[1], parts[0] == 'exists', grid);
      if (parts[0] == 'one' && (countFlags != 1 || totalFlags != 1) ||
          parts[0] == 'two' && (countFlags != 2 || totalFlags != 2) ||
          parts[0] == 'any' && countFlags == 0 ||
          parts[0] == 'no' && countFlags > 0 ||
          parts[0] == 'all' && (countFlags != totalFlags || countFlags == 0) ||
          parts[0] == 'exists' && countFlags == 0) {
        return false;
      }
    }
    return true;
  }

  return {
    getGridById: function(gridId) {
      var grid = Ext.isString(gridId) ? Ext.ComponentManager.get(gridId) : gridId;

      // Check whether this is a valid grid component
      if (grid && (!grid.xtype || grid.xtype != "simplegrid")) {
        grid = null;
      }

      return grid;
    },

    /**
     * Get the column id for the matching cell id. This assumes that the cell data in the record explicitly
     * declares a cell id with gwCellId. The column id is the grid's canonical column identifier c0|c1...cn
     * @param {Ext.data.Model} record the grid's row record
     * @param {String} cellId
     * @return {String} the column id or null if none
     */
    getColumnIdForCellId: function(record, cellId) {
      var data = record.data;
      if (data) {
        for (var columnId in data) {
          if (data.hasOwnProperty(columnId)) {
            var cellData = data[columnId];
            if (cellData && cellData.gwCellId && cellData.gwCellId === cellId) {
              return columnId;
            }
          }
        }
      }

      return null;
    },

    /**
     * Returns the value of the Cell that comes from a template widget.
     */
    getTemplateCell:function (value) {
      if (value && value.xtype == 'templatevaluepanel') {
        return value
      }
      return undefined
    },

    getFQRowOffset: function(fqRowOffsetRepr) {
      var cm = fqRowOffsetRepr.split('#');
      var offsetAndIndex = {};
      offsetAndIndex.offset = cm[0]; // Identifies the column map entry for the matching column configuration for the given row
      offsetAndIndex.index = (cm[1] ? Number(cm[1]) : 0); // Identifies the cell column config entry for the row
      return offsetAndIndex;
    },

    getFQRowOffsetFromRow: function(row) {
      var fqRowOffsetRepr = gw.GridUtil.getFQRowOffsetReprFromRow(row);
      return gw.GridUtil.getFQRowOffset(fqRowOffsetRepr);
    },

    getFQRowOffsetReprFromRow: function(row) {
      return row.get(gw.SimpleGrid.ROW_OFFSET);
    },

    getModeInsensitiveRowOffset : function (rOffset) {
      return rOffset ? rOffset.replace(/\([^\(]+\)/g, '') : rOffset
    },

    /**
     *
     * @param {gw.simplegrid} grid the grid component
     * @param {String} rowOffset The row offset declaration (relative row iteration declaration with iterated indices)
     * @return {Integer} the row index or -1 if none
     */
    getRowIdxForRowOffset:function (grid, rowOffset) {
      return grid.store.findBy(function (record) {
        var fqRowOffsetRepr = gw.GridUtil.getFQRowOffsetReprFromRow(record);
        var fqRowOffset = gw.GridUtil.getFQRowOffset(fqRowOffsetRepr);
        if (gw.GridUtil.getModeInsensitiveRowOffset(fqRowOffset.offset) === rowOffset) {
          return true;
        }
      });
    },

    getFullIdForCell:function (store, record, fieldName) {
      var offsetAndIndex = gw.GridUtil.getFQRowOffset(record.get(gw.SimpleGrid.ROW_OFFSET));
      var rOffset = offsetAndIndex.offset;
      var rI = offsetAndIndex.index;

      // @SenchaUpgrade Call base get method to get the entire object so we can retrieve cell id's for boolean types
      var value = Ext.data.Model.prototype.get.call(record, fieldName);

      var templateCell = gw.GridUtil.getTemplateCell(value)
      if (templateCell) {
        return templateCell.items[0].id
      }

      var rowId = gw.GridUtil.getModeInsensitiveRowOffset(rOffset);
      if (rowId == null) {
        rowId = store.indexOf(record)
      }

      var colName = fieldName;
      var serverId = store.storeId;

      var grid = Ext.ComponentManager.get(store.storeId);

      // The serverId is the base id for the fully qualified cell id.
      // The storeId for an LV is typically the component id that is not part of the fully qualified cell id
      // in particular if the LV  does not have an explicit id defined.
      if (grid && grid.gwBaseId) {
        serverId = grid.gwBaseId;
      }

      // The relative cell id is given explicitly by the cell id configuration
      if (value && value.gwCellId) {
        colName = value.gwCellId;
      } else {
        // fix the Id to be posted to server for RowTree checkbox
        // TODO: ExtJs4 upgrade - should we fix server response to simplify client logic?
        if (fieldName == 'checked' && record.fields.get(fieldName).mapping == '_Checkbox') {
          colName = '_Checkbox';
        }
      }

      return (rowId ? [serverId, rowId, colName] : [serverId, colName]).join(':');
    },

    getFirstInputInTemplateCell:function (value) {
      var templateCell = gw.GridUtil.getTemplateCell(value);
      if (templateCell) {
        var items = templateCell.items;
        if (items && items.length == 1) {
          return items[0];
        }
      }

      return null;
    },

    /**
     * Evaluate the new record model value based on the existing value.
     * If the new value is a simple type and the existing value is an object type, then
     * the updated value will keep the existing object value meta properties like id.
     * If the new value is an object type, then they take precedence over the old ones.
     * @param record the record to base the new update value on. The record will not be modified.
     * @param fieldName the record field name (cell value)
     * @param newValue the new value to evaluate. This object will not be modified.
     * @param newValueProps object with key/value pairs to add to the final object or null if nothing to add
     * @param keepValuePropsOnly optional: if indicated as array of property strings, keep old value properties only.
     * If not indicated, all old value properties are kept
     * @param removeValueProps optional: if indicated, remove the given value properties from the old value object
     * @return the new value as a record object or simple value based on the existing record value
     */
    //TODO: what the heck is this thing??!?!  It looks to be only used in privacy cell.  Why?  Remove?
    getRecordUpdateValue:function (record, fieldName, newValue, newValueProps, keepValuePropsOnly, removeValueProps) {
      // Leave the original newValue object the same
      var updateValue = Ext.isObject(newValue) ? Ext.apply({}, newValue) : newValue;

      // If the old value is an object, merge the new value object properties in.
      var oldValue = record.get(fieldName);
      if (Ext.isObject(oldValue) && (oldValue.hasOwnProperty("value") || oldValue.hasOwnProperty("text"))) {
        // Convert new value to object value if it is a simple value
        if (!Ext.isObject(updateValue)) {
          updateValue = {};
          updateValue["value"] = newValue;
          updateValue["text"] = newValue;
        }

        if (keepValuePropsOnly && Ext.isArray(keepValuePropsOnly)) {
          Ext.copyTo(updateValue, oldValue, keepValuePropsOnly);

        } else {
          // Remove specific properties from the old value object
          if (Ext.isArray(removeValueProps) && Ext.isObject(updateValue)) {
            var updatedOldValue = Ext.apply({}, oldValue);
            Ext.Array.forEach(removeValueProps, function (removeValueProp) {
              delete updatedOldValue[removeValueProp];
            });
            oldValue = updatedOldValue;
          }

          // Copy only value properties that are not declared in the new value yet.
          updateValue = Ext.applyIf(updateValue, oldValue);
        }
      }

      // Mix in new properties
      if (newValueProps && Ext.isObject(newValueProps)) {
        if (!Ext.isObject(updateValue)) {
          updateValue = {value:updateValue};
        }
        Ext.apply(updateValue, newValueProps);
      }

      return updateValue;
    },

    getTextForRadioGroupCell : function(editor, value) {
      var text
      var items = editor instanceof Ext.form.Field ? editor.initialConfig.items : editor.items;
      Ext.each(items, function(i) {
        if (i.inputValue == value) {
          text = i.boxLabel
          return false
        }
      })
      return text
    },

    /**
     * Update button state based on checked items
     * @param {String[]} flagged an array of button IDs
     * @param {Ext.data.Model[]} checkedItems an array of checked items
     * @param {Ext.grid.Panel} grid the grid
     */
    updateFlaggedButtons: function(flagged, checkedItems, grid) {
      Ext.each(flagged, function(btnId) {
        var btn = Ext.ComponentManager.get(btnId);
        if (btn && !btn.initialConfig.disabled) {
          var buttonFlags = btn.buttonFlags;
          var enabled;
          if (buttonFlags) {
            enabled = evalCheckboxFlags(checkedItems, buttonFlags, grid);
          } else {
            enabled = checkedItems.length > 0;
          }
          if (enabled) {
            btn.enable();
          } else {
            btn.disable();
          }
        }
      })
    },

    /**
     * Addes filters to bottom toolbar for the panel
     */
    addFiltersToPanel:function (panel, filters) {
      if (!panel.tbar) {
        panel.tbar = {xtype:'gtoolbar'}
      }
      panel.tbar.items = filters.concat(['-']).concat(panel.tbar.items || []);
    },

    processGridEditor : function(store, fqRowOffsetRepr, column, callback, inclEmptyEditor, scope) {

      // e.g.: summary row
      if (fqRowOffsetRepr === -1) {
        return false;
      }

      if (store && store.proxy && store.proxy.reader && store.proxy.reader.rawData) {
        var editorInfo = store.proxy.reader.rawData.editors;
        if (editorInfo) {
          var editors = editorInfo[column.mapping || column.dataIndex];
          if (editors) { // if the column has dynamic editors
            if (Ext.isNumeric(fqRowOffsetRepr)) {
              fqRowOffsetRepr = gw.GridUtil.getFQRowOffsetReprFromRow(store.getAt(parseInt(fqRowOffsetRepr)));
            }
            Ext.each(editors, function(editorByRow) {
              if (Ext.Array.indexOf(editorByRow[1], fqRowOffsetRepr) >= 0) {
                if (inclEmptyEditor || editorByRow[0]) {
                  callback.apply(scope || this, [editorByRow, editors])
                }
                //TODO: when an iteration contains multiple row configs, all of them have the same rowOffset?
                return false; // break out of the loop
              }
            })
          }
        }
      }
    },

    processCellClick:function (column, grid, record, rowIndex, columnId, clickCallback) {
      var field = {};
      var editor;
      if (column.getEditor) {
        editor = column.getEditor();
      }
      Ext.apply(field, editor);
      field.eventParam = gw.GridUtil.getFullIdForCell(grid.getStore(), record, columnId)
      field.completeEdit = clickCallback
      gw.app.handleChange(field)
    },

    processRadioCellClick: function(radioCheckStatus, column, grid, record, rowIndex, columnId) {
      var store = grid.getStore();

      // Check that this field is a radio input. Do not update if this is not a radio input field
      var editorCfg = null;
      var radioGroup = null;
      gw.GridUtil.processGridEditor(store, rowIndex, column, function(editorByRow) {
        editorCfg = editorByRow[0];
        radioGroup = editorCfg.group;
      });

      if (editorCfg && editorCfg.xtype == 'radio') {
        var oldValue = record.get(columnId);
        if (oldValue != radioCheckStatus) {
          // Update the record for the radio input field and handle the change event
          record.set(columnId, radioCheckStatus);

          if (radioCheckStatus) {
            // A radio input field does not have an editor. Handle the change event
            // The change event only needs to tell which radio input is now checked in the same radio group
            var radioField = {};
            Ext.apply(radioField, {postOnChange: editorCfg.postOnChange}, null);
            radioField.eventParam = gw.GridUtil.getFullIdForCell(store, record, columnId);
            var extraParams = {};
            if (radioCheckStatus && radioGroup) {
              // Add the check box id for the group for which the radio input has been checked
              extraParams[radioGroup] = radioField.eventParam;
              store.extraValues = store.extraValues || {};
              store.extraValues[radioGroup] = radioField.eventParam;
            }
            gw.app.handleChange(radioField, radioCheckStatus, oldValue, null, extraParams);

            // Update all radio input fields for the same group in the same column if this column has been checked.
            var len = store.getCount();
            for (var i = 0; i < len; i++) {
              if (i != rowIndex) {
                var groupRecord = store.getAt(i);
                // Uncheck radio input fields in the same group
                gw.GridUtil.processRadioCellClick(false, column, grid, groupRecord, i, columnId);
              }
            }
          }
        }
      }
    },

    /**
     * Commits Grid cell editor to the model, without dismissing the editor (otherwise it may break tabbing and focus behavior).
     * @SenchaUpgrade: mimic private method of ExtJs.
     * @param ed: if specified, only commit the editor that matches this one
     */
    commitGridEditorValue: function(ed) {
      Ext.ComponentManager.each(function(id, comp) {
        if (comp instanceof gw.SimpleGrid) {
          var cellEditingPlugin = comp.getCellEditingPlugin();
          var activeEd = cellEditingPlugin.getActiveEditor();
          if (activeEd) {
            if (!ed || ed === activeEd ) {

              var context = cellEditingPlugin.context;
              var record = context.record;
              var value = activeEd.getValue();
              context.value = value;
              if (!cellEditingPlugin.validateEdit()) {
                return false;
              }

              // Only update the record if the new value is different than the
              // startValue. When the view refreshes its el will gain focus
              if (!record.isEqual(value, activeEd.startValue)) {
                var activeColumn = cellEditingPlugin.getActiveColumn();
                record.set(activeColumn.dataIndex, value);
                activeEd.startValue = value;
              }
            }
            return false;
          }
        }
      });
    },

    hasEditor: function (editorType) {
      return !(editorType == 'radiogroup' ||
          editorType == 'checkbox' ||
          editorType == 'radio');
    },

    /**
     * Format the summary data and apply style classes if given
     * @param {Object} summaryData summary data
     * @param {String} summaryData.id optional summary data id, mandatory if cls given
     * @param {String} summaryData.text summary data text
     * @param {String} summaryData.cls optional summary data style classes
     * @private
     */
    formatSummaryData: function (summaryData) {
      var summaryText = null;
      if (Ext.isString(summaryData.cls)) {
        summaryText = '<A class="' + summaryData.cls + '" id="' + summaryData.id + '">' + summaryData.text + '</A>';
      } else {
        summaryText = summaryData.text;
      }
      return summaryText;
    }
  };

}();