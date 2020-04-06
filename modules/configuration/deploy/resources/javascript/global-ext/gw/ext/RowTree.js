Ext.define('gw.ext.RowTree', {
  extend: 'Ext.tree.Panel',
  alias: 'widget.rowtree',
  rootVisible: false,
  shrinkWrap: true,
  shrinkWrapDock: true,

  // Clear toggle.
  clearFoldersToggled: function () {
    var localToggleState = Ext.ComponentManager.get(this.id + '_toggle');
    if (!localToggleState) {
      return; // No need to collect client folder-toggle state to send to the server
    }
    this.foldersToggled = [];
    localToggleState.setValue('');
  },

  updateFlagged: function () {
    // update button state:
    var checkedNodes = this.getChecked();
    gw.GridUtil.updateFlaggedButtons(this[gw.SimpleGrid.FLAGGED], checkedNodes, this);
  },

  /**
   * Registers events, and sets up store fields
   */
  initComponent: function () {
    var me = this;

    this.on({
      /**
       * @SenchaUpgrade TODO : talk to Sencha about disabled selection of individual nodes, and select a node upon load
       * Disable row selection, if needed
       */
      beforeselect: function (view, node) {
        if (node.get('disableSelection') && !node.get('selected')) {//if user selection is disabled, and the node is not pre-selected by server
          return false; // cancel selection
        }
      },

      /**
       * Handles row selection for a Tree-Detail panel:
       * @param selModel
       * @param selections
       */
      selectionchange: function (selModel, selections) {
        // show detail
        if (selections.length == 1) {

          var node = selections[0];
          var tree = selModel.view.ownerCt;
          gw.app.requestViewRoot(
            [tree.id, node.get('id'), '_ViewDetail'].join(":"),
            {updateData: true}
          );
        }

      },

      /**
       * @SenchaUpgrade Cancels row selection, if the event target is a checkbox. TODO: Sencha should support this by default
       */
      beforeitemmousedown: function (view, record, item, index, e) {
        if (e.getTarget().getAttribute('role') == 'checkbox') {
          return false;
        }
      },

      /**
       * Handles node checkbox state change
       */
      checkchange: this.updateFlagged,
      load: this.updateFlagged
    });

    if (!this.viewConfig) {
      this.viewConfig = {}
    }
    this.viewConfig.stripeRows = (this.gStripeRows !== false);

    // TODO: refactor to move to the common parent class of Tree Panel and Grid. And renamve "filters" to "gFilters"?
    // add filters to panel toolbar
    if (this.filters) {
      gw.GridUtil.addFiltersToPanel(this, this.filters);
      delete this.filters;
    }

    // Remember the LV grid column resize state from the local cookie store:
    if (!this.stateId) {
      this.stateId = this.id;
    }
    if (this.stateId) {
      this.stateful = true;
    }

    var fields = [
      {name: 'disableSelection', type: 'boolean'},
      'eventParam',
      'selected'
    ];
    if (this.cb) {
      // add fields needed to render node checkbox and post checkbox state to the server
      fields.push({name: 'checked', type: 'boolean', mapping: '_Checkbox', convert: function (v) {
        return Ext.isBoolean(v) ? v : v === 'true' ? true : v === 'false' ? false : null;
      }});
      fields.push({name: gw.SimpleGrid.ROW_OFFSET, mapping: 'id'});
      fields.push(':flags');
    }

    for (var i = 0; i < this.columns.length; i++) {
      var col = this.columns[i];
      if (i == 0) {
        col.xtype = 'treecolumn'; // first column contains tree-operation buttons
      } else {
        // TODO: can we consolidate Column renderer logic for both Grid and Tree?
        col.renderer = me.treeColumnRenderer;
      }

      fields.push(col.dataIndex);
      fields.push(col.dataIndex + ':cls');
    }

    this.fields = fields;

    // Create a strut root object to have the super class method load data into.
    this.root = {id: 'root'};
    // If there is no data section from the server, make the root a leaf node
    if (!this.data) {
      Ext.apply(this.root, {expanded: false, expandable: false, leaf: true});
    }

    this.callParent(arguments);

    // TODO: consolidate viewready logic between Grid and Tree?
    this.view.on('viewready', this.updateFlagged, /*grid*/this)
  },

  //@SenchaUpgrade This method relies on the dom structure of ExtJs tree column
  doClick: function (tree, nodeModel, evt) {
    // click a row tree column:
    var treeColumn = evt.getTarget('.x-grid-cell');
    if (treeColumn) {
      var colIndex = Ext.fly(treeColumn).parent().query('.x-grid-cell').indexOf(treeColumn);
      var dataIndex = tree.columns[colIndex].dataIndex;
      if (nodeModel.get(dataIndex + ':cls') == gw.app.getEventSourceCls()) {
        evt.stopEvent();
        // handling linkCell
        if (tree.columns[colIndex].dataType == "complexType") {
          var itemElement = nodeModel.get(dataIndex);
          var download = this.getLinkIsDownload(itemElement, evt.getTarget().id);
          var options = download ?  {isUpload: true, form: 'history-form'} : {};
          gw.app.handleAction(null, evt.getTarget().id, options)
        } else {
          gw.app.handleAction(null, tree.id + ':' + nodeModel.get('id') + ':' + (nodeModel.get('eventParam') || dataIndex))
        }
      }
    }
  },

  getLinkIsDownload: function (itemElement, targetId) {
    if (itemElement.id && itemElement.id == targetId) {
      return itemElement.download;
    } else if (itemElement.items && itemElement.items.length > 0) {
      for (var j = 0; j < itemElement.items.length; j++) {
        var childItem = itemElement.items[j];
        if (childItem.id && childItem.id == targetId) {
          return childItem.download;
        }
      }
    }
    return false;
  },

  treeColumnRenderer: function (value, metaData, record, rowIndex, colIndex, store, view) {
    var header = view.headerCt.getHeaderAtIndex(colIndex);
    var fieldName = header.dataIndex;

    var cls = record.get(fieldName + ':cls');
    if (Ext.isString(value)) {
      return cls ? '<span class="' + cls + '">' + value + '</span>' : value;
    } else if (Ext.isObject(value) && value.items) {
      var fieldRecord = record.get(fieldName);
      // rendering for linkCell
      var htmlArray = [];
      for (var i = 0; i < value.items.length; i++) {
        var linkElement = fieldRecord.items[i];
        htmlArray.push(this.columns[colIndex]._markupCellLink(value.items[i], null));
      }
      return htmlArray.join('');
    }
  }

});

