/**
 * A simple combo box like a HTML select element.
 * Overrides super to
 * <li>Proper encoding for combo box option label. (No HTML is allowed in option label, as of HTML Select)
 * <li>Support option group label
 */
Ext.define('gw.ext.SimpleCombo', {
  extend: 'Ext.form.ComboBox',
  alias: 'widget.simplecombo',
  typeAhead: true,
  forceSelection: true, // do not allow arbitrary user input
  matchFieldWidth: false, // allow the pull-down menu to auto size
  listConfig: {
    tpl: new Ext.XTemplate(
      '<ul class="' + Ext.plainListCls + '"><tpl for=".">',

      // option group label:
      '<tpl if="this.field3 != values.field3">',
      '<tpl exec="this.field3 = values.field3"></tpl>',
      '<h1>{field3}</h1>',
      '</tpl>',

      '<li role="option" class="x-boundlist-item">{field2:htmlEncode}</li>', // fix encoding of special character
      '</tpl></ul>'
    )
  },

  initComponent: function () {
    // create group field:
    if (Ext.isArray(this.store)) {
      this.queryMode = 'local';
      this.valueField = 'field1';
      this.displayField = 'field2';
      this.groupField = 'field3';

      var modelId = 'g-combo-model';
      // define an explicit model for the arry store:
      if (!Ext.ModelManager.getModel(modelId)) {
        Ext.define(modelId, {
          extend: 'Ext.data.Model',
          fields: [this.valueField, this.displayField, this.groupField]
        });
      }

      this.store = Ext.create('Ext.data.ArrayStore', {
        autoDestroy: true,
        model: modelId,
        data: this.store
      });
    }

    this.callParent(arguments);

    // showNoneSelected=false:
    if (this.value == "" && this.store.getCount() > 0 && this.store.findExact(this.valueField, this.value) < 0) {
      this.setValue(this.store.getAt(0).get(this.valueField)); // select the first option
    }
  },

  initEvents: function () {
    var me = this;
    me.callParent();

    // select cell text and open menu, when clicking on a bounded combo field:
    me.mon(me.inputEl, 'click', function () {
      me.selectText();
      me.onTriggerClick()
    });
  }
});

