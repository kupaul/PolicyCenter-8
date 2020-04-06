/**
 * Util class for common ExtJs operations. This file needs to be included before other ExtJs files.
 */
gw.ext.Util = function() {
  function eachDescendentRec(id, fn, depth) {
    if (id) {
      if (!fn(id, depth)) {
        return false;
      }

      if (id.children) {
        for (var i = 0; i < id.children.length; i++) {
          var child = id.children[i];
          if (!eachDescendentRec(child, fn, depth + 1)) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * check whether the menuitems are loaded to the menu yet.
   * ExtJs sometimes still renders the items as containers even the menuitem is not loaded to the menu.
   *
   * @param owner
   * @return {Boolean}
   */
  function hasMenuItem(owner) {
    var hasMenuItem = false;
    Ext.each(owner.menu.items.items, function (item) {
      if (item.xtype == 'gmenuitem' || item.xtype == 'menu') {
        hasMenuItem = true;
        return false;
      }
    });
    return hasMenuItem;
  }

  return {
    getTabBarLinksId : function() {
      return ':tblinks';
    },

    getTabsId : function() {
      return ':tabs';
    },

    getInfoBarId : function() {
      return 'infoBar';
    },

    /**
     * appends an item and child items under its menu to the array
     * @param item item with menu
     * @param to an array
     */
    appendAndFlattenMenu : function(item, to) {
      to.push(item)
      if (item.menu) {
        var subMenu = Ext.isArray(item.menu) ? item.menu : item.menu.items;
        if (subMenu) {
          Ext.each(subMenu, function(sub) {
            to.push(sub)
          })
          delete item.menu
          item.menu = undefined

          // apply header style to "componentCls", to avoid overriding default "cls" at Class level which indicates server action
          if (item.componentCls) {
            item.componentCls += ' g-menu-header'
          } else {
            item.componentCls = 'g-menu-header'
          }
          if (item.noaction) {
            item.canActivate = false; // do not active an item that does not have submenu or server action
          }
        }
      }
    },

    /**
     * fetches menu content when expanding for the first time
     * @param owner owner of the menu
     */
    createAndShowOnDemandMenuIfNeeded : function(owner) {
      // if there is any item has xtype=='gmenuitem', it means menuItems are already loaded.
      if (!(owner.ondemandmenu && owner.menu &&
        (owner.menu.items == null || owner.menu.items.length == 0 || !hasMenuItem(owner) ))) {
        return; // no ondemand menu
      }

      var menu = owner.menu;
      if (menu.el && menu.el.hasCls(gw.app.getPanelLoadingCls()) ||
        menu.cls && menu.cls.indexOf(gw.app.getPanelLoadingCls()) >= 0) {
        return;
      }
      // Add a container, this is used for menupanel,
      // it's essentially removed in other cases because
      // we reconstruct the menu.
      menu.add({xtype:'container'})
      var p = menu.items.get(0)
      p.addCls(gw.app.getPanelLoadingCls())

      // AHK - 1/31/2013 - Once an on-demand menu has been opened, we need to invalidate the checksum so that
      // it will be re-rendered on future requests.  Otherwise, the menu items will be cached client-side, even
      // if they should be changed
      owner.checksum = 'checksumInvalidated';
      gw.app.requestViewRoot(owner.id, undefined, undefined, {callback:function(options, success, response) {
        p.removeCls(gw.app.getPanelLoadingCls())
        var props = Ext.decode(response.responseText)
        if (owner.deferHideMenu) {
          owner.deferHideMenu(); // hide the fake sub menu, before override it with real content
        }

        // Need to construct the menu because the initComponent
        // logic in the menu override determines the layout.
        owner.menu = Ext.applyIf(Ext.menu.MenuMgr.get(menu.cloneConfig({
          items : props.items || [{text:'(Empty)', disabled:true}] //TODO: localize
        })), {openerId: owner.menu.openerId});

        var opener = owner.menuOpener || owner;

        if (opener.showMenu) {
          if (owner.menuOpener && owner.menuOpener.cmp) {
            // this menu created by helperitem, so call with the right scope
            opener.showMenu.call(owner.menuOpener.cmp);
          } else {
            opener.showMenu();
          }
        } else if (owner.expandMenu) {
          owner.expandMenu(0);
        }
      }}, /*bChildrenOnly*/true)
    },
    /**
     * Get the field value in the display format.
     * This function gets called for UI string display and client reflection.
     * @param comp extjs component
     */
    getFieldValue : function(comp) {
      // TODO PL-18534: It seems that the client display format is also the posted server format (though not
      // by calling this function). For instance, the submitted date is 11/23/2011 for 23 Nov 2011.
      // The server should communicate in a canonical data format, for instance the ISO 8601 date format would be
      // a sensible choice for canonical date formats: 2011-11-23
      var value = comp.getValue();
      if (value) {
        if (comp instanceof Ext.form.CheckboxGroup) {
          value = comp.id in value ? value[comp.id] : ''; // unbox
//        if (comp.xtype == 'radiogroup') { // radio group
//          value = value.inputValue // unbox
//        } else if (comp.xtype == 'checkboxgroup') { // checkbox group
//          for (var i = 0; i < value.length; i ++) {
//            value[i] = value[i].inputValue // unbox
//          }
        } else if (value instanceof Date) {
          value = comp.getRawValue(); // to avoid date being formatted using browser's default format
        } else if (comp.xtype == 'multiselect' || comp.toMultiselect) { // shuttle
          if (Ext.isString(value)) {
            value = Ext.JSON.decode(value);
          }
        }
      }
      return value === null ? '' : value;
    },

    /**
     * Decode the value from string to object
     * @param value
     * @returns decoded value as an object
     */
    decodeValue : function(value) {
      if(value && Ext.isString(value)) {
        value = Ext.JSON.decode(value)
      }
      return value;
    },

    /**
     * Replaces content of a component.  The callers of this method are responsible for wrapping calls to this
     * method with suspendLayouts()/resumeLayouts() appropriately
     * @param comp component
     * @param props new properties of the component
     */
    replaceItems : function(comp, props) {
      // Replace all items.
      var removedComponents = comp.removeAll();

      // If there are items to add, add them
      if (props.items) {
        comp.add(props.items);
      }

      // Then update other properties
      gw.ext.Util.updateProp(comp, props);
    },

    /**
     * Updates component properties and force layout
     * @param comp component
     * @param props properties
     */
    updateProp : function(comp, props) {
      // Process non-children attributes which may depend on new child items:
      if (comp.updateProps) {
        comp.updateProps(props) // the comp wishes to process all props in a certain order
      } else {
        Ext.iterate(props, function(key, value) {
          if (key != "items") {
            // capitalize the first char, but retain case of rest of the string:
            var setter = comp['set' + key.charAt(0).toUpperCase() + key.substr(1)];
            if (Ext.isFunction(setter)) {
              setter.apply(comp, [value])
            }
          }
        })
      }

      if (!comp.isVisible()) {
        comp.show();
        if (comp.height && comp.height != comp.getHeight()) {
          comp.setHeight(comp.height)
        }
      }
    },

    /**
     * Walk each descendent (child and grand children) of the given element
     * @param {String/Element/HTMLElement} id locator string id, element or dom node.
     * @param {Function} fn function to call: fn(dom, depth): boolean. Return false to
     * stop iteration, true to keep iterating
     * @param {HTMLElement} fn.dom is the currently visited dom node
     * @param {Integer} depth the current depth to root node
     */
    eachDescendent: function(id, fn) {
      if (!fn) {
        return;
      }

      if (Ext.isString(id)) {
        id = Ext.ComponentManager.get(id);
      }
      if (id && id.el) {
        id = id.el;
      }
      if (id && id.dom) {
        id = id.dom;
      }

      if (id) {
        eachDescendentRec(id, fn, 0);
      }
    },

    /**
     * Clears all gw- style classes from the given element
     * @param {Element/HTMLElement} element
     */
    clearStyleClasses: function(element) {
      if (element && element.el) {
        element = element.el;
      }
      if (element && element.dom) {
        var styles = element.dom.className;
        if (styles) {
          styles = styles.split(" ");
        }
        for (var i = 0; i < styles.length; i++) {
          var style = styles[i];
          if (style.indexOf("gw-") == 0) {
            element.removeCls(style);
          }
        }
      }
    },

    /**
     * Clear all gw- style classes from the given element and its descendents
     * @param {Element/HTMLElement} element
     */
    clearDescendentStyleClasses: function(element) {
      var self = this;
      this.eachDescendent(element, function(descendent, depth) {
        descendent = Ext.Element.get(descendent);
        self.clearStyleClasses(descendent);
        return true;
      });
    },

    getValueByIds : function(ids) {
      var values = []
      Ext.each(ids, function(id) {
        var comp = Ext.ComponentManager.get(id)
        values.push(gw.ext.Util.getFieldValue(comp))
      })
      return values
    },

    /**
     * Sets the value for the component, and fires change event if value changes
     * @param {Ext.Component} comp the component to set the value to
     * @param {Object/String} value the simple display value or complex value object to set.
     * The simple value should be available as value.value
     */
    setValue : function(comp, value) {
      var complexValue = value;
      if (value && value.value != undefined) {
        value = value.value;
      }

      if (comp.toField) { // shuttle
        // remove all selected items:
        var toList = comp.toField.boundList;
        var fromList = comp.fromField.boundList;

        toList.getSelectionModel().selectAll();
        comp.onRemoveBtnClick();
        // items removed from toList still remained selected in fromList. so need to deselect from fromList
        fromList.getSelectionModel().deselectAll();
        // add new values:
        var indexes = [];
        for (var i = 0; i < value.length; i ++) {
          indexes.push(fromList.getStore().find(comp.valueField, value[i]));
        }
        for (var i = 0; i < indexes.length; i ++) {
          fromList.getSelectionModel().select(indexes[i], true, true);
        }
        comp.onAddBtnClick();

      } else {
        // Change the component style if any. Clear any gw- styles that have been set
        if (comp instanceof Ext.form.field.Display && comp.inputEl) {
          // Clear also all styles from the full form field, not just the input element
          this.clearDescendentStyleClasses(comp);
          if (complexValue && complexValue.cls) {
            comp.inputEl.addCls(complexValue.cls);
          }
        }

        // Update editValue if it has already been set.
        // editValue represents the modal value (smoke test value).
        // All other fields like text, value, rawValue are variations on the display value (smoke test display text)
        if (comp.editValue != null) {
          comp.editValue = value;
        }

        if (comp instanceof Ext.form.field.Date && Ext.isString(value) && comp.valueToRaw(value) != value) {
          comp.setRawValue(value); // bypass validation to allow invalid user value
        } else if (comp instanceof Ext.form.RadioGroup && Ext.isString(value)) { //RadioGroup setValue is expecting an object in 'id:value' form
          var radioValue = {};
          radioValue[comp.id] = value;
          comp.setValue(radioValue);
        } else {
          comp.setValue(value); // fires change event
        }
      }
    },

    /**
     * Get or create a dependent field menu given the menu's owner component's id. If there is no menu
     * for the matching menu, one is created from the given menu configuration
     * @param {String} openerId the menu owner's id
     * @param {Object} menuCfg the menu configuration object
     * @return {Ext.menu.Menu} existing or newly created Ext.menu.Menu component
     */
    getOrCreateFieldMenu: function(openerId, menuCfg) {
      var menuId = openerId + "-fieldMenu";
      var menu = Ext.ComponentManager.get(menuId);

      if (!menu) {
        menuCfg.id = menuId;
        menu = new Ext.menu.Menu(menuCfg);
      }

      return menu;
    },

    /**
     * Updates store data and options
     * TODO: ExtJs upgrade4: This method mimics the onProxyLoad() method of the store.
     * @param store store
     * @param value data
     * @param operation [optional] the data operation
     */
    updateStore : function (store, value, operation) {
      var cmp = Ext.ComponentManager.get(store.storeId);

      // apply options from server
      if (!store.lastOptions) {
        store.lastOptions = {params:{}}
      }
      Ext.apply(store.lastOptions.params, value.options)

      // load data and retain options
      if (store.root && !value[store.root]) {
        value[store.root] = []
      }

      //todo: extjs upgrade4 passing in value, double check for issues
      var r = store.getProxy().getReader().readRecords(value)
      // @SenchaUpgrade force sync up sort state from server before load records (in case sort changed by server):
      if (store.remoteSort && value.options && value.options.sort) {
        var oldSorters = store.sorters;
        store.sorters = new Ext.util.MixedCollection();
        Ext.Array.each(value.options.sort, function(sort) {
          // if an altProperty exists in the old sorters, use it to override the property:
          if (sort.altProperty) {
            if (store.sorters) {
              oldSorters.each(function(oldSort) {
                if (oldSort.property == sort.altProperty) {
                  sort.property = sort.altProperty;
                  return false;
                }
              });
            }
            delete sort.altProperty;
          }

          store.sorters.add(new Ext.util.Sorter(sort));
        });
      }

      var bTreeStore = store.fillNode != null; // Is this a TreeStore?

      if (bTreeStore) {
        var treePanel = Ext.ComponentManager.get(store.storeId);
        var node = operation ? operation.node : treePanel.getRootNode();
        if (store.clearOnLoad) { // entire tree loaded from the server:
          node.removeAll();
        }
        node.set('loading', false);
        r.records = store.fillNode(node, r.records)
        store.fireEvent('read', store, node, r.records, true);
        store.fireEvent('load', store, node, r.records, true);
        if (!operation) {
          // clear client toggle state when entire RowTree is updated from server.
          // perform this after firing events.
          treePanel.clearFoldersToggled();
        }
      } else {
        // TODO: Redesign: Card 371: Summary data
        // todo: extjs upgrade4 transforming summary data from old JSON structure to new
        // todo: extjs upgrade4 enable summary column such as no group totals

        if (store.proxy.reader.rawData && store.proxy.reader.rawData.summaryData) {
          var sumData = store.proxy.reader.rawData.summaryData;
          var fakeFld = ':grp';
          var newSummaryData = [];
          for (var grpItem in sumData) {
            var summary = {};
            if(grpItem === 'gSummaryType'){
              newSummaryData[grpItem] = sumData[grpItem];
            } else {
              summary[fakeFld] = grpItem;
              for (var columnName in sumData[grpItem]) {
               var s = sumData[grpItem][columnName];
               var summaryText = gw.GridUtil.formatSummaryData(s);
                var summaryValue = {};
                summaryValue.text = summaryText;
                if (s.align) {
                 summaryValue.align = s.align;
               }
                summary[columnName] = summaryValue;
             }
            }
            newSummaryData.push(summary);
          }
          store.proxy.reader.rawData.summaryData = newSummaryData;
          store.proxy.reader.rawData.origSummaryData = sumData;
        }

        // PL-23558 When there is no summary data, do not show footer
        if (cmp && cmp.xtype == 'simplegrid') {
          var summaryFeature = cmp.getSummaryFeature();
          if (summaryFeature !== undefined) {
            summaryFeature.showSummaryRow = (r.total > 0);
          }
        }

        store.totalCount = r.total
        store.loadRecords(r.records, store.lastOptions, true);
        store.loading = false;
        store.fireEvent('load', store, r.records, true);
        store.fireEvent('read', store, r.records, true);
      }

      // additional handling after loading data from the server:
      if (operation) {
        // since updateStore mimics OnProxyLoad method it should be updated as well.
        // in Ext JS 4.2.2 they moved part of the logic into internalCallback function and added call to it in onProxyLoad
        if (operation.internalCallback)
          Ext.callback(operation.internalCallback, operation.scope || store, [r.records, operation, true]);
        if (operation.callback)
          Ext.callback(operation.callback, operation.scope || store, [r.records, operation, true]);
      }
    },

    /**
     * Properties to extend Ext stores
     */
    getStoreExtension : function() {
      return {
        autoDestroy:true,
        remoteSort:true, // sort at server side
        pruneModifiedRecords:true, // do not remember modified records after load from server
//          proxy: Ext.create('gw.ext.ModelProxy', {url:'dummy2'}),
        //Todo: extjs upgrade4 proxy moved to constructor from config
        constructor: function(config) {
          this.callParent([Ext.apply(config, {
            proxy: Ext.create('gw.ext.ModelProxy', {
              url:'dummy2',
              reader:{
                root: 'root'
              }
            })
          })]);
        },

        /**
         * Registers the store using the model id, and make sure to pass model id when requesting data from server
         * @param id store id
         * @param argIds ids of other widgets, the value of which needs to be passed to server when fetching store data
         */
        setModelId : function(id, argIds) {
          this.storeId = id
          Ext.data.StoreManager.register(this)
          //Todo: extjs upgrade4 convert setBaseParam to Proxy
          //this.setBaseParam('viewRootId', id)
          this.proxy.extraParams = {'viewRootId': id};

          if (argIds) {
            Ext.apply(this.proxy.extraParams, {'argIds': argIds});
          }
        }
      }
    },

    getFlaggedProperty : function() {
      return ':flagged'
    },

    getAltValueClass : function() {
      return 'altVal'
    },

    getPrivacyFieldMenuItems : function() {
      return [
        gw.app.localize('Button.Delete'),
        gw.app.localize('Button.EnterNew')
      ]
    },

    /**
     * Calculate the width of the element
     * @param element element to get the width
     */
    getElementWidth:function (element) {
      if (element.dom.nodeName !== "IMG") {
        return Ext.util.TextMetrics.measure(element, element.dom.innerHTML).width + 5;
      } else {
        // image, return the default image size if width is not defined
        return (element.dom.width && element.dom.width > 0) ? element.dom.width : gw.ext.Util.getDefaultImageSize();
      }
    },

    /**
     * @Return the default size for image which is rendered next to the value widget
     */
    getDefaultImageSize:function () {
      return 30;
    },

    /**
     * @Return the label width set by the display key
     */
    getLabelWidth:function () {
      var labelWidth = 150;
      var width = parseInt(gw.app.localize("ExtJS.Form.LabelWidth"));

      if (Ext.isNumber(width)) {
        labelWidth = width;
      }

      return labelWidth;
    },


    /**
     * Toggles the availability of the field
     */
    setDisabled:function (field, disabled) {
      if (field instanceof Ext.form.Field) {
        field.setDisabled(disabled)
      } else {
        field.disabled = disabled
      }

      // show or hide helper icons:
      if (field.item && field.item.el) {
        // Use "visibility" instead of "display", so that it will not shift the page layout:
        field.item.el.setVisible(!disabled);
      }
    },

    /**
     * Gets the inner text for an element. Works for IE and Firefox
     */
    getInnerText:function (e) {
      return Ext.String.trim(e.innerText != undefined ? e.innerText : e.textContent);
    },

    /**
     * Get the outer HTML for the given element. This works around the missing field outerHTML in Firefox.
     * @param {HTMLElement} e HTML element
     * @return {String} outer HTML representation of element
     *
     */
    getOuterHTML:function (e) {
      if (e.outerHTML) {
        return e.outerHTML;
      }
      if (e.parentNode) {
        return e.parentNode.innerHTML;
      }
      // Rarely is the outer most element asked for, so sending back "<ROOT>" in this case.
      // One could construct a temporary outer div and add e as child, however this is rarely needed.
      return "<ROOT>...</ROOT>";
    },

    renderBarInput:function (value) {
      var tpl = new Ext.XTemplate(
        '<div>',
          '<div class="gbarinput-wrap" id="{id}" title="{title}">',
          '<tpl if="styleoverride">',
            '<div class="{styleclass}" style="{styleoverride}; height:100%;"></div>',
          '<tpl else>',
            '<div class="{styleclass}" style="width:0%; height:100%;"></div>',
          '</tpl>',
        '</div>',
          '<tpl if="status">',
            '<div style="display:inline;">{status}</div>',
          '</tpl>',
        '</div>');

      return tpl.apply(value);
    },

    getLabelableRenderTpl: function() {
        return [
            // body row. If a heighted Field (eg TextArea, HtmlEditor, this must greedily consume height.
            '<tr id="{id}-inputRow" <tpl if="inFormLayout">id="{id}"</tpl>>',

                // Label cell
                '<tpl if="labelOnLeft">',
                    '<td id="{id}-labelCell" style="{labelCellStyle}" {labelCellAttrs}>',
                        '{beforeLabelTpl}',
                        '<label id="{id}-labelEl" {labelAttrTpl}<tpl if="inputId"> for="{inputId}"</tpl> class="{labelCls}"',
                            '<tpl if="labelStyle"> style="{labelStyle}"</tpl>',
                            // Required for Opera
                            ' unselectable="on"',
                        '>',
                            '{beforeLabelTextTpl}',
                            '<tpl if="fieldLabel">{fieldLabel}{labelSeparator}</tpl>',
                            '{afterLabelTextTpl}',
                        '</label>',
                        '{afterLabelTpl}',
                    '</td>',
                '</tpl>',

                // Body of the input. That will be an input element, or, from a TriggerField, a table containing an input cell and trigger cell(s)
                '<td class="{baseBodyCls} {fieldBodyCls}" id="{id}-bodyEl" colspan="{bodyColspan}" role="presentation">',
                    '{beforeBodyEl}',

                    // Label just sits on top of the input field if labelAlign === 'top'
                    '<tpl if="labelAlign==\'top\'">',
                        '{beforeLabelTpl}',
                        '<div id="{id}-labelCell" style="{labelCellStyle}">',
                            '<label id="{id}-labelEl" {labelAttrTpl}<tpl if="inputId"> for="{inputId}"</tpl> class="{labelCls}"',
                                '<tpl if="labelStyle"> style="{labelStyle}"</tpl>',
                                // Required for Opera
                                ' unselectable="on"',
                            '>',
                                '{beforeLabelTextTpl}',
                                '<tpl if="fieldLabel">{fieldLabel}{labelSeparator}</tpl>',
                                '{afterLabelTextTpl}',
                            '</label>',
                        '</div>',
                        '{afterLabelTpl}',
                    '</tpl>',

                    //  Begin Override
                    //  Overrode following 3 lines by wrapping them on a table to create prefix/suffix
                    // '{beforeSubTpl}',
                    // '{[values.$comp.getSubTplMarkup(values)]}',
                    // '{afterSubTpl}',

                    '<table id="{id}-inputWrap" class="' + Ext.baseCSSPrefix + 'form-input-wrap" cellpadding="0" cellspacing="0"><tbody><tr>',
                    '<td class="g-before-input-cell">{beforeSubTpl}</td>',
                    '<td class="x-input-cell">{[values.$comp.getSubTplMarkup(values)]}</td>',
                    '<td class="g-after-input-cell">{afterSubTpl}</td></tr>',
                    '<tpl if="altVal"><tr><td></td><td colspan="2"><span class="g-form-altVal" id="{altId}" value="{altVal.value}">{altVal.text}</span></td></tr></tpl>',
                    '</tbody></table>',
                    // End Override

                // Final TD. It's a side error element unless there's a floating external one
                '<tpl if="msgTarget===\'side\'">',
                    '{afterBodyEl}',
                    '</td>',
                    '<td id="{id}-sideErrorCell" vAlign="{[values.labelAlign===\'top\' && !values.hideLabel ? \'bottom\' : \'middle\']}" style="{[values.autoFitErrors ? \'display:none\' : \'\']}" width="{errorIconWidth}">',
                        '<div id="{id}-errorEl" class="{errorMsgCls}" style="display:none"></div>',
                    '</td>',
                '<tpl elseif="msgTarget==\'under\'">',
                    '<div id="{id}-errorEl" class="{errorMsgClass}" colspan="2" style="display:none"></div>',
                    '{afterBodyEl}',
                    '</td>',
                '</tpl>',

            '</tr>',
            {
                disableFormats: true
            }
      ]
      },

    appendCls: function(clsList, cls) {
      var classes = [];

      if (clsList.length > 0) {
        clsList = clsList.trim();
        classes = clsList.split(' ');
      }

      classes.push(cls);
      return (classes.join(' '));
    }
  }
}();
