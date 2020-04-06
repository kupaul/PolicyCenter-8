Ext.define("Gw.override.form.Labelable", {
  override: 'Ext.form.Labelable',
  requires: ['Ext.XTemplate'],

  /*
   * make label selectable
   */
  getLabelCls: function () {
    var me = this,
        labelCls = me.labelCls, // + ' ',  + Ext.dom.Element.unselectableCls,
        labelClsExtra = me.labelClsExtra;

    return labelClsExtra ? labelCls + ' ' + labelClsExtra : labelCls;
  }

});
