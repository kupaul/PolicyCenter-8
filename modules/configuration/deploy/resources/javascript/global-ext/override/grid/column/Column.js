Ext.define('Gw.override.grid.column.Column', {
  override: 'Ext.grid.column.Column',

  statics : {
    //Templates for FormatCell.  We should try using Template column with XTemplate instead.
    INPUT_TPL : new Ext.Template(
        '<tr>',
        '<td>',
        '<label for="{id}" style="{labelStyle}" class="x-form-item-label">{fieldLabel}</label>',
        '</td>',
        '<td>',
        '<div class="x-form-item-cell {itemCls}" id="x-form-el-{id}" style="{fieldStyle}">{itemValue}</div>',
        '</td>',
        '</tr>'
    ),

    NO_LABEL_INPUT_TPL : new Ext.Template(
        '<tr><td colspan="2">',
        '<div class="x-form-item-cell {itemCls}" id="x-form-el-{id}" style="{fieldStyle}">{itemValue}</div>',
        '</td></tr>'
    ),

    LABEL_ABOVE_INPUT_TPL : new Ext.Template(
        '<tr><td colspan="2">',
        '<label for="{id}" style="{labelStyle}" class="x-form-item-label">{fieldLabel}</label>',
        '</tr></td>',
        '<tr><td colspan="2">',
        '<div class="x-form-item-cell {itemCls}" id="x-form-el-{id}" style="{fieldStyle}">{itemValue}</div>',
        '</td>',
        '</tr></td>'
    ),

    LABEL_TPL : new Ext.Template(
        '<tr><td colspan="2">',
        '<div class="x-form-item-cell {itemCls}" tabIndex="-1">',
        '<label style="{labelStyle}" class="x-form-item-label">{html}</label>',
        '</div>',
        '</td></tr>'
    )
  },

  /**
   * Instantiates menu of the owner object into Ext Menu Component,
   * and remembers the menu on the record to be destroyed later.
   * (NOTE: This method is called to instantiate menu during rendering,
   *  in order for SmokeTest to be able to find menu item.)
   * @param owner owner object
   * @param openerId id of the HTML element that will open the menu
   * @param record store record backing the cell
   */
  _instantiateCellMenu : function(owner, openerId, record) {
    if (owner.menu) {
      record.menus = record.menus || {};

      if (record.menus[openerId] && record.menus[openerId].menu) {
        // Destroy any menus that have been created already to avoid double creation of menu entry components.
        // TODO Refactor: Optimize: See whether it is more efficient to create the menus over if they have changed.
        record.menus[openerId].menu.destroy();
        delete record.menus[openerId];
      }

      record.menus[openerId] = {
        id: owner.id,
        menu: Ext.apply(gw.ext.Util.getOrCreateFieldMenu(openerId, owner.menu), {openerId: openerId}),
        showMenu: function() {
          gw.ext.Util.createAndShowOnDemandMenuIfNeeded(this);
          this.menu.showAt(Ext.fly(this.menu.openerId).getAnchorXY('bl'));
        }
      };

      if (owner.ondemandmenu) {
        record.menus[openerId].ondemandmenu = owner.ondemandmenu;
      }
    }
  },

  _wrapCellContent:function (value, metaData, store, record, fieldName, ret) {
    var me = this;
    // wrap cell content inside an action or menu button, if needed
    var menu = value.menu;

    var cellCls = value.cls ? value.cls.split(' ') : [];
    var oldLength = cellCls.length;
    Ext.Array.remove(cellCls, gw.app.getEventSourceCls()); // remove marker cls
    if (cellCls.length > 0) {
      metaData.tdCls += ' ' + cellCls.join(' ');
    }

    if (menu || oldLength > cellCls.length/*value cls contains event source cls*/) {
      var linkId = value.id || gw.GridUtil.getFullIdForCell(store, record, fieldName);
      me._instantiateCellMenu(value, linkId, record);
      return me._markupCellLink({id:linkId, menu:menu, text:ret, disabled:value.disabled});
    }

    if (value.id) {
      // PL-27795 - Need to insert space to stretch the inner div of the cell if value is empty
      if (ret === '') {
        ret = '&#160;';
      }
      // renders id for the cell:
      return Ext.core.DomHelper.markup({tag:'span', id:value.id, html:ret});
    }

    return ret;
  },

  /**
   * Gets HTML markup for a link within a grid cell. We don't generate component for cell links for perf reason.
   * @param linkConfig config
   * @param options additional attributes for the the html element
   * @return html
   */
  _markupCellLink : function(linkConfig, options) {
    var config;

    config = Ext.apply(
        linkConfig.text ? {tag: linkConfig.disabled ? 'span' : 'a', html:linkConfig.text + (linkConfig.html || '')} :
        {tag:'img', src:(linkConfig.icon ? linkConfig.icon : Ext.BLANK_IMAGE_URL)},
        options)

    // css classes:
    var cls = []
    if (!linkConfig.disabled) {
      cls.push( linkConfig.menu ? gw.SimpleGrid.CELL_MENU_CLS : gw.app.getEventSourceCls() ) // cls to indicate action or menu
    }
    if (linkConfig.cls) {
      cls.push(linkConfig.cls) // other cls from base config
    }
    if (cls.length > 0) {
      config.cls = cls.join(' ')
    }

    Ext.copyTo(config, linkConfig, ['id']);
    if (linkConfig.tooltip) {
      config['title'] = linkConfig.tooltip;
    }

    if (linkConfig.hidden) {
      config.style = 'display:none';
    }

    if (linkConfig.handler) {
      config.onclick = linkConfig.handler
    }
    return Ext.core.DomHelper.markup(config)
  },

  /**
   * Given a (possibly null) list of child items, appends the HTML for them
   * to the ret value passed in.
   */
  _appendHtmlForChildItems : function(childItems, record, ret) {
    var me = this;
    if (childItems) {
      Ext.each(childItems, function(childItem, i) {
        me._instantiateCellMenu(childItem, childItem.id, record);
        ret += me._markupCellLink(childItem, {itemIndex:i});
      });
    }
    return ret;
  },

  _renderFormatCell: function (column, items, store, record, rowIndex, colIndex, fieldName, metaData, view) {
    var me = this;
    var htmlArray = [];
    Ext.iterate(items, function (item, index) {
      if (item.html) {
        htmlArray.push(Ext.grid.column.Column.LABEL_TPL.apply(item))
      } else {
        var itemValue;
        if (item.xtype == 'fieldcontainer' && item.defaultType == 'glink') {
          itemValue = item.items;
        } else {
          itemValue = item.value;
        }

        if (item.xtype == 'templatevaluepanel') {
          itemValue = me._renderTemplateValuePanel(column, item, store, record, rowIndex, colIndex, fieldName, metaData, view)
        }
        itemValue = me._renderRegularContent(column, itemValue, store, record, rowIndex, colIndex, fieldName, metaData, true, view, index);
        itemValue = me._appendHtmlForChildItems(item.item, record, itemValue);
        item.itemValue = itemValue;
        if (item.hideLabel) {
          htmlArray.push(Ext.grid.column.Column.NO_LABEL_INPUT_TPL.apply(item));
        } else if (item.labelAlign == "top") {
          htmlArray.push(Ext.grid.column.Column.LABEL_ABOVE_INPUT_TPL.apply(item));
        } else {
          htmlArray.push(Ext.grid.column.Column.INPUT_TPL.apply(item));
        }
      }
    });
    var tableContents = htmlArray.join('');
    return '<table>' + tableContents + '</table>'
  },

  _renderTemplateValuePanel:function (column, complexItem, store, record, rowIndex, colIndex, fieldName, metaData, view) {
    var me = this;
    var htmlArray = []
    // We are assuming a read-only composite field.
    for (var i = 0; i < complexItem.items.length; i++) {
      var compositeItem = complexItem.items[i]
      var compositeVal;
      if (compositeItem == '-') {
        compositeVal = '<br>'
      } else {
        compositeVal = me._renderRegularContent(column, compositeItem, store, record, rowIndex, colIndex,
            fieldName, metaData, undefined, view);
      }
      htmlArray.push(compositeVal);
    }
    if (htmlArray.length > 0) {
      metaData.innerCls = 'g-template-spacer';
    }
    return htmlArray.join('');
  },

  _renderRegularContent: function(column, value, store, record, rowIndex, colIndex, fieldName, metaData, skipFurtherRendering, view, outerIndex) {
    var me = this;
    var htmlArray = [];
    var ret = '';

    if (value == undefined) {
      return ret;
    }

    function _spanColumns(column, value, record, colIndex, fieldName, metaData, view) {
      var strColSpan;
      var colSpan = value.colspan;
      var columnIdx;
      var nCols = 0;

      // summary record has no raw data
      if (!record.raw) {
        return;
      }

      if (colSpan > 0) {
        nCols = Math.min(view.headerCt.getGridColumns().length, colSpan + colIndex);
        strColSpan = ' colSpan=' + colSpan;

        for (var i = colIndex + 1; i < nCols; i++) {
          columnIdx = view.headerCt.getHeaderAtIndex(i);
          //colSpan columns need to be hidden
          record.raw[columnIdx.dataIndex] = view.id + '_hide';
        }
      }

      if (strColSpan) {
        metaData.tdAttr = metaData.tdAttr ? metaData.tdAttr + strColSpan : strColSpan;
      } else if (record.raw[fieldName] === (view.id + '_hide')) {
        metaData.tdAttr = 'style="display:none;"';
        record.raw[fieldName] = '';
      }
    }

    _spanColumns(column, value, record, colIndex, fieldName, metaData, view);

    if (Ext.isArray(value)) {
      var itemIndexPrefix = (outerIndex !== undefined ? outerIndex + ':' : '');
      // multiple links under a content cell
      for (var i = 0; i < value.length; i++) {
        htmlArray.push(me._markupCellLink(value[i], {itemIndex:itemIndexPrefix+i}));
      }
      ret = htmlArray.join('');

    } else {
      var cellValue = (value && value.text != undefined) ? value.text : value;

      if (value && value.align) {
        //TODO: Sencha ticket pending: column-level align overrides cell-level align by default
        metaData.style += 'text-align:' + value.align + ' !important';
      }
      if (value && value.fontColor) {
        var colorStyle = 'color:' + value.fontColor;
        metaData.style = (metaData.style) ? metaData.style + '; ' + colorStyle : colorStyle;
      }
      if (value && value.invalid && !record.isModified(fieldName)) { // invalid cell
        metaData.tdCls += ' g-invalid-cell';
      }
      if (value && value.editable) {
        metaData.tdCls += ' g-cell-edit'; // mark cell editable
      }

      // Get the current default column editor
      var editor;
      if (column.getEditor) {  //todo:  need to find a better way to check for a editor
        editor = column.getEditor();
      }

      // Process row sensitive row editors that may be different than the current column editor
      gw.GridUtil.processGridEditor(store, rowIndex, column, function (editorByRow) {
        // Combo box cell editor
        if (editorByRow[0].xtype == 'simplecombo') {
          if (editorByRow[0] instanceof Ext.form.Field) {
            editor = editorByRow[0];
          } else {
            editor = null;
            Ext.each(editorByRow[0].store, function (data) {
              if (data[0] == cellValue) {
                cellValue = Ext.String.htmlEncode(data[1]);
                return false;
              }
            });
          }

          // Multiselect control
        } else if (editorByRow[0].xtype == 'multiselect') {
          // TODO tpollinger: Fix for PL-21897. Need to change the server cell value handling:
          // model value is sent as text. It should send in 'text' the display string and in 'value' the model value.
          // The display string is displayed if the editor is not instantiated yet, the model value is the editor's
          // current selection. With that, there is no need to do client side display string processing.
          // Formatting cell value to a display value
          // We need also to redesign the way complex dv column edits work (here multi select list box):
          // See: PL-22069
          var cellValueObj = Ext.JSON.decode(cellValue, true);
          if (cellValueObj != null && Ext.isArray(cellValueObj)) {
            cellValue = "";
            for (var i = 0; i < cellValueObj.length; i++) {
              cellValue += cellValueObj[i];
              if (i + 1 < cellValueObj.length) {
                cellValue += ", ";
              }
            }
          }

          // Privacy cell editor: Obfuscate the cell value
        } else if (editorByRow[0].xtype == 'privacy') {
          if (value && !record.isModified(fieldName)) { // encrypt non-empty value from server
            if (Ext.isString(value)) {
              value = {text:value}; // box simple text
            }

            // Deletes the server value and starts editing the cell. The privacy field should now be visible.
            function deletePrivacyCellValue() {
              // @SenchaUpgrade: Call base get method. TODO Refactor inheritance
              Ext.data.Model.prototype.set.call(record, fieldName,
                  gw.GridUtil.getRecordUpdateValue(record, fieldName, '', {xtype: "textfield", privacyEdited: "true"},
                      ["gwCellId"], null));
              var grid =  Ext.ComponentManager.get(store.storeId);
              // TODO: PL-23617: Ext JS Mode: Privacy cell rendering in edit mode is not consistent for modal cells
              grid.getCellEditingPlugin().startEdit(record, grid.view.headerCt.getHeaderAtIndex(colIndex));
            }

            // TODO: @SenchaUpgrade: Check whether the menu gets destroyed when the containing grid is destroyed
            // Add a cell menu to allow the user clearing the privacy field value.
            // Do not add menu items if this privacy field has already been edited.
            if (!value.privacyEdited) {
              var menuId = gw.GridUtil.getFullIdForCell(store, record, fieldName) + '_MENU';
              var items = [];
              Ext.each(gw.ext.Util.getPrivacyFieldMenuItems(), function(itemText, index) {
                items.push({
                  text:itemText,
                  handler:deletePrivacyCellValue,
                  id: index==0 ? menuId+':edit': undefined
                });
              });
              value.item = [{
                icon: "images/app/drop_button.png",
                xtype: "button",
                id: menuId,
                width: 16,
                height: 16,
                menu: {items:items}
              }];
            }
          }

          // update record field, without firing events
          record.data[fieldName] =
              gw.GridUtil.getRecordUpdateValue(record, fieldName, value, null, ["gwCellId"], null);

          // Radio group in a cell: Render the radio group as editable control
        } else if (editorByRow[0].xtype == 'radiogroup') {
          cellValue = gw.GridUtil.getTextForRadioGroupCell(editorByRow[0], value);
        }

        // TODO: @SenchaUpgrade: We should check the disabled check for all editor types, not just checkboxes
        if (!editorByRow[0].disabled) {
          if (!metaData.tdCls || metaData.tdCls.indexOf('g-cell-edit') == -1) {
            if (editorByRow[0].xtype == 'checkbox' && column.getEditor) {
              column.setEditor(editorByRow[0]);
              editor = column.getEditor();

              //@SenchaUpgrade: based on Ext.grid.column.CheckColumn
              var cssPrefix = Ext.baseCSSPrefix,
                  cls = [cssPrefix + 'grid-checkcolumn'],
                  checkedValue = record.get(fieldName);

              metaData.innerCls = cssPrefix + 'grid-cell-inner-checkcolumn';

              // TODO tpollinger Ensure display values like Yes/No, "X"/"" don't creep into the checking logic.
              // A canonical true/false should be used for these cases.
              if (checkedValue === 'Yes' || checkedValue === 'true' || checkedValue.cb === true || checkedValue === true) {
                cls.push(cssPrefix + 'grid-checkcolumn-checked');
              }

              ret = '<img class="' + cls.join(' ') + '" src="' + Ext.BLANK_IMAGE_URL + '"/>';
              return ret;
            }
            else {
              metaData.tdCls += ' g-cell-edit'; // mark cell editable, not needed for boolean types
            }
          }
        }
      });

      // PL-22644 xtype is checkbox only denotes default editor, other editors can exist in this column
      if (editor && editor.xtype == 'checkbox' && ret != '') {
        return ret;
      }

      if (editor && editor.displayField) { // lookup display text for combo field
        var idx = editor.store.findExact(editor.valueField, cellValue);
        // Autocomplete are combos, but there may not be an exact match.
        if (idx != -1) {
          cellValue = editor.store.getAt(idx).get(editor.displayField);
        }
      }

      ret = cellValue;
      if (!skipFurtherRendering) {
        ret = cellValue;
      }
    }

    if (!skipFurtherRendering && value) {
      if (!Ext.isEmpty(value.text)) { // show prefix/suffix if value not blank
        if (value.prefix) {
          ret = value.prefix + ret;
        }
        if (value.suffix) {
          ret += value.suffix;
        }
      }

      ret = me._wrapCellContent(value, metaData, store, record, fieldName, ret);

      // insert cell checkbox, if any:
      // TODO: @SenchaUpgrade: Refactor: See there is similar code under if (!editorByRow[0].disabled) {...}
      if (value.cb != null) {

        //@SenchaUpgrade: based on Ext.grid.column.CheckColumn
        var cssPrefix = Ext.baseCSSPrefix,
            cls = [cssPrefix + 'grid-checkcolumn'],
            checkedValue = record.get(fieldName);

        if (value == 'Yes' || value.cb === true) {
          cls.push(cssPrefix + 'grid-checkcolumn-checked');
        }
        cls = cls.join (' ');

//            ret = Ext.String.format(
//                '<img class="' + cls + '" src="' + Ext.BLANK_IMAGE_URL + '" id="{0}/><span>'+ ret +'</span>',
//                gw.GridUtil.getFullIdForCell(store, record, fieldName) + 'CB'
//            );

        ret = Ext.String.format(
            '<div style="width:15px; float:left;" class="' + cls + '" id="{0}">&#160;</div><span>'+ ret +'</span>',
            gw.GridUtil.getFullIdForCell(store, record, fieldName) + 'CB');
      }

      // append helper icons, if any
      var items = value.item;
      var links = '';
      if (items) {
        Ext.each(items, function(item, i) {
          me._instantiateCellMenu(item, item.id, record);
          links += me._markupCellLink(item, {itemIndex:i});
        });
        ret = '<div class="g-helper-cell-icon">' + links + '</div>' + '<div class="g-helper-cell-text">' + ret + '</div>';
      }

      if (value.altVal) {
        ret += Ext.core.DomHelper.markup({
          tag: 'div', cls: gw.ext.Util.getAltValueClass(),
          html: value.altVal.text,
          value: value.altVal.value
        });
      }
    }

    return ret;
  },

  _formatRadioGroup: function (items) {
    var ret = '<table class="gw-radio-group-cell"><tr>';
    var sChecked;
    var id;

    for (var i = 0; i < items.length; i++) {
      id = Ext.id();

      sChecked = items[i].checked ? 'class="x-form-cb-checked"' : '';
      ret += Ext.String.format('<td {0}><input id="{3}" inputValue="{1}" class="x-from-field x-form-radio " type="button">' +
        '<label for="{3}">{2}</label></td>', sChecked, items[i].inputValue, items[i].boxLabel, id);
    }

    ret += '</tr></table>';
    return ret;
  },

  _formatSingleRadioInGroup: function (checked, groupName) {
    var sChecked = checked ? 'class="x-form-cb-checked"' : '';

    return Ext.String.format('<div style="text-align: center" {0}><input class="x-form-field x-form-radio" type="button">&#160;</div>', sChecked);
  },

  initComponent: function () {
    if (this.dataType == 'complexType') {
      this.groupable = false;
    } else {
      this.groupable = this.sortable; // disallow group-by-this-column if the column is not sortable
    }
    if (this.sortable) {
      this.addCls('g-header-sort');
    }
    if (this.required) { // add required column indicator
      this.addCls('requiredcolumnindicator');
    }
    this.callParent(arguments);
  },

  /**
   * Adds row-sensitive cell content.
   * IMPORTANT: Avoid creating Ext Component in cell, which will be very expensive.
   * <ul>
   * <li>Adds row-sensitive style class and id before rendering the cell
   * <li>Appends helper icon or menu
   * </ul>
   */
  renderer: function (value, metaData, record, rowIndex, colIndex, dataSource, view) {
    // Note: 'this' in this context is the grid object, not the column or header object
    // Work with the header variable below for referring to the column object.

    var header = view.headerCt.getHeaderAtIndex(colIndex);
    var fieldName = header.dataIndex;
    var ret = '';
    var complexItem = gw.GridUtil.getTemplateCell(value);

    var store = view.ownerCt.getStore();
    var formatCell = (value.xtype === 'gfieldset') ? value : null;

    var invalidCellCls = 'g-invalid-cell';

    if (formatCell != null) {
      ret = header._renderFormatCell(header, formatCell.items, store, record, rowIndex, colIndex, fieldName, metaData, view);
      return ret;
    }

    if (complexItem == undefined) {
      if (value && value.xtype === 'gbarinput') {
        ret = gw.ext.Util.renderBarInput(value);
      } else if (value && value.xtype == 'radiogroup') {
        ret = header._formatRadioGroup(value.items);
        // show cell error indicator
        if (value.invalid) {
          if (ret.indexOf('x-form-cb-checked') == -1) {
            metaData.tdCls += ' ' + invalidCellCls;
          } else {
            metaData.tdCls = metaData.tdCls.replace(invalidCellCls, '');
          }
        }

      } else {
        if (header.xtype != 'radiocolumn') {
          // Render an inline radio input field if this is a mixed grid column configuration
          gw.GridUtil.processGridEditor(store, rowIndex, header, function (editorByRow) {
            var editorCfg = editorByRow[0];
            if (!editorCfg.disabled && editorCfg.xtype == 'radio') {
              ret = header._formatSingleRadioInGroup(record.get(fieldName), editorCfg.group);
            }
          });
        }

        if (ret == '') {
          ret = header._renderRegularContent(header, value, store, record, rowIndex, colIndex, fieldName, metaData, undefined, view)
        }
      }

    } else {
      ret = header._renderTemplateValuePanel(header, complexItem, store, record, rowIndex, colIndex, fieldName, metaData, view);
    }

    return ret;
  },

  // Override for Selenium browser testing purpose, Selenium click will not send correct mouse position
  // Resulting in the OnLeftEdge or OnRightEdge test to fail and hence, skipping the header click
  // TODO PL-18764: tpollinger Upgrade to latest Selenium. Patch Selenium if pointer coordinates are not supported.
  // @SenchaUpgrade
  onTitleElClick: function (e, t) {
    // The grid's docked HeaderContainer.
    var me = this,
      ownerHeaderCt = me.getOwnerHeaderCt();

    var xy = e.getXY();
    var pt = new Ext.util.Point(xy[0], xy[1]);

    if (ownerHeaderCt && !ownerHeaderCt.ddLock) {
      // Firefox doesn't check the current target in a within check.
      // Therefore we check the target directly and then within (ancestors)
      if (me.triggerEl && (e.target === me.triggerEl.dom || t === me.triggerEl.dom || e.within(me.triggerEl))) {
        ownerHeaderCt.onHeaderTriggerClick(me, e, t);
        // if its not on the left hand edge, sort
      } else if (e.getKey() || this.el.getRegion().isOutOfBound(pt) || (!me.isOnLeftEdge(e) && !me.isOnRightEdge(e))) {
        me.toggleSortState();
        ownerHeaderCt.onHeaderClick(me, e, t);
      }
    }
  }
});
