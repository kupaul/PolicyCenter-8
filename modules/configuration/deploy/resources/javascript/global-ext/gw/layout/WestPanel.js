/**
 * Special widget for west panel
 */
Ext.define('GW.layout.WestPanel', {
    extend: 'Ext.Panel', // Needs to be a Panel in order to be collapsible, but not Container
    alias: 'widget.gwestpanel',
    alternateClassName: ['gw.westpanel'],
    stateful: true,
    stateId: 'gw-leftnav',
    
    id          : 'westPanel',
    layout      : 'anchor',
    region      : 'west',
    collapseMode: 'mini',
    autoScroll  : true,
    header      : false,
    collapsible : true,
    hidden      : true,
    split       : true,
    border      : false,
    style       : {padding: 0},
    width       : 200,
    defaults    : {
        anchor: '0'
    },
    hideCollapseTool: true,     // only collapse west panel thru the splitter
    floatable       : true,  // allow floating when clicking on title bar
    
    WEST_PANEL_CHILD_PROP: ['actionsButton', 'accelerated', 'menuTree', 'menuLinks', 'independent'],
    WEST_PANEL_CURRENT_PROP: ['currentAccelerated', 'currentMenuLinks', 'currentIndependent'],
    WEST_PANEL_CURRENT_PATH_PROP: {
        currentAccelerated: 1,
        currentMenuLinks: 3,
        currentIndependent: 4
    },

    initComponent: function() {
        var me = this;
        
        me.updateProps(me.getProperties());
        me.clearProperties();
        me.callParent(arguments);
    },
    
    getProperties: function() {
        var me  = this,
            obj = Ext.copyTo({}, me, me.WEST_PANEL_CURRENT_PROP);
        return Ext.copyTo(obj, me, me.WEST_PANEL_CHILD_PROP);
    },
    
    clearProperties: function() {
        var me = this,
            props = [].concat(me.WEST_PANEL_CHILD_PROP).concat(me.WEST_PANEL_CURRENT_PROP);

        Ext.each(props, function(prop) {
            delete me[prop];
        });
    },
    
    applyDefaults: function(config) {

        // action button
        if (config.ui === 'action') {
            Ext.applyIf(config, {
                margin: '9px 12px',
                iconCls: 'ico-action',
                iconAlign: 'right',
                textAlign: 'left'
            });
        }
        
        // treepanels
        if (config.xtype === 'accordionpanel') {
            config.useArrows = true;
            config.border = config.bodyBorder = false;
        }
        
        // panel with only one tree child with fixed height, inherit height
        if (config.items && config.items.length === 1 && config.items[0].height) {
            Ext.apply(config, {
                layout      : 'fit',
                height      : config.items[0].height,
                autoScroll  : false,
                scroll      : false,
                border      : false
            });
            Ext.apply(config.items[0], {
                border      : false,
                bodyBorder  : false,
                height      : null,
                autoScroll  : true,
                useArrows   : true
            });
        }
        
        // no height defined
        else if (!config.height) {
            config.manageHeight = false;
        }
        
        return this.callParent(arguments);
    },

    /**
     * Updates properties in order
     * @param config map of properties
     */
    updateProps: function(config) {
        var i, len, propConfig, placeholders,
            me = this,
            hasChanges = false;

        me.suspendLayouts();

        // guarantee placeholders
        if (!me.items || me.items.length === 0) {
            hasChanges = true;
            placeholders = [
                {xtype: 'component', hidden: true}, // actions button
                {xtype: 'component', hidden: true}, // accelerated menu links
                {xtype: 'component', hidden: true}, // menu tree
                {xtype: 'component', hidden: true}, // menu links
                {xtype: 'component', hidden: true}  // independent steps
            ];
            
            if (!me.items || Ext.isArray(me.items)) {
                me.items = placeholders;
                
            }
            else {
                me.add(placeholders);
            }
        }

        // first, update child properties
        for (i = 0, len = me.WEST_PANEL_CHILD_PROP.length; i < len; i++) {
            propConfig = config[me.WEST_PANEL_CHILD_PROP[i]];
            if (propConfig && me.replaceItemAt(propConfig, i) === true) {
                hasChanges = true;
            }
        }
        
        // second, set "current" path, after all children are updated
        me.expandCurrentItems(config);
        
        // clear flags
        me.resumeLayouts(hasChanges);
    },
    
    /**
     * Expands child items that are "current", recursively
     * @param menuLinks the parent comp
     * @param config an array of "current" child item id in order, starting from the top
     */
    expandCurrentItems: function(config) {
        var k, currentPath, treePanel, treePanelIndex,
            me = this,
            currentPathProperties = me.WEST_PANEL_CURRENT_PATH_PROP;
        
        for (k in currentPathProperties) {
            if (currentPathProperties.hasOwnProperty(k)) {
                
                currentPath     = config[k];
                treePanelIndex  = currentPathProperties[k];
                treePanel       = Ext.isArray(me.items) ? me.items[treePanelIndex] : me.getComponent(treePanelIndex);
                
                if (currentPath) {
                    if (treePanel.rendered) {
                        treePanel.selectPathFromServer(currentPath);
                    }
                    else {
                        treePanel.pathFromServer = currentPath;
                    }
                }
            }
        }
    },
    
    replaceItemAt: function(newItem, index) {
        var me = this;
        
        if (!me.items.get) { // me hasn't been initialized, simply override the config
            me.items[index] = newItem;
        } 
        else {
            
            var oldItem = me.items.get(index);

            // avoid unnecessary replaces by checking if items, id, or visibility changed
            var idChanged           = oldItem.id !== newItem.id,
                itemsChanged        = me.countItems(oldItem) === 0 && me.countItems(newItem) === 0 ? false : true;
                visibilityChanged   = (oldItem.hidden||false) === (newItem.hidden||false) ? false : true;
            
            if (!itemsChanged && !visibilityChanged && !idChanged) {
                return false; //no changes
            }
            
            // replace
            me.remove(oldItem);
            newItem = me.insert(index, newItem);
        }
        
        return true; //changes made
    },

  countItems: function(item) {
    var me = this;

    var directItems = (item.items ? item.items.length : 0);
    var menuItems = (item.menu ? me.countItems(item.menu) : 0);
    return directItems + menuItems;
  }
});