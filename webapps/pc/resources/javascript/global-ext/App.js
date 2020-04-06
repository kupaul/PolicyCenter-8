//---------------------------------------------------
// Defines gw namespace and the main app object.
//---------------------------------------------------

Ext.namespace('gw.ext');

//=============================================================================================
// The following classes are referenced directly, need to load them explicitly to enable bootstrap in DEV mode:
//=============================================================================================
Ext.require('Ext.state.LocalStorageProvider');
Ext.exclude('Ext.action.*').require('Ext.form.*');
Ext.require('Ext.layout.container.Border');
Ext.require('Ext.layout.container.Table');

/**
 * The main app object that handles client state and communication with server.
 */
gw.app = function() {
  //
  // private properties and methods:
  //  

  /** id of the last AJAX call */
  var _lastReq = null;
  /** css class to mark an html element as an event source. (Used for event not registered at Ext component level.) */
  var _EVENT_SOURCE_CLS = 'g-actionable';
  /** css class to indicate a panel is loading content from server */
  var _PANEL_LOADING_CLS = 'g-panel-loading';
  var _maskedElem = null;
  /** config options from the server */
  var _config = null;
  /** server url */
  var _serverURL = null;
  /** global keymap */
  var _keyMap = null;
  /** keeps track of field focus*/
  var _focusId = null;
  /** keeps track of mouse state */
  var _mouseDown = false;
  /** a window-timeout to invoke onChange handler */
  var _delayedOnChange = null;
  var _bWarnUnsavedWork = false;
  /** The id of the server-side request, which we send back to the server so the appropriate times can be associated */
  var _serverRequestId = null;
  /** The time when the last event began to be sent to the server.  We use this for performance tracking */
  var _eventStartTime = null;
  /** The time when the last event was actually sent to the server.  We use this for performance tracking */
  var _requestSentTime = null;
  /** Whether SeleniumGW_isGWOperationDone() has logged the action completed data point */
  var _actionCompleteLogged = false;
  /** The id of the last event source, used for performance tracking */
  var _lastEventSourceId = null;
  /** The data that we're going to send over in the magic reqMon field for performance tracking */
  var _reqMonData = null;

  var _lastServerCall = null;

  /** keeps track of incoming ajax requests. */
  var _ajaxRequestQueue = [];

  /** keeps track of error messages for all ajax requests. */
  var _errors = [];

  function collectChangesFromRecord(rec, store, params) {
    var map = rec.fields.map;
    var raw = rec.getChanges();

    Ext.iterate(raw, function (prop, value) {
      var m;
      if ((m = map[prop])) {
        var paramName = gw.GridUtil.getFullIdForCell(store, rec, m.name);
        if (value) {
          if (value.cb != null) { // cell checkbox value
            params[paramName + 'CB'] = value.cb
          }
          if (value.text !== undefined) {
            value = value.text; // unbox composite value, AT LAST
          }
        }
        params[paramName] = value
      }
    });
  }

  /**
   * Collect form data and store data changed by the user
   * @return data changes
   */
  function getDataChanges() {
    var params,
        activeCombo,
        mainForm = Ext.getCmp('mainform');
        
    // too early to get changes    
    if (!mainForm) {
        return null;
    }

    if (_focusId && (activeCombo = Ext.ComponentManager.get(_focusId)) instanceof Ext.form.ComboBox) {
      // @SenchaUpgrade: A bounded combo doesn't revert out-of-range value until blur.
      // Have to force it, when the action is invoked by keyboard shortcut and a combo still has focus
      activeCombo.assertValue(); // revert out-of-range value for bounded combo
    }

    gw.GridUtil.commitGridEditorValue();

    // form data
    // Use component query instead of getValues(). Since we are constantly replacing items
    // and having items inside menus and other containers not common to forms, it's more
    // reliable to not use a form
    // params = Ext.ComponentManager.get('mainform').getForm().getValues();
    params = getFormValues(mainForm);
    
    // store data:
    Ext.data.StoreManager.each(function(store) {
      var rs = store.getUpdatedRecords();
      for (var i = 0; i < rs.length; i++) {
        collectChangesFromRecord(rs[i], store, params)
      }

      // special values used for RadioColumn:
      if (store.extraValues) {
        Ext.apply(params, store.extraValues);
        delete store.extraValues; // forget it once send to server
      }
    });
    
    // copy from BasicForm
    function getFormValues(mainForm, dirtyOnly, includeEmptyText, useDataValues) {
        var values  = {},
            fields  = mainForm.query('[isFormField]'),
            f,
            fLen    = fields.length,
            isArray = Ext.isArray,
            field, data, val, bucket, name;

        for (f = 0; f < fLen; f++) {
            field = fields[f];

            if (!dirtyOnly || field.isDirty()) {
                data = field[useDataValues ? 'getModelData' : 'getSubmitData'](includeEmptyText);

                if (Ext.isObject(data)) {
                    for (name in data) {
                        if (data.hasOwnProperty(name)) {
                            val = data[name];

                            if (includeEmptyText && val === '') {
                                val = field.emptyText || '';
                            }

                            if (values.hasOwnProperty(name)) {
                                bucket = values[name];

                                if (!isArray(bucket)) {
                                    bucket = values[name] = [bucket];
                                }

                                if (isArray(val)) {
                                    values[name] = bucket.concat(val);
                                } else {
                                    bucket.push(val);
                                }
                            } else {
                                values[name] = val;
                            }
                        }
                    }
                }
            }
        }

        return values;
    };
    

    //checksum:
    var compsWithChecksum = [gw.ext.Util.getTabBarLinksId(), gw.ext.Util.getTabsId(), gw.ext.Util.getInfoBarId()]
         .concat(Ext.ComponentManager.get('westPanel').items.items);
    Ext.each(compsWithChecksum, function(item) {
      if (Ext.isString(item)) {
        item = Ext.ComponentManager.get(item)
      }
      if (item && item.checksum) {
        params[item.id] = item.checksum
      }
    });
    return params
  }

  /**
   * Sends request to server
   * @param eventSource id of the action source
   * @param eventParam additional param for the action
   * @param params (optional) params for the server request, if not specified, form values are collected
   * @param postForm (optional) if true, and params is not null, form values are added to the params
   * @param maskElem (optional) if not specified the entire page body will be masked during the request
   * @param auxConfig (optional) additional config for the request
   * @return Returns the AJAX request id, if any request sent
   */
  function _callServer(eventSource, eventParam, params, postForm, maskElem, auxConfig) {

    // if a pending request is being processed, queue up the new request till the previous one finishes:
    if (Ext.Ajax.isLoading()) {
      gw.Debug.log('<span style="color:olive">Ajax request put in queue.</span> Current request: [' +
           Ext.Ajax.getLatest().id + '] ' + Ext.Ajax.getLatest().options.params);
      var requestParams = [];
      requestParams.eventSource = eventSource;
      requestParams.eventParam = eventParam;
      requestParams.params = params;
      requestParams.postForm = postForm;
      requestParams.maskElem = maskElem;
      requestParams.auxConfig = auxConfig;
      _ajaxRequestQueue.push(requestParams);
      return -1;
    }

    // We record the time that the call was initiated and what initiated the call; this data is then pulled
    // out at the end of processing the reply to compute the total end-to-end time and to set the _reqMonData
    // variable
    _eventStartTime = new Date().getTime();
    if(eventSource == "_refresh_") {
      _lastEventSourceId = eventParam + '.' + eventSource
    } else {
      _lastEventSourceId = eventSource;
    }

    if (!params) { // collect form values, if no params specified:
      params = getDataChanges()
    } else if (postForm) {
      Ext.apply(params, getDataChanges())
    }


    // collect scroll positions, and remember it in this "request scope":
    var scrollPositions = {};
    Ext.ComponentManager.each(function(id, comp) {
      var el;
      if (comp.autoScroll == true && (el = comp.getTargetEl()) && el.dom) { // @SenchaUpgrade getTargetEl() is private
        var scroll = el.getScroll();
        if (scroll.left != 0 || scroll.top != 0) {
          scrollPositions[comp.id] = scroll;
        }
      }
    });
    if (Ext.Object.getKeys(scrollPositions).length > 0) {
      params.scrollPositions = Ext.JSON.encode(scrollPositions); // send scroll postions to server
    }


    // apply special params:
    if (eventSource) {
      params.eventSource = eventSource;
    }
    if (eventParam != null) { // allow blank string as eventParam
      params.eventParam = eventParam
    }


    // If _reqMonData is set, that means we have timing data to send back to the server.  So we send it back as
    // the special "reqMon" parameter, then null it out so we don't re-send the same data twice.
    if (_reqMonData) {
      params.reqMon = _reqMonData;
      _reqMonData = null;
    }

    var fullPage = !params.ajaxRequestInfo;
    if (fullPage) { // full page refresh

      if (_focusId) { // send focus id to server
        gw.Debug.log('Sending current focus to server: ' + _focusId);
        params.objFocusId = _focusId;
      }

      if (_delayedOnChange) { // cancel timeout for postOnChange, since we are posting now:
        gw.Debug.log('clear _delayedOnChange');
        clearTimeout(_delayedOnChange);
        _delayedOnChange = null
      }
    }

    _lastServerCall = eventSource + ", " + eventParam + ", " + params ? Ext.encode(params) : "";

    if (maskElem != 'NO_MASK_ELEM') {
    _showBusy.call(gw.app, maskElem)
    }

    var options = Ext.apply({
      url:_serverURL,
      params:Ext.urlEncode(params),
      callback:_requestCallback,
      fullPage : fullPage,
      timeout : 600000 // 10 minutes
    }, auxConfig);
    _lastReq = _processAjaxRequest(options);

    if (options.isUpload) {// no callback is available for upload/download, hide busy cursor after a timeout
      Ext.defer(_hideBusy, 2000, this, [gw.app]);
    }

    _requestSentTime = new Date().getTime();
    return _lastReq;
  }

  function _processAjaxRequest(requestParams) {
    var realCallback = requestParams.callback;

    function _wrappedAjaxCallback(requestOptions, success, response) {
      // invoke callback to finish up the last request:
      realCallback(requestOptions, success, response);

      // check if any more requests are in queue:
      if (_ajaxRequestQueue.length > 0) {
        gw.Debug.log('<span style="color:olive">Try to process queued Ajax request(s)</span> after request: [' +
             response.requestId + '] ' + requestOptions.params);
        if (!Ext.Ajax.isLoading()) {
          var requestParams = _ajaxRequestQueue.shift();
          _callServer(requestParams.eventSource,
               requestParams.eventParam,
               requestParams.params,
               requestParams.postForm,
               requestParams.maskElem,
               requestParams.auxConfig)
        } else {
          gw.Debug.log('<span style="color:red"><b>Can\'t</b> process queued Ajax request(s), because of another request pending:</span> ['
               + Ext.Ajax.getLatest().id +'] ' + Ext.Ajax.getLatest().options.params);
        }
      } else {
        // Show errors after all requests have been processed:
        if (_errors.length > 0) {
          gw.cmdProc.showErrors({cmd : 'showErrors', errors: _errors});
          _errors = []
        }
      }
    }

    requestParams.callback = _wrappedAjaxCallback;
    return _lastReq = Ext.Ajax.request(requestParams)
  }

  /**
   * processes commands from server response
   * @private
   */
  function _processCommands(commands, requestOptions, response) {
    // AHK - 12-11-2012 - As a performance optimization, we want to suspend all layout
    // during command processing, and only actually do the layout once we're done with
    // all commands
    Ext.suspendLayouts();


    // @SenchaUpgrade A temp workaround for JavaScript error in ExtJs 4.2.1:
    // When invoking an action using keyboard while a cell editor is still active, if the server response of the action
    // removing the grid (for example, if the action is to commit the page), JS error happens when rendering the new
    // page. Dismissing the cell editor before removing the Grid prevents the error, however,dismissing the cell
    // editor during "beforedestroy" event of the grid seems to late and doesn't prevent the error.
    // TODO: Identify the root cause, and file ticket for ExtJs.
    if (requestOptions && requestOptions.fullPage) {
      // if this is a full page refresh, it's safe to assume any existing grid is being removed
      Ext.ComponentManager.each(function(id, comp) {
        if (comp instanceof gw.SimpleGrid) {
          var cellEditingPlugin = comp.getCellEditingPlugin();
          var activeEd = cellEditingPlugin.getActiveEditor();
          if (activeEd) {
//            console.log('dismiss editor in PROCESS_COMMANDS');
            activeEd.cancelEdit();
          }
        }
      })
    }


    for (var i = 0; i < commands.length; i++) {
      var op = commands[i];
      gw.app.processCommand(op, requestOptions, response)
    }
    Ext.resumeLayouts(true);
  }

  /**
   * Handles success response from server
   * @param requestOptions request info
   * @param success if the request succeeded
   * @param response response
   */
  function _requestCallback (requestOptions, success, response) {
    // We null out _serverRequestId at the start, since it
    // should be set in the course of processing commands if the server is doing request time monitoring
    _serverRequestId = null;
    var responseReceivedTime = new Date().getTime();
    _hideBusy.call(gw.app);

    if (!success) { // unexpected HTTP request failure:
      if (!_config.displayKeys){
          alert('HTTP request failed: ' + response.status);
      }else{
          alert(Ext.String.format(_config.displayKeys["ExtJS.Alert.HTTPRequestFailed"], response.status));
      }

      return
    }

    try {
      var commands = Ext.decode(response.responseText)
    } catch (e) {
      if (!_config.displayKeys){
        alert('Invalid server response. Please check server log.\n' + response.refreshText);
      }else{
          alert(Ext.String.format(_config.displayKeys["ExtJS.Alert.InvalidServerResponse"], response.refreshText));
      }
      return;
    }

    _processCommands(commands, requestOptions, response);

    if (requestOptions.fullPage) { // update initial focus after a full page refresh
      _initFocus()
    }

    if (requestOptions.postCallback) { // additional op after processing response
      requestOptions.postCallback.call(requestOptions.postCallbackScope ? requestOptions.postCallbackScope: this,
          requestOptions, response)
    }

    // restore scroll position, if so requested:
    if (requestOptions.scrollPositions) {
      Ext.Object.each(requestOptions.scrollPositions, function(id, scrollInfo) {
        var comp = Ext.ComponentManager.get(id);
        var el;
        if (comp && (el = comp.getTargetEl()) && el.dom) { // @SenchaUpgrade getTargetEl() is private
          Ext.Object.each(scrollInfo, function(side, value) {
            if (value != 0) {
              el.scrollTo(side, value, false);
            }
          });
        }
      });
    }

    var doneProcessingTime = new Date().getTime();
    var requestPrepTime = (_requestSentTime && _eventStartTime ? _requestSentTime - _eventStartTime : 0);
    var responseTime = (_requestSentTime ? responseReceivedTime - _requestSentTime : 0);
    var clientRenderTime = (doneProcessingTime - responseReceivedTime);
    // If _serverRequestId is non-null, that means the server is doing request time monitoring, so we want to set
    // the _reqMonData variable so the data gets sent back to the server on the next event
    if (_serverRequestId) {
      _reqMonData = Ext.JSON.encode([_lastEventSourceId, requestPrepTime, responseTime, clientRenderTime, doneProcessingTime, _serverRequestId, navigator.userAgent]);
    }
    gw.Debug.log('<span style="color:orange">_requestCallback took ' + responseTime + 'ms (response), + ' + clientRenderTime + ' (client)ms</span>')
    _lastEventSourceId = null;
    _eventStartTime = null;
    _requestSentTime = null;
    _actionCompleteLogged = false
  }

  /**
   * Masks a component to prevent user action.
   * @comp must be a container component. If not specified, the entire page body will be masked
   */
  function _showBusy(comp) {
    _maskedElem = null;
    if (comp) {
      if (comp.items) { _maskedElem = comp.getEl() }
    } else {
      _maskedElem = Ext.getBody();
    }

    if (_maskedElem) {
      _maskedElem.mask()
    }
  }

  /**
   * Unmask the element masked during last request
   */
  function _hideBusy() {
    if (_maskedElem) {
      _maskedElem.unmask()
    }
  }

  function _isFieldFocusable(f) {
    return f.xtype != 'quickjump' &&
        f.xtype != 'hidden' &&
        f.xtype != 'gHiddenFile' &&
        f.xtype != 'gfile' &&
        !(f instanceof Ext.form.field.Display) &&
        !f.disabled && f.isVisible(/*deep*/true) &&
        !f.readOnly
  }

  /**
   * Sets initial field focus
   */
  function _initFocus() {
    var field = null;

    if (_focusId) { // restore focus
      field = Ext.ComponentManager.get(_focusId);
      if (field) { // Ext Component
        if (_isFieldFocusable(field)) {
          field = _getFocusableField(field)
        }
        else {
          field = null
        }
      } else { // DOM Element
        field = Ext.get(_focusId);
      }
      _focusId = null;
    }

    if (!field) { // find the first field on page
        Ext.getCmp('mainform').cascade(function(cmp) {
            // stop everything on the current branch if:
            // - we found the field already
            if (field) {
                return false;
            }
            
            // if is focusable and we found the field, stop everything
            if (cmp.isFormField && _isFieldFocusable(cmp)) {
                field = _getFocusableField(cmp);
                if (field) {
                    return false;
                }
            }
        });
    }

    if (field) {
      gw.Debug.log('Setting initial focus to ' + field.id);
      if (field instanceof Ext.dom.Element) {
        field.focus()
      } else if (field instanceof Ext.form.CheckboxGroup) {
        field = field.items.get(0); //focus on the first input in the group
      } else {
        var selectText = field instanceof Ext.form.field.Text; // @SenchaUpgrade Is it an ExtJs bug that "selectText==true" will cause javascript exception for non-text-input?
        field.focus(selectText);
      }
    }
  }

  function _getFocusableField(field) {
    if (field instanceof Ext.form.FieldContainer) {
      var compFieldToFocus = null;
      field.items.each(function (f) {
        if (_isFieldFocusable(f) && !(f instanceof Ext.form.ComboBox)) { // do not default focus to a dropdown
          compFieldToFocus = f;
          return false; // stop iteration
        }
      });
      return compFieldToFocus
    }
    return field
  }

  /**
   * Show help info
   */
  function _helpWindow () {
    var helpText = 'Help Window: Alt-Shift-H<br>' +
                   'Info Page: Alt-Shift-I<br>' +
                   'Server Tools: Alt-Shift-T<br>' +
                   'Reload PCFs: Alt-Shift-L<br>' +
                   'Widget Page Info: Alt-Shift-W<br>' +
                   'Refresh Page: Alt-Shift-F<br>' +
                   'JavaScript Debug Info: Alt-Shift-G<br>' +
                   'Edit Page Config: Alt-Shift-E (Experimental)';
    Ext.Msg.alert('', helpText);
  }

  /**
   * Displays special frame in popup window
   * @param frameId frame id
   */
  function _showFrame(frameId) {
    return window.open(_serverURL + '?inFrame=' + frameId + '&r=' + Math.floor(Math.random() * 10000),
        frameId,
        'scrollbars=yes,width=525,height=330,dependent=yes,resizable=yes');
  }

  /**
   * An old workaround to disable IE default menu actions, because ExtJs stopEvent does not do so in IE
   * TODO: any better way?
   */
  function _disableIEMenuShortcut() {
    if (Ext.isIE) {
      var ch = 'abcdefghijklmnopqrstuvwxyz01234567890'.split('');
      var str = '';

      for (var i = 0; i < ch.length; i++) {
        str += '<span style="position:absolute">' +
              '<a accessKey="' + ch[i] +'" onBeforeActivate="this.last = document.activeElement" ' +
              'onFocus="var x = this.last; this.last = null; try {x.focus();} catch(e) {}" ' +
              'href="javascript:void(0)" tabIndex="-1"></a></span>'
      }

      Ext.DomHelper.insertFirst(Ext.getBody(), str);
    }
  }

  function _updateLocalizationInfo() {

      var parseCodes = {
        g:1,
        c:"if (/(" + _config.localeInfo.amPmSymbols[0] + ")/i.test(results[{0}])) {\n"
                + "if (!h || h == 12) { h = 0; }\n"
                + "} else { if (!h || h < 12) { h = (h || 0) + 12; }}",
        s:"(" + _config.localeInfo.amPmSymbols[0] + "|" +_config.localeInfo.amPmSymbols[1] + ")",
        calcAtEnd: true
      };

      //@SenchaUpgrade this needs to match the default parse function in Ext.Date
      var defaultParseFunction = {
        "MS": function(input, strict) {
          // note: the timezone offset is ignored since the MS Ajax server sends
          // a UTC milliseconds-since-Unix-epoch value (negative values are allowed)
          var r = (input || '').match(MSFormatRe);
          return r ? new Date(((r[1] || '') + r[2]) * 1) : null;
        },
        "time": function(input, strict) {
          var num = parseInt(input, 10);
          if (num || num === 0) {
            return new Date(num);
          }
          return null;
        },
        "timestamp": function(input, strict) {
          var num = parseInt(input, 10);
          if (num || num === 0) {
            return new Date(num * 1000);
          }
          return null;
        }
      };

      //@SenchaUpgrade this needs to match the default parse function in Ext.Date
      var defaultFormatFunctions = {
        "MS": function() {
          // UTC milliseconds since Unix epoch (MS-AJAX serialized date format (MRSF))
          return '\\/Date(' + this.getTime() + ')\\/';
        },
        "time": function(){
          return this.getTime().toString();
        },
        "timestamp": function(){
          return utilDate.format(this, 'U');
        }
      };

      Ext.Date.formatCodes.a = "(this.getHours() < 12 ? '" + _config.localeInfo.amPmSymbols[0] + "' : '" + _config.localeInfo.amPmSymbols[1] + "')";
      Ext.Date.formatCodes.A = "(this.getHours() < 12 ? '" + _config.localeInfo.amPmSymbols[0] + "' : '" + _config.localeInfo.amPmSymbols[1] + "')";
      Ext.Date.parseCodes.a = parseCodes;
      Ext.Date.parseCodes.A = parseCodes;

      Ext.Date.parseFunctions = defaultParseFunction;
      Ext.Date.formatFunctions = defaultFormatFunctions;

      Ext.Date.shortMonthName = _config.localeInfo.shortMonths;
      Ext.Date.shortDayName = _config.localeInfo.shortWeekDays;
      Ext.Date.narrowDayName = _config.localeInfo.narrowWeekDays;
      Ext.Date.narrowMonthName = _config.localeInfo.narrowMonths;

      Ext.Date.dayNumbers = {};
      Ext.Date.monthNumbers = {};

      Ext.Array.forEach(_config.localeInfo.dayNames, function(item, idx, arr){
        Ext.Date.dayNumbers[item] = idx;
      });
      Ext.Array.forEach(_config.localeInfo.monthNames, function(item, idx, arr){
        Ext.Date.monthNumbers[item] = idx;
      });
      Ext.Array.forEach(_config.localeInfo.shortMonths, function(item, idx, arr){
        Ext.Date.monthNumbers[item] = idx;
      });
      Ext.Array.forEach(_config.localeInfo.narrowMonths, function(item, idx, arr){
        Ext.Date.monthNumbers[item] = idx;
      });

    Ext.override(Ext.form.field.Base, {
      invalidText: _config.displayKeys["Java.Web.Validation.StepOff.InvalidValue"]
    });

    Ext.override(Ext.form.CheckboxGroup, {
      blankText: _config.displayKeys["Java.Web.Validation.StepOff.InvalidValue"]
    });
      Ext.override(Ext.PagingToolbar, {
        beforePageText: _config.displayKeys["ExtJS.Paging.BeforePageText"],
        afterPageText: _config.displayKeys["ExtJS.Paging.AfterPageText"],
        firstText: _config.displayKeys["ExtJS.Paging.FirstText"],
        prevText: _config.displayKeys["ExtJS.Paging.PrevText"],
        nextText: _config.displayKeys["ExtJS.Paging.NextText"],
        lastText: _config.displayKeys["ExtJS.Paging.LastText"],
        refreshText: _config.displayKeys["ExtJS.Paging.RefreshText"],
        displayMsg : _config.displayKeys["ExtJS.Paging.DisplayMsg"],
        emptyMsg : _config.displayKeys["ExtJS.Paging.Empty"]
      });

      Ext.override(Ext.grid.header.Container, {
        sortAscText: _config.displayKeys["ExtJS.Grid.Header.Container.SortAscText"],
        sortDescText: _config.displayKeys["ExtJS.Grid.Header.Container.SortDescText"],
        columnsText: _config.displayKeys["ExtJS.Grid.Header.Container.ColumnsText"]
      });

      Ext.override(Ext.grid.feature.Grouping, {
        emptyGroupText: _config.displayKeys["ExtJS.Grid.GroupingFeature.EmptyGroupText"],
        groupByText: _config.displayKeys["ExtJS.Grid.GroupingFeature.GroupByText"],
        showGroupsText: _config.displayKeys["ExtJS.Grid.GroupingFeature.ShowGroupsText"]
      });

      Ext.override(Ext.Date, {
          monthNames: _config.localeInfo.monthNames,
          dayNames: _config.localeInfo.dayNames,
          getShortDayName : function(day) {
              return Ext.Date.shortDayName[day];
          },
          getShortMonthName : function(month){
              return Ext.Date.shortMonthName[month];
          }
      });

      Ext.override(Ext.MessageBox.buttonText, {
          ok: _config.displayKeys["Button.OK"],
          cancel: _config.displayKeys["Button.Cancel"],
          yes: _config.displayKeys["Button.Yes"],
          no: _config.displayKeys["Button.No"]
      });

      //ExtJs Private
      Ext.override(Ext.picker.Month, {
          cancelText: _config.displayKeys["Button.Cancel"],
          okText: _config.displayKeys["Button.OK"]
      });

      Ext.override(Ext.picker.Date, {
          monthNames: _config.localeInfo.monthNames,
          dayNames: _config.localeInfo.dayNames,
          startDay: _config.localeInfo.firstDayOfWeek,
          ariaTitleDateFormat: _config.localeInfo.ariaTitleDateFormat,
          longDayFormat: _config.localeInfo.longDayFormat,
          ariaTitle : _config.displayKeys["ExtJS.Picker.Date.AriaTitle"],
          todayText : _config.displayKeys["Button.Today"],
          nextText : _config.displayKeys["ExtJS.Picker.Date.NextText"],
          prevText : _config.displayKeys["ExtJS.Picker.Date.PrevText"],
          monthYearText: _config.displayKeys["ExtJS.Picker.Date.MonthYearText"],
          monthYearFormat: _config.localeInfo.monthYearFormat,
          todayTip : _config.displayKeys["ExtJS.Picker.Date.TodayTip"],

          getDayInitial: function (day){
            return Ext.Date.narrowDayName[Ext.Date.dayNumbers[day]];
          }
      });

      Ext.override(Ext.form.field.Date, {
          startDay: _config.localeInfo.firstDayOfWeek
      });

      Ext.override(gw.ext.TimePickerField, {
        twelveHourMode: _config.localeInfo.twelveHourClock,
        amSymbol: _config.localeInfo.amPmSymbols[0],
        pmSymbol: _config.localeInfo.amPmSymbols[1]
      });

      Ext.override(gw.ext.DateTimePicker, {
        twelveHourMode: _config.localeInfo.twelveHourClock,
        amSymbol: _config.localeInfo.amPmSymbols[0],
        pmSymbol: _config.localeInfo.amPmSymbols[1]
      });
  }

  //
  // public methods:
  //
  return {
    updateConfig : function(config) {
        Ext.apply(_config, config);
        _updateLocalizationInfo();
    },

    getConfig : function() {
        return _config;
    },

    /**
     * Returns an array of keyCode for each letter in the string.
     * To workaround ExtJs bug that KeyMap only works with keyCode but not letters.
     * TODO: move to Util?
     */
    stringToKeyCodes : function(str) {
      var keyCodes = [];
      if (str != null) {
        str = str.toUpperCase();
        for (var i = 0; i < str.length; i ++) {
          keyCodes[i] = str.charCodeAt(i);
          // special handling:
          if (keyCodes[i] == 46 || keyCodes[i] == 62) { // . or >
            keyCodes[i] = 190;
          } else if (keyCodes[i] == 44 || keyCodes[i] == 60) { // , or <
            keyCodes[i] = 188;
          } else if (keyCodes[i] == 47 || keyCodes[i] == 63) {  // / or ?
            keyCodes[i] = 191;
          }
        }
      }
      return keyCodes;
    },

    /**
     * Records field focus
     * @param fieldId id of the field that has the focus (must not be null)
     */
    onFocus : function(fieldId) {
      if (fieldId) {
        _focusId = fieldId
      }
    },

    /**
     * Records field blur
     * TODO: (EXT) A workaround of EXT problem that sometimes blur of the old field happens after focus of the new field
     * @param fieldId id of field that has blurred
     */
    onBlur : function (fieldId) {
      if (fieldId == _focusId) {
        _focusId = null
      }
    },

    /**
     * Returns id of the last AJAX request. For testing purpose.
     */
    getTransId : function() {
      if (_lastReq) {
        return _lastReq.id; // @SenchaUpgrade "id" is not documented
      }
      return null;
    },

    getEventSourceCls : function() {
      return _EVENT_SOURCE_CLS
    },

    getPanelLoadingCls : function() {
      return _PANEL_LOADING_CLS
    },

    /**
     * Returns the localized string for a displaykey
     * @param displaykey
     * @param (optional) paramValue1, paramValue2 ... paramValueN
     */
    localize : function(displaykey) {
      var args = Ext.Array.clone(arguments);
      args[0] = _config.displayKeys[displaykey];
      return Ext.String.format.apply(String, args)
    },

    /**
     * Starts the page when launch the app
     * @param view layout info
     * @param config server config
     * @param commands commands to be executed after the page layout is initialized
     */
    initPage: function(view, config, commands) {
      window.errors = [];
      window.onerror = function(msg) {
        window.errors.push(msg);
      };

      _serverURL = config.url;
      _config = config;

      Ext.onReady(function() {
        _disableIEMenuShortcut();
        Ext.tip.QuickTipManager.init();

        _updateLocalizationInfo();

        // init state manager:
        try {
          var stateProvider = new Ext.state.LocalStorageProvider();
          Ext.state.Manager.setProvider(stateProvider);
        } catch (e) {
          // TODO: We need to confirm if we can drop IE7 support, or implement an alternative approach:
          alert("User preference will not be persistent after page refresh in this browser version.")
        }

        // create view port
        var viewport = Ext.ComponentManager.create(Ext.apply(view, { xtype:'gview' }));

        // register global click handler
        Ext.getBody().on({
          click:{ delegate:'.'+gw.app.getEventSourceCls(), stopEvent:true, fn:gw.app.onAction },
          mousedown:{scope:gw.app, fn:gw.app.onMouseDown}
        });

        // register global keyboard shortcuts:
        var keys = [
// If we regist ENTER key here, when a non-default button has focus, ENTER will not be invoked on that button.
// The problem does not happen, when the key map is registered by each widget. (Why??)
//          {key:Ext.EventObject.ENTER, shift:false, alt:false, fn:_handleEnterKey} // ENTER key
        ]
        if (_config.enableTools) {
          keys = keys.concat([
            {key:gw.app.stringToKeyCodes('h'), alt:true, shift:true, defaultEventAction:'stopEvent', fn:_helpWindow},
            {key:gw.app.stringToKeyCodes('i'), alt:true, shift:true, defaultEventAction:'stopEvent', fn:function(){_showFrame('locinfo')}},
            {key:gw.app.stringToKeyCodes('w'), alt:true, shift:true, defaultEventAction:'stopEvent', fn:function(){_showFrame('widget')}},
            {key:gw.app.stringToKeyCodes('l'), alt:true, shift:true, defaultEventAction:'stopEvent', fn:function(){_callServer('_reloadPCF_')} },
            {key:gw.app.stringToKeyCodes('f'), alt:true, shift:true, defaultEventAction:'stopEvent', fn:function(){ gw.app.refresh()} },
            {key:gw.app.stringToKeyCodes('e'), alt:true, shift:true, defaultEventAction:'stopEvent', fn:function(){_callServer('_editCurrentPage_')} },
            {key:gw.app.stringToKeyCodes('g'), alt:true, shift:true, defaultEventAction:'stopEvent', scope:gw.Debug, fn:gw.Debug.start }
          ]);
        }
        _keyMap = new Ext.util.KeyMap(Ext.getDoc(), keys)

        // process command after layout is generated
        if (commands) {
          _processCommands(commands)
        }

        _initFocus();
      });
    },

    /**
     * @return the tokenized string for JIC date input format (no time part)
     */
    getJICInputDateFormatTokenized: function() {
      return _config.jpCalendar.dateFormatTokenized;
    },

    /**
     * @return Regex to parse a JIC input date string (optional time part included)
     */
    getJICInputPatternRegex: function() {
      if (typeof _config.jpCalendar.datePatternRegex == typeof '') {
        _config.jpCalendar.datePatternRegex = eval(_config.jpCalendar.datePatternRegex);
      }
      return _config.jpCalendar.datePatternRegex;
    },

    /**
     * @return an array of valid era names
     */
    getJICEras: function() {
      if (_config.jpCalendar.eraNames[0] != '') {  // insert an empty value
        _config.jpCalendar.eraNames.splice(0,0,'');
      }
      return _config.jpCalendar.eraNames;
    },

    /**
     * @param era
     * @return (string array) an array of years in the give era
     */
    getJICYearsInEra: function(era) {
      if (era == '') {
        if (!_config.jpCalendar.eraDetails[era]) {
          _config.jpCalendar.eraDetails[era] = ['']; // insert key for empty era
        }
      }

      var eraDetails = _config.jpCalendar.eraDetails[era];
      if (typeof eraDetails[0] == typeof 0) { // initialize the years array
        var years = [''];
        for (var i = 1; i <= eraDetails[1]; i++) {
          years.push((i >= 10 ? '' : '0')+i);
        }
        eraDetails = _config.jpCalendar.eraDetails[era] = years;
      }

      return eraDetails;
    },

    getJICYearSymbol : function() {
      return _config.jpCalendar.yearSymbol || '';
    },

    getJICMonthSymbol : function() {
      return _config.jpCalendar.monthSymbol || '';
    },

    getJICDaySymbol : function() {
      return _config.jpCalendar.daySymbol || '';
    },

    refresh : function() {
      _callServer('_refresh_')
    },

    popupAboutWindow : function() {
      _showFrame('about', 'About.do');
    },

    clearBrowserState: function() {
      window.localStorage.clear(); // clear local storage
      window.location.reload(); // clear in memory state
    },

    onMouseDown :function(evt, htmlElem) {
      if (htmlElem && htmlElem.tagName != "INPUT" && Ext.get(htmlElem).down('input') == null) {
        gw.Debug.log("onMouseDown for " + htmlElem.id)
        _mouseDown = true;
        Ext.defer(function() {_mouseDown = false}, 10)
      }
    },

    /**
     * The global click handler to issue any event to the server
     * @param evt event
     * @param htmlElem element associated with the event, which may be the event target or its delegate
     */
    handleAction: function(evt, htmlElem, options) {
      if (!htmlElem.disabled) {
        Ext.menu.Manager.hideAll() // need to close menu when clicking the icon of a search menu item
        var eventSource;
        var eventParam;
        if (Ext.isString(htmlElem)) {
          eventSource = htmlElem
          eventParam = options ? options.param : null
        } else {
          var el = Ext.fly(htmlElem);
          if (_focusId == null) {
            _focusId = el.getAttribute('id'); // record action source as focused elem
          }
          eventSource = el.getAttribute('eventId') || el.getAttribute('id');
          eventParam = el.getAttribute('eventParam') || (options ? options.param : null);
        }
        _callServer(eventSource + '_act', eventParam, undefined, undefined, undefined, options);
      }
    },

    /**
     * The wrapper is for global onClick handler, extjs event sometime passes the 4th
     * parameter to the function. This wrapper prevents the event from passing the 4th optional parameter to gw
     * handleAction function.
     *
     * @param field
     * @param newValue
     * @param oldValue
     */
    onAction:function (event, elemOrId, options) {
      gw.app.handleAction(event, elemOrId, options);
    },

    /**
     * Handlers for action on an Ext component.
     * @param comp compoent or component config
     * @param evt event
     * @param el element (only needed when component config is specified)
     */
    // TODO: change naming for gw properties(noaction, downland, confirm and prompt)
    handleCompAction : function (comp, evt, el) {
      if (comp.noaction) {
        return false; // return false to not to close the menu
      }
      function doIt(param) {
        //Todo: extjs upgrade4 event fired added an extra argument - do not reuse event handler (?)
        var options = param != undefined ? {param:param} : undefined;
        if (comp.download == true) {
          options = Ext.apply(options || {}, {isUpload: true, form: 'history-form'} );
        }
        if (comp.postOnChangeTarget) {
          gw.app.requestViewRoot(comp.id, {updateData:true, postOnChangeTarget:comp.postOnChangeTarget});
        } else {
          gw.app.handleAction(evt, el && el.dom || comp.getEl().dom, options)
        }
      }

      if (comp.confirm) {
        gw.app.confirm('', comp.confirm, function(btn) {
          if (btn == 'yes' || btn == 'ok') {
            doIt()
          }
        })
      } else if (comp.prompt) {
        var promptProp = comp.prompt;
        Ext.Msg.prompt('', comp.prompt[0], function(btn, answer) {
          if (btn == 'yes' || btn == 'ok') {
            doIt(answer)
          }
        }, undefined, undefined, promptProp.length > 1 ? promptProp[1] : undefined);
      } else {
        doIt()
      }
    },

    /**
     * The wrapper around Handlers for action on an Ext component to prevent extjs event from passing the 4th optional
     * parameter to gw handleCompAction function.
     *
     * @param field
     * @param newValue
     * @param oldValue
     */
    onCompAction:function (comp, evt, el) {
      gw.app.handleCompAction(comp, evt, el);
    },

    /**
     * Called when a [Check Spelling] button is clicked
     */
    checkSpelling : function() {
      var fields = [];
      Ext.ComponentManager.each(function(id, comp) {
        if (comp.checkSpelling && !comp.disabled) {
          fields.push(comp.inputEl.dom)
        }
      });
      window.spellcheck_frame.checkSpelling(fields);
    },

    /**
     * The wrapper for global onchange handler, extjs change event sometime passes the 4th parameter to the function. This
     * wrapper will prevent the event from passing the 4th optional parameter to gw handleChange function.
     *
     * @param field
     * @param newValue
     * @param oldValue
     */
    onChange: function(field, newValue, oldValue) {
      gw.app.handleChange(field, newValue, oldValue);
    },

    deferChangeTillBlur: function(field) {
      field.gChangeOnBlur = true;
    },

    /**
     * The global onchange handler. The handling may be asynchronus, because it may open a confirm dialog
     * @param field the input field that is changed
     * @param newValue new value
     * @param oldValue old value
     * @param extraParams extra parameter to send back to server
     * @param callback callback after the value is changed
     */
    handleChange: function(field, newValue, oldValue, callback, extraParams) {
      // Do nothing, if a dialog is open to confirm the value change:
      if (Ext.Msg.isVisible() ||
           !field.skipConfirm && field.confirm && field.inEditor) { // do not process cell editor change that hasn't been confirmed
        return false;
      }

      gw.Debug.log("handleChange triggered for " + field.id)
      /**
       * handles onChange
       */
      function doIt() {
        if (_mouseDown) {// if the mouse is down, delay handling till mouse release

         function onMouseRelease(evt, elem, options) {
            if (options.called) {
              return; // this function may be called twice (by mouseUp and mouseOut), but we only want to execute it once
            }

            // defer handling onchange till after mouse release handler (which may
            // cause a page post and make onchange handler unecessary)
            gw.Debug.log("onMouseRelease deferring doIt for " + field.id);
            _delayedOnChange = Ext.defer(doIt, 10);

            options.called = true;
          }

          // register callback on mouse release
          var options = {fn: onMouseRelease, single:true}
          Ext.getBody().on({
            mouseup : options,
            mouseout : options
          })

          return
        }

        if (_config.checkSpellingOnChange == true && field.checkSpelling) {
          window.spellcheck_frame.checkSpelling(new Array(field.inputEl.dom));
        }

        // if field is in an editor, commit edit value:
        if (field.inEditor && field.editor) {  //todo: field.editor might not exist because we have don't handle editor for check and radio
          gw.GridUtil.commitGridEditorValue(field.editor);
        } else if (field.completeEdit) {
          field.completeEdit(newValue);
        }

        if (gw.app.isPostChangeToServer(field)) {
          // post change to server, if needed
          var targetId = field.postOnChangeTarget;
          if (targetId != null) {
            var params = {postOnChangeTarget:targetId};
            // extraParams include inputGroup checkBox value for first time expanding
            if (extraParams) {
              Ext.apply(params, extraParams);
            }
            // postedToServer is set to true if post to server is happening.
            gw.app.requestViewRoot(field.eventParam || field.name || field.checkboxName || field.id, params, Ext.fly(targetId),
                (callback) ? {postCallbackScope:field, postCallback:callback, postedToServer:true} : undefined)


          } else {
            _callServer('_refresh_',  field.eventParam || field.name || field.hiddenName || field.id, extraParams, true);
          }
        } else {
          if (callback) {
            // field level call back
            callback.call(field)
          }
          gw.reflection.reflect(field, true)
        }
      }

      if (field.confirm && !field.inEditor) { // show confirmation for inputs in DetailView (confirmation for cell is handled by editor)
        gw.app.confirm('', field.confirm, function(btn) {
          if (btn == 'yes' || btn == 'ok') {
            doIt()
          } else { // cancel change:
            if (field.inEditor) { // if the field is in an editor, cancel edit:
              if (field.editor.editing) {
                field.editor.cancelEdit(false);
              } else {
                //todo: using private variable context, need to ask Sencha for a way to expose context publicly
                field.editor.fireEvent('rollback', field.editor.editingPlugin.context);
              }
            } else { // revert to the old value
              var targetComp = field instanceof Ext.form.FieldSet ? field.checkboxCmp : field;
              targetComp.suspendEvents(false);
              targetComp.setValue(oldValue)
              targetComp.resumeEvents();
            }
          }
        })
      } else {
        doIt()
      }
    },

    /**
     *  Check to see if post change to server is needed for the field
     * @param field
     */
    isPostChangeToServer: function(field) {
      var fieldComp;
      return (field.postOnChange ||
              field.name && field.name != field.id &&
                      (fieldComp = Ext.ComponentManager.get(field.name)) && fieldComp.postOnChange)
    },

   /**
     * Sends request to view root widget directly
     * @param viewRootId id of the view root widget
     * @param params request parameters
     * @param auxConfig additional config for the request
     */
    requestViewRoot: function(viewRootId, params, maskElem, auxConfig, bChildrenOnly) {
      var requestParams = {};
      var postForm = false;
      if (params && (params.postOnChangeTarget || params.updateData)) {
        postForm = true;
      } else {
        requestParams.renderViewRootOnly = true;
      }
      var ajaxInfo = {viewRootId:viewRootId, childrenOnly:bChildrenOnly};
      if (params) {
        ajaxInfo.paramMap = params;
      }
      requestParams.ajaxRequestInfo = Ext.JSON.encode([ ajaxInfo ]);
      _callServer(null, null, requestParams, postForm, maskElem || Ext.fly(viewRootId), auxConfig)
    },

    showBusy : function() {
      _showBusy()
    },

    requestViewRoots : function(reqs, fcnCallback) {
      var requestParams = {};
       requestParams.renderViewRootOnly = true;
       requestParams.ajaxRequestInfo = Ext.JSON.encode(reqs)

      _callServer(null, null, requestParams, false, 'NO_MASK_ELEM', { callback : fcnCallback})
    },

    getAjaxQueueSize : function() {
      return _ajaxRequestQueue.length;
    },

    processCommand : function(op, requestOptions, response) {
      var isError = op.cmd == 'showErrors';
      if (isError) {
        Ext.each(op.errors, function(error) {
          if (_errors.indexOf(error) == -1) {
            _errors.push(error)
          }
        })
      } else {
        gw.cmdProc[op.cmd](op, response, requestOptions);
      }
      return isError
    },

    /**
     * Adapter to old JavaScript API used by Litigation Calendar
     */
    invokeEvent : function(eventSource, eventParam) {
      _callServer(eventSource, eventParam)
    },

    beforeUnloadHandler : function() {
      if (_bWarnUnsavedWork) {
        return this.localize('Java.UnsavedWork.UnloadApp')
      }
    },

    setWarnUnsavedWork : function(b) {
      _bWarnUnsavedWork = b;
    },

    toggleCalendarType : function(compId, calType) {
      var comp = Ext.ComponentManager.get(compId);
      this.requestViewRoot(compId, {toggleCalType:calType, value:comp.getRawValue()})
    },

    /** displays a confirmation dialog with OK/Cancel button */
    confirm : function(title, msg, fn, scope) {
      Ext.MessageBox.show({
        title : title,
        msg : msg,
        buttons: Ext.MessageBox.OKCANCEL,
        fn: fn,
        scope : scope,
        icon: this.QUESTION
      });
    },

    setServerRequestId : function(t) {
      _serverRequestId = t;
    },

    setTestActionComplete : function () {
      if(_reqMonData != null) {
        if(!_actionCompleteLogged) {
          var actionCompleteTime = new Date().getTime();
          _reqMonData = _reqMonData.substr(0, _reqMonData.length - 1) + ',' + actionCompleteTime + ']'
          _actionCompleteLogged = true
        }
      } else {
        gw.Debug.log('<span style="color:orange">Request data already submitted.  Unable to add ActionCompleteTime.</span>');
      }
    }
  }
}();
