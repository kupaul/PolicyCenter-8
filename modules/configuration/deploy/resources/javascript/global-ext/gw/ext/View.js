/**
 * View port for the app. Config properties:
 * <li> links - tabbar links (e.g. Logout)
 * <li> tabs - tabs in the tabbar
 * <li> infoBar - info bar
 * <li> west - left nav content
 * <li> center - main page content
 * <li> south - work space content
 */
Ext.define('gw.ext.View', {
  extend: 'Ext.container.Viewport',
  alias: 'widget.gview',
  constructor: function (config) {

    /**
     * Updates the worksheet count in the workspace title bar
     * @param southPanel workspace panel
     */
    function updateWorksheetCount(southPanel) {
      //@SenchaUpgrade: TODO Is it a Sencha bug that add/remove listeners are called on the Tab not the TabPanel sometimes?
      if (southPanel.xtype == 'tabpanel') {
        // TODO - localize and create a display key:
        southPanel.setTitle('Workspace (' + southPanel.items.getCount() + ')');
      }
    }

    var northConfig = {
      xtype: 'gnorthpanel',
      links: config.links,
      tabs: config.tabs,
      QuickJump: config.QuickJump,
      infoBar: config.infoBar,
      hidden: !config.links && !config.tabs && !config.infoBar && !config.QuickJump
    };

    var westConfig = {
      xtype: 'gwestpanel'
    };

    if (config.west) {
      westConfig.hidden = false;
      Ext.apply(westConfig, config.west);
    }

    var centerConfig = Ext.apply({
      xtype: 'gcenterpanel'
    }, config.center);

    var southConfig = {
      border: false,
      collapsible: true,
      height: 400,
      hidden: true,
      id: 'southPanel',
      region: 'south',
      hideCollapseTool: true,     // only collapse south panel thru the splitter
      floatable: true,           // allow floating by clicking on title bar
      header: false,              // do not show title bar when the workspace is expanded (by default, title bar shows up when minimized)
      headerPosition: 'bottom',   // show header at the bottom when collapsed
      stateful: true,
      stateId: 'gw-workspace',
      listeners: {
        // @SenchaUpgrade workaround ExtJs bug when hide() is called when the southPanel is floated
        beforehide: function () {
          var me = this;
          if (me.floated) {
            me.slideOutFloatedPanel();
          }
        },
        add: updateWorksheetCount,
        remove: updateWorksheetCount,
        beforeshow: updateWorksheetCount
      },
      split: true,
      defaults: {
        autoScroll: true // allow worksheet to scroll
      },
      xtype: 'tabpanel'
    };

    if (config.south) {
      southConfig.hidden = false;
      Ext.apply(southConfig, config.south);
    }

    this.callParent([
      {
        layout: 'fit',
        items: {
          xtype: 'container',
          id: 'mainform',
          layout: 'border',
          items: [northConfig, westConfig, centerConfig, southConfig]
        }
      }
    ]);
  }
});
