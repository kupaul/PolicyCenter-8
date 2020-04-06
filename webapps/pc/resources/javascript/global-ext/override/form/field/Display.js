Ext.define('Gw.override.form.field.Display', {
  override: 'Ext.form.field.Display',

  initComponent: function () {
    var me = this;
    // This is mainly for multi-select in read only mode but might be used for other things
    if (Ext.isArray(me.value)) {
      var newValue = [];
      // this is an array so parse the array and set the value to a string for that
      for (var i = 0; i < me.value.length; i++) {
        if (me.value[i].preHtml) {
          newValue.push(me.value[i].preHtml);
        }
        if (me.value[i].value) {
          newValue.push(me.value[i].value);
        }

        if (me.value[i].postHtml) {
          newValue.push(me.value[i].postHtml);
        }
      }
      delete me.value;
      me.value = newValue.join('<br>');
    }
    me.callParent(arguments);
  }
});
