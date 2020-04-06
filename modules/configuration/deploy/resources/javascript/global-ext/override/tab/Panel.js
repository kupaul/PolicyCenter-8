// TODO: change to gTabPanel
Ext.define('Gw.override.tab.Panel', {
  override: 'Ext.tab.Panel',

  shrinkWrap: true,
  shrinkWrapDock: true,

  defaultType: 'gcontainer' // recursion
});
