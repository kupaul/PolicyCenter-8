Ext.define('gw.WebMsgs', {
  extend: 'Ext.view.View',
  alias: 'widget.webmsgs',

  tpl: new Ext.XTemplate(
    '<tpl for=".">',
    '<div class="{cls}">',
    '<img class="{iconCls}" src="', Ext.BLANK_IMAGE_URL, '">',
    '<tpl if="linkText">{text} </tpl>', // write text outside link, if the link has its own text
    '<tpl if="entryKey"><a entryKey="{entryKey}"></tpl>', // link START
    '<tpl if="refId"><a refId="{refId}"></tpl>',          // link START
    '{linkText}',
    '<tpl if="!linkText">{text}</tpl>',
    '<tpl if="entryKey||refId"></a></tpl>',               // link END
    '<tpl if="details"><div class="error_details">{details}</div></tpl>', // more details
    '</div>',
    '</tpl>'
  ),

  itemSelector: 'a', // handles click on anchors

  listeners: {
    itemclick: function (dv, record, htmlElem) {
      var entryKey = htmlElem.getAttribute('entryKey')
      if (entryKey) {
        gw.app.handleAction(null, this.id, {param: entryKey})
      } else {
        gw.app.handleAction(null, htmlElem.getAttribute('refId'))
      }
    }
  },

  /**
   * Applies default store configs before init comp
   */
  initComponent: function () {
    var storeConfig = {
      storeId: this.id,
      model: 'gw.model.MsgModel',
      xtype: 'modelstore'
    };

    if (!this.store) {
      this.store = storeConfig
    } else {
      Ext.apply(this.store, storeConfig)
    }

    this.callParent(arguments);
  }
});
