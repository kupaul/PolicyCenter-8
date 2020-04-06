/**
 * Override default implementation to unbox field value
 */
Ext.define('Gw.override.util.Grouper', {
  override: 'Ext.util.Grouper',

  getGroupString: function (instance) {
    var value = instance.get(this.property);
    return (value && value.text != undefined) ? value.text : value;
  }
});