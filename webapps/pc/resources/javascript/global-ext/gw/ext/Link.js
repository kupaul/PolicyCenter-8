/**
 * An anchor that calls server on click
 */
Ext.define('gw.ext.Link', {
  extend: 'Ext.Component',
  alias: 'widget.glink',
  cls: 'g-link', // default cls
  disabledCls: '', // show link without action as plain text

  initComponent: function () {
    this.autoEl = {
      tag: this.disabled ? 'span' : 'a',
      id: this.id,
      href: this.disabled ? undefined : 'javascript:void(0)',
      cls: this.cls, //gw.app.getEventSourceCls(),
      cn: this.iconCls ? {
        tag: 'img',
        src: Ext.BLANK_IMAGE_URL,
        cls: 'x-panel-inline-icon ' + this.iconCls
      } : this.icon ? {
        tag: 'img',
        src: this.icon
      } : undefined,
      html: this.text
    };

    if (this.eventId) {
      this.autoEl.eventId = this.eventId
    }
    if (this.eventParam) {
      this.autoEl.eventParam = this.eventParam
    }

    if (this.tooltip) {
      this.autoEl['data-qtip'] = Ext.util.Format.htmlEncode(this.tooltip);
    }

    this.disabled = undefined; // remove "disabled" property to prevent grayed-out look for a Link without action

    this.callParent(arguments);
  },

  /**
   * Mimics the same function of ext Button, used for underlying shortcut key in the link text
   */
  setText: function (text) {
    text = text || '';
    var me = this,
      oldText = me.text || '';

    if (text != oldText) {
      me.text = text;
      if (me.rendered) {
        me.getEl().update(text || '&#160;');
        me.updateLayout();
      }
      me.autoEl.html = me.text;
    }
    return me;
  },

  /**
   * Registers click handler, after DOM is rendered
   */
  afterRender: function () {
    this.callParent(arguments);
    if (this.autoEl.tag == 'a') {
      var e = this.getEl();
      if (e) {
        e.on('click', function (evt) {
          gw.app.handleCompAction(this, evt)
        }, this, {stopEvent: true})
      }
    }
  }

});

