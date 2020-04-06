Ext.define('gw.ext.ReadonlySelect', {
  extend: 'Ext.form.field.Display',
  alias: 'widget.readonlyselect',

  initComponent: function () {
    if (this.store) {
      var modelId = 'g-model-ReadonlySelect';
      if (!Ext.ModelManager.getModel(modelId)) {
        Ext.define(modelId, {
          extend: 'Ext.data.Model',
          fields: ['value', 'text']
        });
      }
      this.store = Ext.create('Ext.data.ArrayStore', {
        autoDestroy: true,
        'id': 0,
        model: modelId,
        data: this.store
      });
    }
    this.callParent(arguments);
  },
  setValue: function (value) {
    var copy_arg = Ext.Array.clone(arguments);
    if (value && this.store) {
      var index = this.store.findExact('value', value)
      if (index != -1) {
        value = this.store.getAt(index).get('text');
      }
      copy_arg[0] = value;
    }
    this.callParent(copy_arg);
  },
  getValue: function () {
    var value = this.callParent(arguments);
    if (this.store) {
      var index = this.store.findExact('text', value)
      if (index != -1) {
        value = this.store.getAt(index).get('value');
      }
    }
    return value
  }
});
