Ext.define('gw.plugin.RegionSplitter', {
  extend: 'Ext.AbstractPlugin',
  alias: 'plugin.gsplitter',
  init: function (client) {
    //<debug warn>
    if (console) {
      console.warn('[Deprecated][gw.plugin.RegionSplitter] remove plugin and add split: true');
    }
    //</debug>
    client.split = true;
  }
});
