/** fix encoding and submitting multiple values to server */
Ext.define('Gw.override.ux.form.MultiSelect', {
  override: 'Ext.ux.form.MultiSelect',

  // set the delimiter to null so getSubmitValue will return as an array instead of string
  delimiter: null,
  layout: 'autocontainer',
  listConfig: {
    tpl: new Ext.XTemplate(
      '<ul class="' + Ext.plainListCls + '"><tpl for=".">',
        '<li role="option" unselectable="on" class="x-boundlist-item">{field2:htmlEncode}</li>', // fix encoding of special character
      '</tpl></ul>'
    )
  },

  initComponent: function () {
    var me = this;
    me.value = gw.ext.Util.decodeValue(me.value);
    me.callParent(arguments);
    // need to set the name otherwise the form value will not be recorded
    if (me.name == null) {
      me.name = me.id;
    }
    var lWidth = (me.labelAlign == 'top') ? 0 : me.labelWidth;
    me.width = (me.inputWidth) ? lWidth + me.inputWidth : lWidth + 194;
    if (me.boundList) {
      me.boundList.maxHeight = 120;
    }
    // workaround the sencha bug for not changing the css class when the field is marked as invalid.
    // (http://www.sencha.com/forum/showthread.php?233404)
    me.checkForInvalid(me.invalid);

    me.on('change', gw.app.onChange);
    me.on('validitychange', function(mselect, valid) {
      var invalid = (valid !== undefined) ? !valid : false;
      me.checkForInvalid(invalid);
    });
  },

  checkForInvalid: function (isInvalid) {
    var me = this;
    if (isInvalid) {
      me.addCls('gw-multiselect-invalid');
    } else {
      me.removeCls('gw-multiselect-invalid');
    }
  }
});
