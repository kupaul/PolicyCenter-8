/**
 * Handlers Document Management features.
 * Mostly copied over from the old DocumentUtil.js file.
 */
gw.DocumentUtil = (function() {
  var _ids = {
      applet: 'DocumentAssistant_' + Ext.id(),
      documentContentFrame: 'DocumentContentFrame_' + Ext.id(),
      // IE doesn't like hyphens in window names
      documentContentWindow: 'DocumentContentWindow_' + Ext.id().replace(/-/g,'_')
  };

  function removeDocumentAssistant() {
      var DA = Ext.get(_ids.applet);
      if (DA) {
          DA.remove();
          _ids.applet = 'DocumentAssistant_' + Ext.id();
      }
  }

  function processRawUploadResponse(banner, responseText) {
    var response = Ext.decode(responseText, true /*safe*/);
    if (!response) {
      showAlert(banner, responseText);
      return false;
    }
    return processUploadResponse(banner, response);
  }

  function processUploadResponse(banner, response) {
    if (response.errors && response.errors.length > 0) {
      for (var i = 0 ; i < response.errors.length ; i++) {
        showAlert(banner, response.errors[i]);
      }
    }
    if (response.refresh) {
      gw.app.refresh();
    }
    return response.success;
  }

  function parseXML(str) {
      if (Ext.isIE) {
          var XML = new ActiveXObject("Microsoft.XMLDOM");
          XML.loadXML(str);
          return XML;
      } else {
          return (new DOMParser()).parseFromString(str, "text/xml");
      }
  }

  // Initialization of the Document Assistant applet is performed on demand with first access
  function initializeDocumentAssistant() {
     var attributes = { 'id': _ids.applet,
                        'style':'visibility:hidden',
                        'width':0, 'height':0,
                        // Separate JVM is unfortunately necessary to avoid an apparent bug
                        // the Java Plugin has with relaunching an applet after it has been launched
                        // and discarded once, such as after a page refresh
                        'separate_jvm': true
                      } ;
    var parameters = { 'jnlp_href': gw.app.getConfig().DocumentAssistantJnlpURL };
    var minimumVersion = '1.7';

    // The Java Plugin as of this writing has a terrible bug where a malformed
    // JNLP will cause it to hang and thus the browser to hang. This complete hack
    // does some pre-sanity checking on the JNLP.
    var jnlpOk = false;
    try {
      Ext.Ajax.request({
        url: parameters.jnlp_href,
        async: false,
        disableCaching: false,
        success: function(response, opts) {
          var jnlpXML = parseXML(response.responseText);
          if (jnlpXML && jnlpXML.documentElement && jnlpXML.documentElement.nodeName == 'jnlp') {
            jnlpOk = true;
          }
        }
      });
    } catch(x) {
      // Ignore
    }

    if (!jnlpOk) {
        showAlert(gw.app.localize('Document.Assistant.Error.Banner'),
                  gw.app.localize('Document.Assistant.Error.JNLPConfiguration',  parameters.jnlp_href));
        return null;
    }
    var DA = gw.deployJava.runApplet(attributes, parameters, minimumVersion, Ext.getBody());
    if (DA == null) {
      showAlert(gw.app.localize('Document.Assistant.Error.Banner'),
                gw.app.localize('Document.Assistant.Error.JRE', minimumVersion, navigator.platform));
    }
    return DA;
  }

  function withDocumentAssistant(callback) {
    var DA = Ext.get(_ids.applet);

    // Test the Document Assistant to make sure it's responding
    // If not, try once to re-initialize it
    if (DA != null) {
      var dom = Ext.getDom(DA);
      var probeResponse;
      try {
        probeResponse = dom.probe();
      } catch(e) {
        // Ignore
      }
      if (probeResponse && probeResponse == "Guidewire Document Assistant") {
        callback(dom);
        return true;
      }
    }

    removeDocumentAssistant();
    DA = initializeDocumentAssistant();
    if (DA == null)
      return false;

    var dom = Ext.getDom(DA);
    try {
      dom.probe();
      callback(Ext.getDom(DA));
    } catch(e) {
      // Some browsers may not block when displaying a dialog asking
      // the user if they want to enable the Java plugin at all.
      // Also, the user may deny allowing the applet to run.
      // If either is the case, the initial load of the applet will not yet be ready
      showAlert(gw.app.localize('Document.Assistant.Error.Banner'),
                gw.app.localize('Document.Assistant.Error.Load'));
      return false;
    }
    return true;
  }

  function showAlert(messageBanner, messageText) {
    Ext.Msg.show({
      title: messageBanner,
      msg: messageText,
      buttons: Ext.Msg.OK,
      buttonText: {
        ok: gw.app.localize('Button.OK')
      },
      icon: Ext.Msg.ERROR,
      modal: true,
      closable: false
    });
  }

  Ext.define('gw.HiddenFile', {
    extend: 'Ext.form.Hidden',
    alias: 'widget.gHiddenFile',
    tabIndex : -1,
    initComponent : function() {
      if (this.onloadScript) {
        eval(this.onloadScript);
      }
      this.callParent(arguments);
    }
  });

  // This specialized version of action.Submit avoids
  // an issue the default one has with non-JSON responses
  Ext.define('gw.submit', {
    extend: 'Ext.form.action.Submit',
    alias: 'formaction.gw.submit',
    handleResponse: function(response) {
      var json = Ext.decode(response.responseText, true);
      if (!json) {
        json = {
          success: false,
          errors: [ response.responseText ]
        }
      }
      return json;
    }
  });

  Ext.define('gw.file', {
    extend: 'Ext.form.Panel',
    alias: 'widget.gfile',
    tabIndex: -1,
    border: false,
    layout: {
      type: 'table',
        // The total column count must be specified here
      columns: 3,
      tdAttrs: {
          style: {
              margin: '0 0 0 0',
              padding: '0 0 0 0'
          }
      }
    },
    initComponent : function() {
      if (this.onloadScript) {
        eval(this.onloadScript);
      }

      var form = this;
      Ext.apply(form, {
        items: [
          {
            xtype: 'hiddenfield',
            name: 'widgetId',
            value: form.id
          },
          {
            xtype: 'textfield',
            fieldLabel: form.fieldLabel,
            required: form.required,
            invalid: form.invalid,
            readOnly: true,
            submitValue: false,
            value: form.value,
            width: 350,
            padding: '0 5 0 0'
          },
          {
            xtype: 'filefield',
            name: 'fileContent',
            buttonOnly: true,
            buttonText: form.buttonText,
            listeners: {
              'change' : function() {
                 // Used instead of the standard form.submit()
                 // because of issues with non-JSON responses
                 form.getForm().doAction('gw.submit', {
                   url: gw.app.getConfig().FileUploadURL,
                   success: function(form, action) {
                     this.value = null;
                     processUploadResponse('', action.result);
                   },
                   failure: function(form, action) {
                     this.value = null;
                     processUploadResponse('', action.result);
                   }
                 });
              }
            }
          }
        ]
      });
      this.callParent(arguments);
    }
  });

  function sendContentsToDocumentControl(docResponse) {
    withDocumentAssistant(function(documentAssistant) {
      var fileLocation = docResponse["fileLocation"];

      // 'fileLocation' set means the Document Assistant  should be used
      // to check and display the file directly
      if (fileLocation != null) {
        gw.Debug.log("sendContentsToDocumentControl: documentAssistant " +
          documentAssistant == null + " fileLocation=" + fileLocation);
        try {
          documentAssistant.displayFile(fileLocation, true /* editMode */);
        } catch(e) {
          // Ignore any errors (handled by Document Assistant)
        }
      }
      // Otherwise, the Document Assistant should download script data
      // and invoke it with a temporary file created with the given file extension
      else {
        var script = docResponse["script"];
        var fileExt = docResponse["fileExt"];
        if (fileExt == null) {
          fileExt = '';
        }
        gw.Debug.log("sendContentsToDocumentControl with script: documentAssistant " +
          documentAssistant == null + " fileExt=" + fileExt);
        try {
          var tempFile = documentAssistant.createTempFile(fileExt);
          documentAssistant.createFileFromScript(script, tempFile);
        } catch(e) {
          // Ignore any errors (handled by Document Assistant)
        }
      }
    });
  }

  // The document contents are rendered to a dynamically
  // generated hidden IFRAME. This is necessary, as opposed
  // to a direct AJAX request, in order to trigger the
  // browser's builtin download mechanism.
  //
  // If alertDownloadFailure is set, after the hidden frame is loaded,
  // examine the response content to infer if a download failure occurred or not.
  // It is not possible, unfortunately, to directly examine the
  // HTTP response status code for an IFRAME source.
  function retrieveDocumentContent(url, targetHiddenFrame, alertDownloadFailure) {
    if (targetHiddenFrame) {
      var documentContentFrame = Ext.get(_ids.documentContentFrame);
      if (documentContentFrame != null) {
        documentContentFrame.remove();
      }

      var config = {
        tag: 'iframe',
        cls: 'x-hidden',
        id: _ids.documentContentFrame,
        name: _ids.documentContentFrame,
        src: url
      };

      if (alertDownloadFailure) {
        config['onload'] =
          "gw.DocumentUtil.processDocumentResponse('" + alertDownloadFailure + "',this)";
      }

      Ext.getBody().createChild(config);
    } else {
      window.open(url, _ids.documentContentWindow,
          "height=400,width=800,location=0,menubar=0,status=0,toolbar=0,resizable=1,directories=0,scrollbars=yes", true);
    }
  }

  // Examines the hidden iframe content (which on success will contain
  // the binary data of the document with its associated MIME type, triggering
  // a browser download) -- if it finds an HTML "title" element, this is assumed
  // to contain the text of a download failure error message (this is what
  // HttpServletResponse.sendError, used in BaseDocumentContentsHandler.java, does).
  function processDocumentResponse(alertDownloadFailure, el) {
    if (el && el.contentDocument && el.contentDocument.title) {
      showAlert('', alertDownloadFailure  + ":<br>" + el.contentDocument.title);
    }
  }

  function handleDisplayDocumentResponse(docResponse) {
    if (docResponse["errorMsg"]) {
      showAlert('', docResponse["errorMsg"]);
    } else {
      if (docResponse["script"]) {
        sendContentsToDocumentControl(docResponse);
      } else {
        var targetHiddenFrame = docResponse["targetHiddenFrame"];
        if (docResponse["url"]) {
          // alertDownloadFailure tells the JavaScript rendering code to look for HTML
          // content in the response indicating that the download failed.
          retrieveDocumentContent(docResponse["url"], targetHiddenFrame, docResponse["alertDownloadFailure"]);
        } else {
          //Default to display of contents itself
          var fileExt = docResponse["fileExt"];
          if (fileExt == null) {
            fileExt = '';
          }

          withDocumentAssistant(function(documentAssistant) {
            try {
              var filePath = documentAssistant.createTempFile(fileExt);
              var url = _baseDocUtilPath + "FileContents.do?widgetId=" + docResponse["widgetId"];
              if (docResponse["docId"]) {
                url = url + "&docId=" + docResponse["docId"];
              }
              var msg = "handleDisplayDocumentResponse documentAssistant " + documentAssistant +
                " url=" + url + " filePath=" + filePath;
              gw.Debug.log(msg);
              documentAssistant.loadContentIntoSpecifiedFile(url, filePath, false /* editMode */);
            } catch(e) {
              // Ignore -- Document Assistant will display any necessary alerts
            }
          });
        }
      }
    }
  }

  function sendContentsToDocumentControlAndCacheLocation(docResponse) {
    if (docResponse["errorMsg"]) {
      showAlert('', docResponse["errorMsg"]);
    } else {
      var script = docResponse["script"];
      var fileExt = docResponse["fileExt"];
      var widgetId = docResponse["widgetId"];
      var fromLink = docResponse["fromLink"];
      if (fileExt == null) {
        fileExt = '';
      }

      withDocumentAssistant(function(documentAssistant) {
        try {
          var filePath = documentAssistant.createTempFile(fileExt);

          if (script) {
            documentAssistant.createFileFromScript(script, filePath);
          } else {
            var url = _baseDocUtilPath + "FileContents.do?widgetId=" + docResponse["widgetId"];
            documentAssistant.loadContentIntoSpecifiedFile(url, filePath, true /* editMode */);
          }

          // Send the file location to the server for use in later edit local/upload operations
          // This is done as a separate AJAX request to avoid informing the server of the
          // of the cached location until the DA has successfully downloaded (and launched) the document
          sendAjaxRequest(widgetId, 'cacheDocumentLocation', {'fileLocation':filePath}, function(){});

          if (fromLink != null) {
            showActionLinks(widgetId, false /* viewMode */)
          }
        } catch(e) {
           // Ignore -- Document Assistant will display any necessary alerts
        }

      });
    }
  }

  function getLinkElement(widgetId) {
    return Ext.fly(widgetId).setVisibilityMode(Ext.Element.DISPLAY);
  }

  function showActionLinks(widgetId, viewMode) {
    var baseWidgetId = widgetId.replace(/_[^_]*Link$/, '');
    getLinkElement(baseWidgetId + '_ViewLink').setVisible(viewMode);
    getLinkElement(baseWidgetId + '_EditLink').setVisible(viewMode);
    getLinkElement(baseWidgetId + '_EditLocalLink').setVisible(!viewMode);
    getLinkElement(baseWidgetId + '_UpdateLink').setVisible(!viewMode);
    getLinkElement(baseWidgetId + '_DiscardLink').setVisible(!viewMode);
 }

  function uploadLocalDocument(docResponse) {
    var widgetId = docResponse["widgetId"];
    var fileLocation = docResponse["fileLocation"];
    var fromLink = docResponse["fromLink"];

    _documentOperationsSuspended = true;

    var rtn = withDocumentAssistant(function(documentAssistant) {
      try {
        var responseText = documentAssistant.uploadFileContents(fileLocation, 'fileContent',
            gw.app.getConfig().UploadDocumentContentURL, [ 'widgetId', widgetId ]);
        if (processRawUploadResponse(gw.app.localize('Document.Assistant.Error.Banner'), responseText)) {
          if (fromLink) {
            showActionLinks(widgetId, true /* viewMode */)
          }
        }
      } catch (e) {
        // Do nothing, Document Assistant will display any necessary alerts
      }
      _documentOperationsSuspended = false;
    });
    if (!rtn) {
      _documentOperationsSuspended = false;
    }
  }

  function cleanupFile(docResponse) {
    var fileLocation = docResponse["fileLocation"];
    var widgetId = docResponse["widgetId"];
    var fromLink = docResponse["fromLink"];

    var rtn = withDocumentAssistant(function(documentAssistant) {
      try {
        documentAssistant.cleanupFile(fileLocation);
      } catch(e) {
          // Ignore any errors on deletion, file will eventually get discarded
          // when Doc Assistant exits or manually
      }

      if (fromLink) {
          showActionLinks(widgetId, true /* viewMode */)
      }

      _documentOperationsSuspended = false;
    });
    if (!rtn) {
      _documentOperationsSuspended = false;
    }
  }

  function sendAjaxRequest (widgetId, action, param, callback) {
    gw.app.requestViewRoot(widgetId,
        Ext.apply(param || {}, {'widgetId':widgetId,'action':action}),
        Ext.getBody(),
        {docHandler:callback});
  }

  function getBaseDocUtilPath () {
    var result = location.protocol + "//" + location.host + location.pathname;
    result = result.substr(0, result.lastIndexOf('/') + 1);
    return result;
  }

  var _documentOperationsSuspended = false;
  var _baseDocUtilPath = getBaseDocUtilPath();

  return {
    withDocumentAssistant : withDocumentAssistant,
    showAlert : showAlert,
    processDocumentResponse : processDocumentResponse,

    sendScriptToDocumentControl : function(documentAssistant, controlID, script, tempFilePath) {
      gw.Debug.log("sendScriptToDocumentControl tempFilePath=" + tempFilePath);
      try {
        documentAssistant.createFileFromScript(script, tempFilePath);
      } catch(e) {
        // DA will report alerts on any errors
        return false;
      }
      return true;
    },

    uploadFile : function(documentAssistant, controlID, tempFilePath, commitCurrentLocation) {
      var url = gw.app.getConfig().FileUploadURL;
      gw.Debug.log("uploadFile url=" + url + "; tempFilePath=" + tempFilePath);
      try {
        var responseText = documentAssistant.uploadFileContents(tempFilePath, 'fileContent', url,
          [ 'widgetId', controlID, 'filePath', tempFilePath, 'commitCurrentLocation', commitCurrentLocation ] );
        return processRawUploadResponse(gw.app.localize('Document.Assistant.Error.Banner'), responseText);
      } catch(e) {
        // DA will display any alerts
         return false;
      }
    },

    displayFile : function(documentAssistant, tempFilePath) {
      gw.Debug.log("displayFile tempFilePath=" + tempFilePath);
      try {
        documentAssistant.displayFile(tempFilePath, false /* editMode */);
      } catch(e) {
        // DA will report alerts on any errors
        return false;
      }
      return true;
    },

    displayDocument : function(widgetId, docId) {
      sendAjaxRequest(widgetId, 'displayDocument', {'docId':docId ? docId : undefined}, handleDisplayDocumentResponse);
    },

    displayNewDocument : function(documentAssistant, url, filePath) {
      filePath = filePath.split("\\").join("\\\\"); //change \ to \\
      gw.Debug.log("displayNewDocument from URL:" + url);
      gw.Debug.log("displayNewDocument to file:" + filePath);
      try {
        documentAssistant.loadContentIntoSpecifiedFile(url, filePath, true /*editMode */);
      } catch(e) {
        // DA will report alerts on any errors
        return false;
      }
      return true;
    },

    docAction : function(opName, widgetId, fromLink) {
      if (_documentOperationsSuspended) {
        showAlert(gw.app.localize('Document.Assistant.Error.Banner'),
                  gw.app.localize('Document.Assistant.Error.OperationsSuspended'));
        return;
      }

      switch (opName) {
        case 'viewRepositoryVersion' :
          this.displayDocument(widgetId);
          return;

        case 'editRepositoryVersion' :
          sendAjaxRequest(widgetId, 'displayDocument', {fromLink:fromLink}, sendContentsToDocumentControlAndCacheLocation);
          return;

        case 'editLocalVersion' :
          sendAjaxRequest(widgetId, 'displayDownloadedDocument', null, sendContentsToDocumentControl);
          return;

        case 'uploadLocalVersion' :
          sendAjaxRequest(widgetId, 'uploadChangedDocument', {fromLink:fromLink}, uploadLocalDocument);
          return;

        case 'discardLocalVersion' :
          sendAjaxRequest(widgetId, 'clearCachedDocumentLocation', {fromLink:fromLink}, cleanupFile);
          return;

        default:
          showAlert(gw.app.localize('Document.Assistant.Error.Banner'), 'unsupported document action: ' + opName);
      }
    },

    /**
     * Handles response from server
     * @param cmdInfo command info
     * @param response server response
     * @param requestOptions 
     */
    handleResponse : function (cmdInfo, response, requestOptions) {
      if (requestOptions.docHandler) {
          requestOptions.docHandler(cmdInfo);
          return;
      }

      if (cmdInfo.docAction) {
          var opName = cmdInfo.docAction;
          switch(opName) {
              case 'cleanupFile' :
                  cleanupFile(cmdInfo);
                  return;
              default:
                showAlert(null, 'unsupported document action: ' + opName);
          }
      }
    },

    /**
     * Called by Document Assistant applet to proxy requests to server
     * for information to avoid browser bugs that do not pass HttpOnly cookies to applets
     *
     * Note that the HTTP request is made synchronously!
     *
     * @param serverInfoURL
     * @param URL parameters serialized as JSON
     * @return serialized JSON response
     */
    proxyServerInfoRequest : function(serverInfoURL, serializedParams) {
        gw.Debug.log("proxy server info request:" + serverInfoURL + " " + serializedParams);
        var jsonData;
        try {
            Ext.Ajax.request({
                url: serverInfoURL,
                params: Ext.decode(serializedParams, false),
                method: 'POST',
                async: false,
                scope: this,
                success: function(response, request) {
                  jsonData = response.responseText;
                },
                failure: function(response, request) {
                  jsonData = Ext.encode({ errorStatus: response.status, errorText: response.statusText });
                }
            });
        }
        // Outright connection failures throw an exception rather than invoking
        // the failure handler above. JavaScript exceptions are not handled well
        // by the Java-JavaScript bridge, so more robust to convert an exception
        // into a special JSON response with a negative error status
        catch(e) {
            jsonData = Ext.encode({ errorStatus: -1, errorText: e.message });
        }
        return jsonData;
    }
  }
})();

