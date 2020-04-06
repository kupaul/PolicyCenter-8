Ext.define('Gw.override.form.field.Date', {
  override: 'Ext.form.field.Date',
  cls: 'g-date-picker',

  // check the submit value first to prevent formatting javascript error. If it's not valid, still
  // send back the value to let server side handle the validation.
  // @SenchaUpgrade override private method. TODO: Handle invalid client side value in general.
  getSubmitValue: function () {
    var me = this;
    if (!me.isValid()) {
      return me.getValue() || me.getRawValue();
    }
    return me.callParent(arguments);
  }
});
