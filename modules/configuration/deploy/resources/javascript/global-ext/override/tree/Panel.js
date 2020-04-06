/**
 * Override tree panel, so that the change can be inherited by TreeGrid sub class
 */
Ext.define('Gw.override.tree.Panel', {
  override: 'Ext.tree.Panel',

  autoScroll: true,
  border: false,
  // TODO: PL-23195: May consider setting back to default animation once fixed by Ext JS.
  animate: false,

  /**
   * Remembers nodes toggled at browser side
   */
  _onToggle: function (tree, nodeId) {
    if (!tree.foldersToggled) {
      return; // not ready yet
    }
    var localToggleState = Ext.ComponentManager.get(tree.id + '_toggle');
    if (!localToggleState) {
      return; // No need to collect client folder-toggle state to send to the server
    }

    if (Ext.Array.indexOf(tree.foldersToggled, nodeId) >= 0) {
      Ext.Array.remove(tree.foldersToggled, nodeId);
    } else {
      tree.foldersToggled.push(nodeId)
    }
    localToggleState.setValue(tree.foldersToggled.toString());
  },

  /**
   * @SenchaUpgrade Handles node pre-selected from server
   */
  _selectNodeOnLoad: function (topNode) {
    var me = this;
    topNode.cascadeBy(function (node) {
      if (node.get('selected')) {
        me.suspendEvents(false); // The state comes from server, no need to trigger events
        me.selectPath(node.getPath()); // select node on load
        me.resumeEvents();
      } else {
        // AHK - 3-27-2013 - If we attempt to select a path that's a child of a node that's not expanded,
        // ExtJS will create a duplicate node and then generally freak out.  This is a bug we should fix
        // server-side, such that we shouldn't ever be in a situation where the parent of a selected node
        // ends up collapsed, but some of that code is app-specific and not 100% under our control, so we
        // want to make sure the client doesn't freak out if that happens.
        // See PL-21885
        return node.get('expanded')
      }
    });
  },

  getDataIndex: function (colIndex) {
    return this.columns[colIndex].dataIndex
  },

  /**
   * Handles click on a tree node
   */
  doClick: function (tree, nodeModel, evt) {
    if (!nodeModel.get('disabled')) { // @SenchaUpgrade TODO: Does ExtJs offer a good way to disable tree node selection
      evt.stopEvent();
      gw.app.handleAction(null, tree.dataUrl || tree.id, {param: nodeModel.get('id')})
    }
  },

  listeners: {
    /**
     * After the tree is fully rendered:
     * <li> starts tracking toggled nodes
     * <li> Selects the default "selected" node
     */
    afterrender: function () {
      this.foldersToggled = []; // resets toggled nodes after loading the tree from server
      this._selectNodeOnLoad(this.getRootNode()); // check for pre-selected node from server
    },
    /**
     * Tracks nodes toggled locally
     */
    beforeitemexpand: function (nodeModel) {
      this._onToggle(this, nodeModel.get('id'))
    },
    /**
     * Tracks nodes toggled locally
     */
    beforeitemcollapse: function (nodeModel) {
      this._onToggle(this, nodeModel.get('id'))
    },
    /**
     * Undos "toggled at client" state, when a node is loaded from server side
     */
    load: function (store, nodeModel) {
      if (nodeModel.isRoot() && !this.rootVisible) {
        return; // invisible root node doesn't have toggle state at client side
      }
      this._onToggle(this, nodeModel.get('id'))
    },

    /**
     * Triggers action on click:
     */
    itemclick: function (treeView, nodeModel, elem, index, evt) {
      return this.doClick(this, nodeModel, evt);
    }
  },

  /**
   * Sets up loader to load inline data
   */
  initComponent: function () {
    // TODO: ExtJs upgrade4 - Fix server response, so that we don't have to convert inline data format here:
    if (this.data && this.root) {
      this.root.children = this.data;
      delete this.data
    }

    this.store = {
      remoteSort: true,  // sort at server side
      storeId: this.id, // set up store id
      listeners: {
        /**
         * Checks for pre-selected node from server, when the store reload
         */
        load: function (store, node, records, successful) {
          if (successful) {
            var treePanel = Ext.ComponentManager.get(this.storeId);
            // AHK - 3-27-2013 - We have to invalidate checksums on the outer container
            // when we load new data from the server, since
            // the server-side checksum won't have taken these children into account.  If we don't do this,
            // then adds/removes on open nodes won't be reflected in the tree
            // See PL-21885
            treePanel.ownerCt.checksum = 'checksumInvalidated';
            treePanel._selectNodeOnLoad(node); // check for pre-selected node from server
          }
        }
      }
    };
    if (this.fields) {
      // @SenchaUpgrade TODO: inline fields definition was deprecated in ExtJs4.0, but seems no longer deprecated in 4.1
      this.store.fields = this.fields;
    } else {
      this.store.model = this.modelId ? this.modelId : 'gw.model.TreeModel';
    }

    // Use gw proxy for the TreeStore
    this.store.proxy = Ext.create('gw.ext.ModelProxy', {
      reader: {}, // work around JS error when there's no reader specified
      url: 'dummy2',
      extraParams: {viewRootId: this.dataUrl || this.id}
    });

    this.callParent(arguments);

    // add a hidden input to store folders toggled at client side:
    this.add({
      id: this.id + '_toggle',
      xtype: 'hidden',
      hidden: true
    });
  }
});
