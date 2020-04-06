/** Customize shuttle widget, and fix its ecoding and from submit behavior: */
Ext.define('Gw.override.ux.form.ItemSelector', {
  override: 'Ext.ux.form.ItemSelector',

  delimiter: null, // set the delimiter to null so getSubmitValue will return as an array instead of string
  buttons: ['add', 'remove'],

  initComponent: function () {
    var me = this;
    me.value = gw.ext.Util.decodeValue(me.value);
    me.buttonsText.add = gw.app.localize("ExtJS.Ux.Form.ItemSelector.Add");
    me.buttonsText.remove = gw.app.localize("ExtJS.Ux.Form.ItemSelector.Remove");
    me.suspendCheckChange++;  //suspend change event during bindStore in initComp so checkForInvalid would work
    me.callParent(arguments);
    me.suspendCheckChange--;
    // this is for the test, apparently valueField is only set at ItemSelector but not fromField and toField.
    // fromField.valueField and toField.valueField are used in TestExt.js
    me.fromField.valueField = me.valueField;
    me.toField.valueField = me.valueField;
    var lWidth = (me.labelAlign == 'top') ? 0 : me.labelWidth;
    me.width = (me.inputWidth) ? lWidth + me.inputWidth : lWidth + 420;
    me.fromField.boundList.height = me.toField.boundList.height = 120;
  }
});
