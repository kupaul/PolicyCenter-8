Ext.define('gw.model.TreeModel', {
  extend: 'Ext.data.Model',
  fields: ['disabled', 'text', 'selected']  // add fields to handle "disabled" node
});
