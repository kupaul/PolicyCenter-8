Ext.define('Gw.override.form.field.Text', {
  override: 'Ext.form.field.Text',

  shrinkWrap: 1, // adjust for width only

  getFieldStyle: function () {
    return (this.suffix || this.prefix ? '' : 'width:100%;') + (Ext.isObject(this.fieldStyle) ? Ext.DomHelper.generateStyles(this.fieldStyle) : this.fieldStyle || '');
  },

  initComponent: function () {
    var me = this;
    if (me.regex && Ext.isString(me.regex)) {
      me.regex = eval(me.regex);
    }
    if (me.gNumCols) {   // The size of the text field in characters
      me.inputWidth = me.gNumCols * 8;   // Convert to number of pixels
    }
    me.callParent(arguments);
  },

  hasAltValue: function () {
    return this.altVal !== undefined ? true : false;
  },

  setAltValue: function (text, value) {
    var me = this;
    if (me.hasAltValue()) {
      me.altVal = text;
      var altValEl = me.el.down('.g-form-altVal');
      altValEl.update(text);
      altValEl.dom.setAttribute('value', value);
    }
  }
});
