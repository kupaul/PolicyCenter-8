Ext.define('Gw.override.Component', {
  override: 'Ext.Component',

  /**
   * Disables state persistence by default
   */
  stateful: false,

  initComponent: function () {
    var me = this;
    // @SenchaUpgrade cellCls is private; add extra td style class for table layout Component
    // have the logic here so gwTableCellCls can apply to all inputWidgets in table layout and also work in targeted POC.
    if (me.gwTableCellCls) {
      me.cellCls = (me.cellCls ?  me.cellCls + ' ' : '') + me.gwTableCellCls;
    }
    me.on({
      /**
       * Records field/button focus
       */
      focus: function (comp) {
        var id = comp.hiddenName || comp.id;
        gw.Debug.log('onFocus ' + id);
        gw.app.onFocus(id);
      },

      /**
       * Records field/button blur
       */
      blur: function (comp) {
        var id = comp.hiddenName || comp.id;
        gw.Debug.log('onBlur ' + id);
        gw.app.onBlur(id);
      }
    });

    me.callParent(arguments);
  },

  /**
   * Un-registers shortcut keys
   */
  removeKeyMaps: function () {
    var me = this;

    if (me.scKeyMap) {
      me.removeKeyMap(me.shortcut, me.scKeyMap);
    }
    if (me.enterKeyMap) {
      me.removeKeyMap('enter', me.enterKeyMap);
    }
  },
  /**
   * Processes keymap before rendering and adjust component
   * text if valid (button, menu items, etc).
   *
   * It's important to adjust text on before render to avoid
   * unnecessary layouts
   */
  beforeRender: function () {
    var me = this,
      shortcut = me.shortcut;

    if (!me.autoGenId && // @SenchaUpgrade Use a private ExtJS API to detect if this is an auto-generated overflow menuitem. Do not create shortcut for overflow menu to avoid conflict with the original button.
      (shortcut || me.isDefault)) {
      var matches, bShift, k;

      if (shortcut) {
        me.shortcut = shortcut = shortcut.toLowerCase();

        matches = shortcut.match(/(shift)*(.+)/i); // checks for "shift" prefix
        bShift = matches[1] ? true : false;
        k = gw.app.stringToKeyCodes(matches[2]);

        me.scKeyMapConfig = {
          defaultEventAction: 'stopEvent',
          key: k,
          shift: bShift,
          alt: true,
          scope: me,
          fn: me.onShortcutActivated
        };

        me.showShortcutInButonText(bShift, k);
      }

      if (me.isDefault) {
        me.enterKeyMapConfig = {
          key: Ext.EventObject.ENTER,
          scope: me,
          alt: false,
          shift: false,
          fn: me.onEnterShortcutActivated
        };
      }
    }

    me.callParent(arguments);
  },

  /**
   * Registers keymap during onRender to wait till all containing
   * components get rendered
   */
  afterRender: function () {
    var me = this;

    me.callParent(arguments);

    if (me.scKeyMapConfig || me.enterKeyMapConfig) {
      var shortcut = me.shortcut,
        scopeElem = me.shortcutScope ? Ext.ComponentManager.get(me.shortcutScope).getEl() : Ext.getDoc();

      if (me.scKeyMapConfig) {
        me.scKeyMap = me.addKeyMap(shortcut, scopeElem, me.scKeyMapConfig, me);
        delete me.scKeyMapConfig;
      }

      if (me.enterKeyMapConfig) {
        me.enterKeyMap = me.addKeyMap('enter', scopeElem, me.enterKeyMapConfig, me);
        delete me.enterKeyMapConfig;
      }
    }
  },

  /**
   * Inovokes keyMap clean up
   */
  onDestroy: function () {
    var me = this;
    if (Ext.AbstractComponent.layoutSuspendCount) { // wait till resume layout:
      Ext.on({
        resumelayouts: function () {
          me.removeKeyMaps();
        },
        single: true
      });
    } else { // do it now:
      me.removeKeyMaps();
    }

    me.callParent(arguments);
  },

  onShortcutActivated: function (key, evt) {
    var me = this;

    if (me.menu) {
      me.showMenu();
    }
    else if (me.xtype == 'quickjump') {
      me.focus();
    }
    else if (me instanceof Ext.button.Button) {
      if (!me.isDisabled()) {
        me.fireEvent('click', me, evt);
      }
    }
    else {
      gw.app.handleAction(null, me.id);
    }
  },

  onEnterShortcutActivated: function (key, evt) {
    var tagName = evt.getTarget().tagName;
    if (tagName == 'TEXTAREA' || tagName == 'BUTTON' || tagName == 'A') {
      return; // do not invoke default ENTER handler, if the target has its own action
    }
    gw.app.handleAction(null, this.id);
  },

  /**
   * Registers a shortcut key. This function detects duplicate keys registered on the same scope.
   * @param key the key
   * @param scopeEl the scope element (e.g., the document or the worksheet)
   * @param config key config
   * @param comp target component
   *
   * @return an ExtJs KeyMap object
   */
  addKeyMap: function (key, scopeEl, config, comp) {
    config.target = scopeEl;

    var old, oldComp, textChanged,
      keyMap = new Ext.util.KeyMap(config),
      allMaps = scopeEl.gKeyMaps || (scopeEl.gKeyMaps = {}),
      mapsPerKey = allMaps[key] || (allMaps[key] = []);

    if (mapsPerKey.length > 0) {
      old = mapsPerKey[mapsPerKey.length - 1];
      old.disable();

      // remove shortcut indicator from button text
      oldComp = old.comp;
      if (oldComp.origText !== oldComp.text) {
        textChanged = true;
        oldComp.setText(oldComp.origText);
      }
      gw.Debug.log('Ignored dup shortcut: ' + key + ' for ' + oldComp.id);
    }

    mapsPerKey.push(keyMap);
    keyMap.comp = comp;

    if (textChanged) {
      this.showShortcutInButonText(config.shift, config.key);
    }

    gw.Debug.log('Added shortcut: ' + key + ' for ' + comp.id);
    return keyMap;
  },

  /**
   * Unregisters a shortcut key. This function handles duplicate keys registered on the same scope.
   * @param key shortcut
   * @param keyMap an ExtJs KeyMap object
   */
  removeKeyMap: function (key, keyMap) {
    keyMap.disable();

    var el = keyMap.target,
      values = el.gKeyMaps[key];

    Ext.Array.remove(values, keyMap);

    if (values.length === 0) {
      delete el.gKeyMaps[key];
    }
    else {
      // restore shortcut indicator of the next button:
      var top = values[values.length - 1],
        topComp = top.comp;

      if (!topComp.isDestroyed && !topComp.destroying) {
        top.enable();
        if (topComp.fixedText && topComp.fixedText !== topComp.text) {
          topComp.setText(topComp.fixedText);
        }
      }
    }
  },

  /**
   * Underlines the shortcut key in the button text
   * @param comp button component
   * @param bShift Is shiftKey needed?
   * @param key shortcut key
   */
  showShortcutInButonText: function (bShift, key) {
    var me = this;

    // only init original text once
    me.origText = me.origText || me.text;

    // start with the original
    var text = me.origText;

    if (text) {

      // convert charCode array back to letter
      // special handling for < and >
      if (Ext.isArray(key) && key.length === 1) {
        key = key[0] === 190 ? '>' :
          key[0] === 188 ? '<' : String.fromCharCode(key[0]);
      }

      var css = (bShift && key !== '<' && key !== '>') ? 'g-double-underlined' : 'g-underlined';
      me.fixedText = text.replace(new RegExp('(' + key + ')', "i"), '<span class="' + css + '">$1</span>');
      me.setText(me.fixedText);
    }
  }
});