// Layout/container widget:

/**
 * A plugin to make the owning container to size to its content, and let only the outermost panel to scroll.
 * The owning container will have a single column layout, vertical flow, and child items stretched horizontally
 * to fill the width of the container.
 */
Ext.define('gw.plugin.ShrinkWrapLayout', {
  extend: 'Ext.AbstractPlugin',
  alias: 'plugin.glayout',

  /**
   * Overrides the owner container layout, before initComponent is invoked on the owning container.
   */
  constructor:function(config) {
    this.callParent(arguments);

    var container = config.cmp;
    Ext.apply(container, {
      layout:{
        columns:1,
        tableAttrs: {
          style: {width:'100%'}
        },
        type:'table'
      }
    });

    if (!container.defaultType || container.defaultType == 'panel') {
      container.defaultType = 'gcontainer'; //recursion
    }
  }
});

/**
 * A plugin similar to the gw.plugin.ShrinkWrapLayout, but renders each child item in a separate table column.
 */
Ext.define('gw.plugin.MultiColumnLayout', {
  extend: 'gw.plugin.ShrinkWrapLayout',
  alias: 'plugin.multicolumnlayout',
  constructor:function(config) {
    this.callParent(arguments);
    var container = config.cmp;

    Ext.apply(container.layout, {
           tdAttrs: {
             style : {"vertical-align" : "top"}
           }
         }
    );
    delete container.layout.columns; // allow multiple columns
  }
});

/**
 * An Ext container sizes to its content, and let only the outermost panel to scroll.
 * This container has a single column, vertical flow, and child items stretched horizontally to fill the width container.
 */
Ext.define('gw.StretchContainer', {
  extend:'Ext.container.Container',
  requires:'Ext.tab.Panel',
  alias:'widget.gcontainer',

  /**
   * Registers the plugin which handles sizing and layout
   */
  constructor: function() {
    this.plugins = this.plugins||[];
    this.plugins.push({ptype:'glayout'});
    return this.callParent(arguments);
  },

  initComponent: function() {
    var me = this;

    // mimic the panel logic, where the header is hidden if
    // the panel is one of the tab in a tab panel
    me.on({
      added: function(comp, container) {
        if (container instanceof Ext.tab.Panel && container.removePanelHeader) {
          if (me.items && me.items.length > 0 && me.items.get(0).xtype == 'header') {
            var header = me.items.removeAt(0);
            header.ownerCt = null; // prevents remove() call on owner by Ext.destroy()
            Ext.destroy(header);
          }
        }
      }
    });

    me.callParent(arguments);

    // include the toolbar, and disable toolbar overflow:
    if (me.tbar) {
      me.shrinkWrapDock = true;
      me.shrinkWrap = true;
      me.insert(0, Ext.apply(me.tbar, {xtype:'toolbar', layout:'hbox'}))
    }
    // include the header as the very first child:
    if (me.title || me.tools) {
      me.insert(0, {
        xtype:'header',
        cls: me.ui == 'page' ? 'g-page-header' : 'g-panel-header',
        title:me.title,
        tools:me.tools
      });
    }
  }
});


/**
 * An Ext container that renders each child in a separate table column.
 */
Ext.define('gw.columns', {
  extend: 'Ext.container.Container',
  alias: 'widget.gcolumns',
  border: false,
  constructor: function() {
    this.plugins = this.plugins||[];
    this.plugins.push({ptype:'multicolumnlayout'});
    return this.callParent(arguments);
  },
  initComponent: function() {
    if (this.divider) {
      this.cls = [this.cls || '', 'g-divider'].join(' ')
    }
    this.callParent(arguments);
  }
});

Ext.define('gw.dvcolumn', {
  extend: 'gw.StretchContainer',
  alias: 'widget.dvcolumn',
  border : false,
  frame : false,
  cls : 'g-dv-column',
  divider : true,

  initComponent:function () {
    if (!this.divider) {
      this.cls = [this.cls, 'g-no-divider'].join(' ')
    }
    this.callParent(arguments);
  }
});
