// fire onChange event on click, if a checkbox or radio does not belong to a group
Ext.define('Gw.override.form.field.Checkbox', {
  override: 'Ext.form.field.Checkbox',

  initComponent: function () {
    var me = this;

    if (me.boxIcon) {
      me.beforeBoxLabelTextTpl =  Ext.String.format('<img style="vertical-align:middle;" height="{0}" width="{1}" src="{2}">',
                                                      me.iconHeight, me.iconWidth, me.boxIcon);
    }
    delete me.boxIcon;
    me.callParent(arguments);
    me.un('focus', gw.app.deferChangeTillBlur); // for checkbox and radio, no need to defer change event till blur

    me.on('added', function (comp, container) {
      // if this checkbox belongs to a group, do not handle change event on its own:
      if (container instanceof Ext.form.CheckboxGroup) {
        comp.un('blurchange', gw.app.onChange);
      }
    });
  }

});
