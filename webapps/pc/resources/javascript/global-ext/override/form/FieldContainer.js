Ext.define('Gw.override.form.FieldContainer', {
  override: 'Ext.form.FieldContainer',

  hideEmptyLabel: true,
  labelSeparator: '', // do not add ':' after the label

  // adding table layout to avoid flow drop
  layout: {
    type: 'table'
  },

  constructor: function () {
    var me = this;
    me.labelWidth = gw.ext.Util.getLabelWidth();
    me.plugins = me.plugins || [];
    me.plugins.push({ptype: 'helperitem', pluginId: 'helper'});
    return me.callParent(arguments);
  },

  initComponent: function () {
    var me = this;

    if (me.gDateCriterion) {
      me.cls = me.cls || '';
      me.cls = gw.ext.Util.appendCls(me.cls, 'g-dateCriterion');
      // The date field labels in Date Criterion widget are too long
      // Todo: Extending container to create a dateCriterion widget is probably cleaner
      Ext.iterate(me.items, function (item, index) {
        if (item.xtype == 'choice') {
          for (var i = 0; i < item.items.length; i++) {
            item.items[i].labelWidth = 80;
          }
        }
      });
    }

    if (me.required) {
      me.cls = me.cls || '';
      me.cls = gw.ext.Util.appendCls(me.cls, 'g-required');
      if (me.getFieldLabel() == '' && !me.hideEmptyLabel) {
        me.setFieldLabel('&#160;');
      }
    }

    me.callParent(arguments);

    if (me.vertical) {
      me.layout.columns = 1;
    }

    me.on('beforeRender', function () {
      if (me.item) {
        me.add({
          xtype: 'container',
          style: 'margin-bottom: 2px;',
          html: me.afterContainer
        });
      }
    });
  }
});
