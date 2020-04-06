/**
 * A labellable container which contains a Grid panel. Supported properties:
 * <li> fieldLabel
 * <li> labelAlign: top or left
 * <li> hideLabel
 * <li> labelWidth
 * <li> labelCls
 * <li> labelStyle
 * <li> colspan (pass-through)
 */
Ext.define('gw.form.LvInput', {
  extend: 'Ext.container.Container',
  alias: 'widget.glvinput',

  layout: {
    type: 'table',
    tableAttrs: {
      style: {width: '100%'}
    }
  },

  constructor: function () {
    var me = this;
    me.labelWidth = gw.ext.Util.getLabelWidth();
    me.callParent(arguments);
  },

  initComponent: function () {
    var me = this;

    this.layout.columns = (this.labelAlign === 'top' || this.hideLabel) ? 1 : 2;

    if (!this.hideLabel) { // insert a label component as the first child item:
      var theLabel = [
        {
          xtype: 'label',
          html: this.fieldLabel,
          style: this.labelStyle,
          cls: this.labelCls,
          tdAttrs: {
            width: this.labelWidth,
            style: {'vertical-align': 'top'}
          }
        }
      ];
      if (this.items) {
        Ext.Array.insert(this.items, 0, theLabel);
      } else {
        this.items = theLabel;
      }
    }

    this.callParent(arguments);
  }

});
