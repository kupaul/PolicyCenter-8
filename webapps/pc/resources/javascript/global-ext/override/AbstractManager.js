/**
 * @SenchaUpgrade
 * Minor performance tuning for Ext.
 *
 * Instead of using this.all.remove(item);, which will invoke findKey by value (loop)
 * through all the collection), we use getKey and then removeAtKey.
 */
Ext.define('Gw.override.AbstractManager', {
  override: 'Ext.AbstractManager',
  unregister: function (item) {
    // Old
    // this.all.remove(item);

    // New
    var all = this.all;
    all.removeAtKey(all.getKey(item));
  }
});