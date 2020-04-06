/**
 * A custom data view that displays Web Messages
 */
Ext.define('gw.model.MsgModel', {
  id: 'msgModelId',
  extend: 'Ext.data.Model',
  fields: ['cls', 'text', 'linkText', 'details', 'entryKey', 'refId', 'iconCls']
});
