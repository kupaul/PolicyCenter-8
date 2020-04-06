/**
 * Reflection
 */

gw.reflection = function() {
  var _reflectPath = []; // keep track of reflection path to detect circular reflection
  var _reflectors = null;  // list of reflectors
  var _rangeReflectorToTriggersMap = null; // map of range reflector to triggers
  var _lvIds = [];

  var _trackElementsToRedo = null;
  var _pendingReqs = null;
  var NO_CHANGE = '<NOCHANGE>'; // a special string to indicate value not changed
  var TRIGGER_INDEX_PARAM = 'TRIGGER_INDEX'; // name of trigger index param


  function _processOneResponse(newValues, resp) {
    if (resp.cmd) {
      return !gw.app.processCommand(resp);
    }
    newValues[resp.index] = resp.value;
    return true;
  }

  function _request(reqs, newValues, fcnCallback) {
    gw.app.requestViewRoots(reqs,
      function(options, success, response) {
        var data = Ext.decode(response.responseText);
        if (newValues) {
          if (reqs.length == 1) { // single request
            _processOneResponse(newValues, data[0])
          } else { // multiple requests
            Ext.each(data, function(d) {
              return _processOneResponse(newValues, Ext.decode(d)[0])
            })
          }
        }
        if (fcnCallback) {
          fcnCallback()
        }
      })
  }

  function _updateAllReflectors(aspects, newValues) {
    var aspect, pocReflectors = [];
    for (var i = 0; i < aspects.length; i++) {
      aspect = aspects[i];
      if (aspect.maybePostToServer()) {
        pocReflectors.push([aspect, newValues[i]]); // postpone poc request to the end
      } else {
        aspect.updateReflector(newValues[i]);
      }
    }

    Ext.Array.each(pocReflectors, function(item) {
      item[0].updateReflector(item[1]);
    });
  }

  function _logReflection(comp, aspects, cancelledReflectors) {
    var logMsg = '<b>Start reflecting </b>: ' + gw.reflection.getIdForReflection(comp);
    if (_reflectPath.length > 1) {
      logMsg += '<br>(path): ' + _reflectPath;
    }
    if (aspects.length > 0) {
      logMsg += '<br>(Reflectors): ';
      for (var i = 0; i < aspects.length; i++) {
        if (i > 0) {
          logMsg += ' | '
        }
        logMsg += aspects[i].reflector.id + ' [' + aspects[i].name + ']';
      }
    }
    if (cancelledReflectors.length > 0) {
      logMsg += '<br>(Circular reflectors cancelled): ' + cancelledReflectors;
    }
    gw.Debug.log(logMsg);
  }

  /**
   * Updates alt footer value from server
   */
  function _updateAltValue(comp) {
    if (comp instanceof Ext.form.Field) {
      if (comp.hasAltValue && comp.hasAltValue()) {
        gw.app.requestViewRoot(comp.id, {'calcAltModelValue':comp.getValue()}, 'NO_MASK_ELEM', {altValComp:comp});
      }
    }
  }

  /**
   * Get the grid info object for the LV id that matches the given component grid id. The LV id may be
   * a parent container id or a named row iterator id if the LV id has a render id only (has no explicit LV id).
   * The grid id is the component id as registered in the browser component registry.
   * The rowOffset and dataIndex are needed to get the right LV match. Anonymous LV ids that share
   * the same parent container id can only be disambiguated by a row offset / data index.
   * @param lvId LV id or cell id part identifying a part of an LV (like parent naming container id)
   * @param rowOffset row offset or null if header cell
   * @param dataIndex data index (cell id part) or null if row offset only
   * @param gridId component id to match against
   * @return grid info or null if lvId, rowOffset and dataIndex do not match the given component grid id.
   */
  function getGridInfo(lvId, rowOffset, dataIndex, gridId) {
    var grid = gw.GridUtil.getGridById(gridId);

    // If no grid found or component may not be a grid (no gwBaseId)
    if (!grid || grid.gwBaseId == undefined) {
      return null;
    }

    // Check whether the base id matches, otherwise the given grid component is not matching
    // Check by splitting the base id by : id parts. A toolbar for an LV with id 'foo' has id 'foo_tb'.
    var lvIdParts = lvId.split(':');
    var gwBaseIdParts = grid.gwBaseId.split(':');
    if (gwBaseIdParts.length > lvIdParts.length) {
      return null;
    }
    for (var i = 0; i < gwBaseIdParts.length; i++) {
      if (i < lvIdParts.length && gwBaseIdParts[i] != lvIdParts[i]) {
        return null;
      }
    }

    // Get the matching fully qualified row offset from the grid
    var fqRowOffsetRepr = null;
    var idx = -1;

    // If there is no rowOffset, then check for a header cell
    if (rowOffset == null) {
      // No matching column found for data index
      if (!grid.getColumnById(dataIndex)) {
        return null;
      }

    } else {
      idx = gw.GridUtil.getRowIdxForRowOffset(grid, rowOffset);

      // No matching record could be found in the grid.
      if (idx == -1) {
        return null;

      } else {
        var record = grid.store.getAt(idx);
        fqRowOffsetRepr = gw.GridUtil.getFQRowOffsetReprFromRow(record);
      }

      // The cell id is the original field id as specified in PCF. The dataIndex will be normalized to
      // a grid component data index (c1, ..., cn).
      var cellId = dataIndex;

      // Update the data index if the row offset matches a different row iterator than the dominant row iterator
      // indicated by the data index
      if (dataIndex != null) {
        // If the dataIndex matches a specific cell id, get its column definition and normalized column id
        var record = grid.store.getAt(idx);
        var cId = gw.GridUtil.getColumnIdForCellId(record, cellId);
        if (cId != null) {
          dataIndex = cId;
        }
      }
    }

    // Set up the grid info object
    var gridInfo = {};

    // The fully qualified cell element id based on PCF naming/id.
    gridInfo.eventParam = (rowOffset == null) ?
        lvId + ":" + cellId :
        lvId + ":" + rowOffset + ":" + cellId;

    gridInfo.grid = grid;

    gridInfo.recIdx = idx;
    gridInfo.row = fqRowOffsetRepr;
    gridInfo.dataIndex = dataIndex;

    gridInfo.getGrid = function() {
      return gridInfo.grid;
    };

    gridInfo.getColumn = function() {
      return gridInfo.grid.getColumnById(gridInfo.dataIndex);
    };

    gridInfo.getRecord = function() {
      return gridInfo.recIdx == -1 ? null : gridInfo.grid.store.getAt(gridInfo.recIdx);
    };

    gridInfo.getCellValue = function () {
      var rec = gridInfo.getRecord();
      return rec ? rec.get(gridInfo.dataIndex) : gridInfo.getColumn().titleContainer.dom;
    };

    gridInfo.getCellValueText = function () {
      var value = gridInfo.getCellValue();
      return (value && value.text != undefined) ? value.text : value;
    };

    gridInfo.setCellValue = function (value) {
      var record = gridInfo.getRecord();
      if (record) {
        record.beginEdit();
        record.set(gridInfo.dataIndex, value);
        var cellEditingPlugin = gridInfo.getGrid().getCellEditingPlugin();
        var activeEd = cellEditingPlugin.getActiveEditor();
        if (activeEd
            && cellEditingPlugin.getActiveColumn().dataIndex === gridInfo.dataIndex
            && cellEditingPlugin.getActiveRecord() === record) {
            var gPosition = {
              row: cellEditingPlugin.context.rowIdx,
              column: cellEditingPlugin.context.colIdx
            };
            //reset editor's value.  If a server-side reflection, the cell with the active
            //editor can be updated while the editor still shows the old value.
            cellEditingPlugin.cancelEdit(true);
            cellEditingPlugin.startEditByPosition(gPosition);
        }
        record.endEdit();
      }
    };

    return gridInfo;
  }

  /**
   * Get data grid information for the given cell id. It is assumed that the id is a fully qualified cell id
   * into the grid. The lvId is the component id for the candidate grid component (or other component) to test
   * the cell id against. If the component is not a grid component or not a matching LV id, then no grid information
   * object is sent back.
   * @param cellId fully qualified cell id identifying a cell in a grid
   * @param gridId component id for grid id to test the cellId against
   * @return the grid information object or null if this is not a cell id or the lvId is not a matching grid component.
   */
  function getGridInfoByCellId(cellId, gridId) {
    var grid = gw.GridUtil.getGridById(gridId);

    // Check whether the base id matches, otherwise the given grid component is not matching
    if (!grid || cellId.indexOf(grid.gwBaseId) != 0) {
      grid = null;
    }

    if (grid) {
      // Parse the fq cell id: <LV base id>:<row offset>:<data index / cell id>
      var lastDel = cellId.lastIndexOf(":");
      var dataIndex = cellId.substring(lastDel + 1);
      var rowOffset = cellId.substring(grid.gwBaseId.length + 1, lastDel);

      grid = getGridInfo(grid.gwBaseId, rowOffset, dataIndex, gridId);
    }

    return grid;
  }

  ////////////////////////////////////////////////////////////
  // Public methods.

  return {
    getPrerequisiteAjaxParam : function (triggerElem) {
      var rangeTriggers = _rangeReflectorToTriggersMap[this.getIdForReflection(triggerElem)];
      return rangeTriggers == null ? null : this.addAjaxParams({}, null, rangeTriggers, null, null);
    },

    getNoChangeString : function() {
      return NO_CHANGE;
    },

    init : function(metaMap, bAppend, lvIds, reflectionOnLoad) {
      if (!bAppend) { // reset reflectors:
        _reflectors = []
        _rangeReflectorToTriggersMap = {};
        _lvIds = []
      }

      Ext.iterate(metaMap, function (rId, value) {
        var reflector = new gw.reflection.Reflector(rId, value);
        _reflectors.push(reflector);
        reflector.addRangeReflector(_rangeReflectorToTriggersMap); // collect all range reflectors
      })

      if (lvIds) {
        _lvIds = _lvIds.concat(lvIds)
      }

      _reflectPath = [];

      if (reflectionOnLoad) {// redo reflection for user values not yet in backing model, when return to page after click away
        _trackElementsToRedo = [];
        _pendingReqs = [];
        for (var i = 0; i < reflectionOnLoad.length; i++) {
         gw.reflection.reflect(Ext.ComponentManager.get(reflectionOnLoad[i]), true)
        }

        // add requests for updating sum value into the AJAX call
        // TODO: can we leverage LV sums instead?
        //    var sumValueReqs = DHTML.updateSumValues(Reflection._trackElementsToRedo);
        //    if (sumValueReqs) {
        //      for (var i=0; i<sumValueReqs.length; i++) {
        //        this._pendingReqs.push(sumValueReqs[i]);
        //      }
        //    }

        if (_pendingReqs.length > 0) {
          _request(_pendingReqs, undefined, undefined)
          //ReflectionImpl_endRedoMode()
        } else {
          //ReflectionImpl_endRedoMode();
        }
        _pendingReqs = null;
      }
    },

    reflect : function (e, bDirectChange) {
      if (!_reflectors) {
        return;
      }

      // Post page to server, if this is a postOnChange item
      var tId = this.getIdForReflection(e);
      if (e.postOnChange) {
        if (!bDirectChange) {
          gw.Debug.log("<b>PostOnChange by reflecting</b>: " + tId);
        }
        gw.app.handleAction(null, tId);
        //    // If mouse is about to be released, wait till then before post (No need to post, if the current mouse event is going to post)
        //    var actionStr = ReflectionImpl_getDelayedRefreshActionString(tId);
        //    var waitTillMouseRelease = EventHandlers.setMouseReleaseActionString(actionStr);
        //    if (!waitTillMouseRelease) {
        //      // post after all other events already in queue get executed:
        //      eval(actionStr);
        //    }
        return;
      }

      //
      // client reflection:
      //
      if (bDirectChange) {
        gw.Debug.log("Direct change resetting reflect path for " + tId)
        _reflectPath = [tId]; // reset reflect path
      }

      // gather all reflector aspects of this trigger:
      var aspects = [];
      var reflectorsForTrigger = [];
      var cancelledReflectors = [];
      var trackElements = this._trackElementsToRedo;
      Ext.each(_reflectors, function(reflector) {
        if (trackElements && Ext.ComponentManager.get(reflector.id) instanceof Ext.form.field.Display) {
          return; // ignore editable reflector, the value of which should have been remembered
        }
        if (Ext.Array.indexOf(_reflectPath, reflector.id) == -1) {
          if (reflector.addAspects(e, bDirectChange, aspects)) {
            reflectorsForTrigger.push(reflector.id);
          }
        } else {
          var temp = [];
          if (reflector.addAspects(e, bDirectChange, temp)) {
          // circle detected, cancel
            cancelledReflectors.push(reflector.id);
          }
        }
      })

      if (aspects.length > 0 || cancelledReflectors.length > 0) {
        _logReflection(e, aspects, cancelledReflectors)
        var newValues = [];
        var ajaxRequests = [];

        var updateReflectors = function() {
          // update reflect path before invoking chained reflections:
          _reflectPath = _reflectPath.concat(reflectorsForTrigger)
          _updateAllReflectors(aspects, newValues);
        };

        // fetch new value for each aspect that has been triggered (some new value may be on the server side):
        Ext.each(aspects, function(aspect, index) {
          newValues[index] = gw.reflection.getNoChangeString();
          var ajaxCall = aspect.addNewReflectorValue(e, newValues, index);
          if (ajaxCall) {
            ajaxRequests.push(ajaxCall);
          }
        })

        // update all reflectors:
        if (ajaxRequests.length > 0) {
          if (_trackElementsToRedo) { // collect all ajax requests to be sent at once
            Ext.each(ajaxRequests, function(req) {
              _pendingReqs.push(req);
            })
          } else {
            _request(ajaxRequests, newValues, updateReflectors)
          }
        } else {
          updateReflectors();
        }
      }

      // update alt value:
      _updateAltValue(e)
    },

    getTriggerIndexParamString : function() {
      return TRIGGER_INDEX_PARAM
    },

    addAjaxParams : function(params, type, tIds, triggerId, index) {
      if (type) {
        params['aspectType'] = type;
      }
      var multipleTriggers = tIds.length > 1;
      Ext.each(tIds, function(tId,i) {
        params[tId] = gw.reflection.getFieldValueById(tId);
        if (multipleTriggers && triggerId == tId) {
          params[TRIGGER_INDEX_PARAM] = i + 1; // add 1-based trigger index to ajax params
        }
      })
      params['index'] = index;
      return params;
    },

    getIdForReflection :function (e) {
      if (e.eventParam) {
        return e.eventParam;
      }
      if (e instanceof Ext.form.field.Checkbox) {
        var id = e.id;
        var name = e.name;
        return id.indexOf(name) == 0 ? name : id; // if the id is in the form of "name"+"value", returns "name" as renderId
//      } else if (e instanceof gw.ext.SimpleCombo || e instanceof Ext.ux.form.MultiSelect) {
//        return e.hiddenName
      } else {
        return e.hiddenName || e.id;
      }
    },
    getFieldValueById : function(id) {
      var comp = Ext.ComponentManager.get(id);
      if (comp) {
        return gw.ext.Util.getFieldValue(comp);
      }

      var gridInfo = gw.reflection.getGridInfoByCellId(id);
      if (gridInfo != null 
            && gridInfo.getCellValue) { // Work around JavaScript error - Why is gridInfo invalid here?
        var value = gridInfo.getCellValue();
        if (value && value.value !== undefined) {
          value = value.value;
        }
        return value;
      }
      return null;
    },

    /**
     * Get data grid information for the given id. It is assumed that the id is a fully qualified cell id
     * into the grid.
     * @param cellId fully qualified cell id identifying a cell in a grid
     * @return the grid information object or null if this is not a cell id or no matching LV has been found
     */
    getGridInfoByCellId: function(cellId) {
      var gridInfo = null;

      Ext.each(_lvIds, function(lvId) {
        gridInfo = getGridInfoByCellId(cellId, lvId);

        // Keep on searching (true) if grid info could not be found
        return !gridInfo;
      });

      return gridInfo;
    }
  }
}();



