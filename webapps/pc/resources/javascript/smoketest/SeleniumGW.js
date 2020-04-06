/**
 * Adds additional commands to default Selenium API. This file needs to be included in the Selenium window.
 *
 * IMPORTANT - Because some default Selenium commands are asynchronous, the extended command implementation should
 *             not invoke the default commands to avoid ND problems.
 */

// override a style in selenium.css that causes rendering problems
var iframes = document.body.getElementsByTagName("iframe");
for(var i = 0; i < iframes.length; i++) {
  iframes[i].style.overflow = "visible";
  iframes[i].style.overflowX = "visible";
  iframes[i].style.overflowY = "visible";
}

Selenium.GW_DEFAULT_TIMEOUT = 120000; // 120 sec

/**
 * Replaces onBeforeUnload handler with Confirmation dialog, because Selenium does not yet handle onBeforeUnload.
 * This method is called after top-level frameset is loaded.
 */
Selenium.prototype.doFixTopLevelUnloadHandler = function() {
  var topWin = this.browserbot.getCurrentWindow();
  var frameset = topWin.document.getElementsByTagName("FRAMESET")[0];
  var handler = frameset.onbeforeunload;
  if (handler) {
    frameset.onbeforeunload = function(){var msg = handler(); if (msg) topWin.confirm.call(topWin, msg);};
  }
}

/**
 * Polls till alert presents or gw op done or time out
 */
Selenium.prototype.doWaitForAlertPresentOrGwOperationDone = function(bReturnPageName) {
  if (!SeleniumGW_isDialogOpen()) {
    LOG.debug('Start polling for GwOpDone');
    var func = bReturnPageName ? SeleniumGW_isGWOperationDoneExt : SeleniumGW_isGWOperationDone;
    return Selenium.decorateFunctionWithTimeout(fnBind(func, this), Selenium.GW_DEFAULT_TIMEOUT);
  }
};

Selenium.prototype.doRefreshGWPage = function() {
  this.browserbot.getCurrentWindow().Events.refresh();
  return this.doWaitForAlertPresentOrGwOperationDone();
}

/**
 * converts the "value" param into object, before calling #doSetValue()
 */
Selenium.prototype.doSetValues = function(locator, value) {
  return this.doSetValue(locator, eval(value));
}

/**
 * Sets value of an editable element (Input, Select, etc.).
 * This method fires real onChange event if value changes.
 */
Selenium.prototype.doSetValue = function(locator, value) {
  var element = this.page().findElement(locator);
  var eventWin = this.browserbot.getCurrentWindow();
  var bChanged = false;
  if(!document.all && element.type == "checkbox") {
    //Firefox will change the value by itself when the change event is fired
    var err = eventWin.Test.fireChangeEvent(element);
    if (err) {
      throw new SeleniumError(err);
    }
    bChanged = true;
  } else {
    var oldValue = eventWin.DHTML.setValue(element, value, /*bDoNotInvokeOnChange*/true);
    if (oldValue != eventWin.DHTML.getValue(element)) {
      var err = eventWin.Test.fireChangeEvent(element);
      if (err) {
        throw new SeleniumError(err);
      }
      bChanged = true;
    }
  }

  // check disabled state at last, because DHTML.setValue may change the state of the widget
  if (element.disabled) {
    throw new SeleniumError('Can not set value of a disabled element: ' + element.id);
  } else if (element.readOnly) {
    throw new SeleniumError('Can not set value of a readonly element: ' + element.id);
  }
  
  if (bChanged) {
    return this.doWaitForAlertPresentOrGwOperationDone();
  }
}

Selenium.prototype.doSelectOptionByLabel = function(locator, val) {
  var eventWin = this.browserbot.getCurrentWindow();
  var e = this.page().findElement(locator);
  var oldVal = eventWin.DHTML.getValue(e);
  if (e.type == 'select-one') {
    //verify value exists in the options:
    var found = -1;
    for (var i = 0; i < e.options.length; i++) {
      if (e.options[i].text == val) {
        found = i;
        break;
      }
    }

    if (found > -1) {
      e.value = e.options[found].value;
    } else if (val == '') {
      // add an empty option:
      e.options[e.length] = new Option('', '', false, true);
    } else {
      throw new SeleniumError('Invalid value for <SELECT>: ' + val);
    }
  } else {
    var vals = val.split(',');
    for (var i = 0; i < e.options.length; i++) {
      e.options[i].selected = false;
    }
    for (var i = 0; i < vals.length; i++) {
      var found = false;
      for (var j = 0; j < e.options.length; j++) {
        if (e.options[j].text == vals[i]) {
          e.options[j].selected = true;
          found = true;
        }
      }
      if (!found) {
        throw new SeleniumError('Invalid value for <SELECT>: ' + vals[i]);
      }
    }
  }
  if(oldVal != eventWin.DHTML.getValue(e)) {
    var err = eventWin.Test.fireChangeEvent(e);
    if (err) {
      throw new SeleniumError(err);
    }
    return this.doWaitForAlertPresentOrGwOperationDone();
  }
}

Selenium.prototype.doSelectGW = function(selectLocator, optionLocator) {
  this.doSelect(selectLocator, optionLocator);
  return this.doWaitForAlertPresentOrGwOperationDone();
}

Selenium.prototype.doClickGwAndGetPageName = function(locator) {
  return SeleniumGW_clickGw(locator, true);
}

Selenium.prototype.doClickGW = function(locator) {
  return SeleniumGW_clickGw(locator);
};

// register commands:
commandFactory.registerAll(selenium);


// -------------------------------------------------------------------------- private helpers:

function SeleniumGW_clickGw(locator, bReturnPageName) {
  var elem, bAnchor;
  try {
    elem = selenium.browserbot.findElement(locator);
    bAnchor = elem.tagName == 'A';
  } catch (e) {}

  // generate error when smokeTest clicks on a disabled action
  if (bReturnPageName &&
      elem && !selenium.browserbot.getCurrentWindow().Test.isClickable(elem)) {
    throw new SeleniumError('Click on ' +elem.tagName+ ' element "' +elem.id+ '" does nothing.');
  }

  selenium.doClick(locator);

  if (bAnchor) {
    // wait for clicking on an anchor, which is asynchronous
    selenium.waitForAnchor = true;
    setTimeout("selenium.waitForAnchor = false", 10);
  }
  return selenium.doWaitForAlertPresentOrGwOperationDone(bReturnPageName);
}

function SeleniumGW_isDialogOpen() {
  with (selenium) {
    return isAlertPresent() || isConfirmationPresent();
  }
}

function SeleniumGW_isGWOperationDoneExt() {
  return SeleniumGW_isGWOperationDone(true);
}

function SeleniumGW_isGWOperationDone(bReturnPageName) {
  var currWin = selenium.browserbot.getCurrentWindow();
  var result = !selenium.waitForAnchor && currWin.document.readyState == 'complete' && currWin.Events.isNavigationAllowed();
  currWin.gw.app.setTestActionComplete()
  if (result) {
    if (selenium.browserbot.getCurrentWindow().Test.hasExceptionOnPage()) {
      throw new SeleniumError ("Unexpected exception on page");
    }
    LOG.debug('GwOpDone. current location:' + currWin.location);
    if (bReturnPageName) {
      // a hack way to return the result page at the end of the action command
      throw new SeleniumError ("RESULT PAGE: " + selenium.browserbot.getCurrentWindow().Test.getPageName());
    }
  }
  return result;
}
