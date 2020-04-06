Ext.define('gw.ext.FieldSet', {
  extend: 'Ext.form.FieldSet',
  alias: 'widget.gfieldset',


  initComponent: function() {
    var me = this;
    if (me.title && me.icon) {
      me.title = '<div style="padding-left:20px; background: no-repeat url(\'' + me.icon + '\')">' + me.title + '</div>';
    }
    me.callParent(arguments);
  },

  // fix the value and id for checkbox
  createCheckboxCmp: function () {
    var cb = this.callParent(arguments);
    cb.inputValue = 'true';
    cb.inputId = cb.name;
    return cb;
  },

  // @SenchaUpgrade override ExtJs private method to support confirm dialog (async) and load content from server when expanding
  onCheckChange: function (cmp, checked) {
    var newValue = this.checkboxCmp.getValue();
    var firstTimeExpand = false;
    if (this.checkboxCmp.getValue() && this.items.length == 0) {
      // need to load content from server when expanded for the first time
      firstTimeExpand = true;
    }
    gw.app.handleChange(this, newValue, !newValue, function (options, success, response) {
      // checking postedToServer to determine if separate request should be made.
      // loading content of the inputGroup will be part of poc if postOnChange is specified.
      if (firstTimeExpand &&
        (!options || (options && !options.postedToServer))) {
        // Makes a separate call to just expand the inputGroup if there was no post to server.
        var params = {};
        params[this.checkboxName] = this.checkboxCmp.inputValue;
        gw.app.requestViewRoot(this.id, params)
      }
      // invoke super
      Ext.form.FieldSet.prototype.onCheckChange.call(this, cmp, checked);
      // @SenchaUpgrade workaround an ExtJs4.2 bug that hierarchyState.collapsed is out of date:
      if (this.hierarchyState) {
        this.hierarchyState.invalid = true
      }
    }, firstTimeExpand ? {firstTimeExpand: true} : undefined)
  }
});
