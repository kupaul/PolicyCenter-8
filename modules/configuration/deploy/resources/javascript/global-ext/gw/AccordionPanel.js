/**
 * A special tree panel:
 *  - only allow expanding the selected path
 *  - selecting a folder will auto expand the first child
 */
Ext.define('gw.AccordionPanel', {
    extend: 'Ext.tree.Panel',
    alias: 'widget.accordionpanel',

    displayField: 'title',
    pathFromServer: '',
    anchor: '100%',
    ui: 'tree-navigation',
    manageHeight: false,
    animate: false,
    useArrows: true,
    singleExpand: true,
    autoScroll: true,
    rootVisible: false,

    initComponent: function() {
        var me = this;

        me.footerId = me.id + '-footer';

        // events
        me.on({
            beforeitemcollapse  : me.onBeforeItemCollapse,
            itemcollapse        : me.onItemCollapse,
            beforeselect        : me.onBeforeSelect,
            selectionchange     : me.onSelectionChange
        });

        // config
        me.addCls('g-accordion');
        me.modelId = 'gw.AccordionModel';

        // Disallow mouse events and hover style for expander,
        // because we can't allow expanding/collapsing independently from selection change:
        me.viewConfig = Ext.apply(me.viewConfig || {}, {
            expanderSelector: '.does-not-match-anything'
        });

        // define root
        if (me.items) {
            me.root = {
                expanded: true,
                items: me.items
            };
            delete me.items;

            var inputFields = [];
            me.transformData(me.root, inputFields);

            if (inputFields.length > 0) { // dock form inputs to the bottom
              // TODO: this is added so that docked items will not be obscured
              // The ExtJS calculations don't seem to work correctly; however,
              // After collapsed and expand, they sizing is correct
              // Therefore, this footer spacing is hidden after panel is expanded
              inputFields[inputFields.length] = {
                id: me.footerId,
                xtype: 'component',
                autoEl: 'div',
                height: 10
              }

                me.dockedItems = [{
                    dock    : 'bottom',
                    layout  : 'anchor',
                    xtype   : 'panel',
                    items   : inputFields,
                    defaults: {
                        labelWidth: 63,
                        anchor: '100%'
                    }
                }];
            }
        }
        else {
            me.root = {
                leaf: true,
                expanded: false
            };
            me.hidden = true;
        }

        // super
        me.callParent(arguments);
    },

    // AHK - 3-18-2103 - @SenchaUpgrade temporarily set animate to true in expand and collapse, since otherwise you can't
    // re-expand the panel after it's been collapsed.  I attempted to debug the underlying problem, but failed:  I got
    // as far as the fact the finishedLayout on the Dock layout doesn't correctly call afterCollapse like it should
    // since the animation comes back as true (since it's been temporarily enabled), so the callback doesn't happen.
    // I also attempted to set animCollapse to false, which lead to a different problem whereby the panel doesn't
    // re-expand properly (though expand() does get called in that case).  Ugh.
    expand : function() {
      var me = this;
      var footer = Ext.getCmp(me.id + '-footer');
      me.animate = true;

      if (footer != undefined) {
        footer.setVisible(false);
      }
      me.callParent(arguments);
      me.animate = false;
    },

    collapse : function() {
      var me = this;
      me.animate = true;
      me.callParent(arguments);
      me.animate = false;
    },

    /**
     * If there's a path to expand, do it before rendering,
     * and save the node selection for after rendering
     */
    beforeRender: function() {
        var me = this;
        me.callParent(arguments);

        if (me.pathFromServer) {
            me.selectPathFromServer(me.pathFromServer);
            delete me.pathFromServer;
        }
    },

    /**
     * After rendering the selection model is available.
     * Select node if any.
     */
    afterRender: function() {
        var me = this;
        me.callParent(arguments);

        if (me.selectionNode) {
            me.preventHandleAction = true;
            me.getSelectionModel().select(me.selectionNode);

            delete me.preventHandleAction;
            delete me.selectionNode;
        }
    },

    /**
     * Expands and selects the current path from the server
     * @param path an array of eventId of nodes on the current path
     */
    selectPathFromServer: function(path) {
        var me = this;

        if (path.length > 0) {
            me.preventHandleAction = true; // mark the duration of updating current path based on server state
            me.selectPath(
                '/' + '/' + path.join('/'),
                'eventId',
                undefined,
                function(success, lastNode) {
                    if (!me.rendered) {
                        me.selectionNode = lastNode;
                    }

                    delete me.preventHandleAction; // END of updating current path based on server state
                }
            );
        }
        else {
            me.getSelectionModel().deselectAll();
        }
    },

    /**
     * Prevents collapsing a node which is on the selected path, or has 'collapsible' equal to false.
     * @param node the node to collapse
     */
    onBeforeItemCollapse: function(node) {
        var selected = this.getSelectionModel().getSelection()[0];

        if (!selected || node.contains(selected)) { // node on the selected path
            return false;
        }

        // a node that is marked as not collapsible
        // children of this node may still be collapsible, pass on the event
        if (this.nonCollapsingNodes && this.nonCollapsingNodes[node.get('eventId')]) {
            node.collapseChildren();
            return false;
        }
    },

    /**
     * Collapses children when a node is collapsed
     * @param node the node to collapse
     */
    onItemCollapse: function(node) {
        // to prevent error when the node is opened for the next time
        node.collapseChildren();
    },

    /**
     * Do nothing in this inherited method since all actions are performec in selectionchange handler
     */
    doClick: function (tree, nodeModel, evt) {
    },

    /**
     * Disallows selecting a disabled node
     */
    onBeforeSelect: function(view, node) {
        if (node.get('cls') === 'g-disabled') {
            return false;
        }
    },

    /**
     * Selects the first child recursively, when a node is selected
     */
    onSelectionChange: function(view, selections) {
        var selModel, treeView,
            me          = this,
            newSelection= selections[0];

        if (selections.length === 0) {
            if (me.root.isNode) {
                me.root.collapseChildren();
            }
            return;
        }

        // the selected node has children
        if (newSelection.isExpandable()) {
            selModel = me.getSelectionModel();

            // the node is not yet expanded
            // expand, then select the first child:
            if (!newSelection.isExpanded()) {
                newSelection.expand(false, function(children) {
                    selModel.select(children[0]);
                });
            }

            // the node is already expanded (e.g., because it's on the selected path)
            else {
                selModel.select([newSelection.firstChild]); // select the first child
            }
        }

        // this selected node is leaf
        else {
            treeView = me.getView();

            // collapse unselected path (because "singleExpand" doesn't collapse expanded nodes when you select a leaf node)
            // if the node is leaf or marked as not collapsible, collapse all siblings
            for (var node = newSelection; node != null; node = node.parentNode) {
                if (!node.isExpandable() || node.get('collapsible') == false) {
                    treeView.ensureSingleExpand(node);
                }
            }

            // call server, when the selection is triggered by the user:
            if (me.preventHandleAction !== true) {
                gw.app.handleAction(null, newSelection.get('eventId'));
            }
        }
    },

    /**
     * Temp workaround to transform server response to the desired data format
     * TODO: change server response
     * @param node a node in the hierarchical menu
     * @param inputFields an array to collect all input fields removed from the tree
     */
    transformData: function(node, inputFields) {
        var me = this;

        if (node.items) {
            if (node.xtype == 'noncollapsingpanel') { // a tree node that is ALWAYS expanded
                node.expanded = true;
                // AHK - 4/10/2013 - There's no decent way that I've found to propagate a custom property through to the
                // wrapper object ExtJS creates for the node.  We used to set a 'collapsible' property on the node, but
                // that property disappears by the time we try to check it in onBeforeCollapse.  So instead, we keep a map
                // of the event ids that shouldn't be collapsed, and check it in onBeforeCollapse
                // See PL-23909
                if (!me.nonCollapsingNodes) {
                  me.nonCollapsingNodes = {};
                }
                me.nonCollapsingNodes[node.eventId] = true;
            }

            // rename "items" to "children":
            node.children = node.items;
            delete node.items;

            for (var i = node.children.length - 1; i >= 0; i--) {
                var child = node.children[i];
                if (child.xtype == 'noncollapsingpanel' && child.layout) {
                    // remove any form field from the tree
                    Ext.Array.remove(node.children, child);
                    Ext.Array.insert(inputFields, 0, child.items);
                } else {
                    // recursive call:
                    this.transformData(child, inputFields);
                }
            }
        } else {
            // mark leaf node:
            node.leaf = true;
        }

        if (node.disabled == true) {
            node.cls = 'g-disabled'; // class for a disabled item
        }
    },

    onDestroy: function() {
//      Ext.cacheLogger.log("onDestroy() for accordionPanel, " + (this.store ? this.store.storeId : " no store field"))
      if(this.store) {
        if(this.store.proxy) {
          this.store.proxy.clearListeners();
        }
        this.unbindStore();
      }
      this.callParent();
    }

});