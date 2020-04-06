/**
 * When a combobox is opened, the typeAhead function is scheduled to execute with a delay.
 * If you open a combobox inside a grid editor and quickly switch to another row, the previous will be destroyed, leaving
 * the typeAhead task still running. This produces an error, since the typeAhead function will run on a
 * destroy combo.
 *
 * To fix this, let's make sure the task is canceled when we destroy the grid.
 *
 * Sencha 06/21/13
 * Submitted to the framework EXTJSIV-10337
 */
Ext.define('Gw.override.form.field.ComboBox', {
  override: 'Ext.form.field.ComboBox',

  initComponent: function () {
    var me = this;
    me.on({
      select: function (comp) {
        // force change handler on select:
        comp.flushChange()
      }
    });
    me.callParent(arguments);
  },

  /**
   * Work around ext bug where combo may be expanded when nothing is typed in (when alt or ctrl key is on)
   */
  onKeyUp: function (e) {
    if (e.ctrlKey || e.altKey) {
      Ext.form.ComboBox.superclass.onKeyUp.call(this, e)
      return false; // do not invoke combo function
    }
    this.callOverridden(arguments)
  },

  onDestroy: function () {
    var me = this;

    if (me.typeAheadTask) {
      me.typeAheadTask.cancel();
    }

    me.callParent(arguments);
  }
})