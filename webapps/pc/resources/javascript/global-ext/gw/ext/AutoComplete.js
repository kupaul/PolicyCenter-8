/**
 * A textbox with auto-complete suggetions
 */
Ext.define('gw.ext.AutoComplete', {
  extend: 'Ext.form.ComboBox',
  alias: 'widget.autocomplete',
  minChars: 0,
  typeAhead: true,
  hideTrigger: true,// hide dropdown arrow
  forceSelection: false,
  triggerAction: 'query',

  defaultListConfig: {loadingText: ''},// hide loading text
  valueField: 'text', // default value field

  /**
   * <li>Sets up store with special data loading
   * <li>If "displayField" is specified, don't ever set it into the textbox, since it may contain HTML tags
   */
  initComponent: function () {
    // do not allow displayField to differ from valueField, otherwise the displayField will be set into the textbox
    this.textField = this.displayField;
    this.displayField = this.valueField;
    this.getInnerTpl = function () {
      return '<tpl for="."><div class="x-combo-list-item">{' + (this.textField || this.displayField) + '}</div></tpl>';
    };

    // since all elements in BoundList come htmlesacped from the server - it makes sense to decode them while putting back
    // in text input
    this.displayTpl = new Ext.XTemplate(
      '<tpl for=".">' +
        '{[typeof values === "string" ? values : Ext.String.htmlDecode(values["' + this.displayField + '"])]}' +
        '<tpl if="xindex < xcount">' + this.delimiter + '</tpl>' +
        '</tpl>'
    );

    if (!this.modelId) { // default model config
      this.modelId = 'g-model-autocomplete';
      if (!Ext.ModelManager.getModel(this.modelId)) {
        Ext.define(this.modelId, {
          extend: 'Ext.data.Model',
          fields: [this.valueField]
        });
      }
    }

    // set up the store fields before instanciate the store (i.e., before calling super):
    this.store = { model: this.modelId };

    // @SenchaUpgrade workaround ExtJs bug where xtype in the store config is ignored:
    this.store = Ext.create('gw.ModelStore', this.store);

    this.callParent(arguments);

    // sets up model info after the store is instanciated
    this.store.setModelId(this.eventParam || this.id, this.argWidgets);

    /**
     * Do not cache query result, if the query depends on additional args
     * @param evt query event
     */
    this.on('beforequery', function (evt) {
      if (evt.combo.argWidgets) {
        delete evt.combo.lastQuery;
      }
    })
  },

  // override getSubmitValue so it returns empty string instead of null when the field is set empty
  getSubmitValue: function () {
    var submitValue = this.callOverridden(arguments);
    return (submitValue != null) ? submitValue : this.getRawValue();
  }
});

