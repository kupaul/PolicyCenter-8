/**
 * By default splitter has 5px. Make it wider with 9px
 */
Ext.define('Gw.override.resizer.Splitter', {
  override: 'Ext.resizer.Splitter',

  beforeRender: function () {
    this.callParent(arguments);
    this[this.vertical ? 'width' : 'height'] = 9;
  }
});