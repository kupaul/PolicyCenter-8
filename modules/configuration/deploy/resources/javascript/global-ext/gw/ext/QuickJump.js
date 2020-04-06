/**
 * Extends auto-complete with ENTER key behavior
 */
Ext.define('gw.ext.QuickJump', {
  extend: 'gw.ext.AutoComplete',
  alias: 'widget.quickjump',
  shortcut: '/',
  typeAhead: true,
  typeAheadDelay: 10,
  queryDelay: 10,

  initComponent: function () {
    this.emptyText = gw.app.localize('Web.QuickJump') + ' (Alt+/)'
    this.callParent(arguments);
    /**
     * call server when the ENTER key is pressed
     */
    this.on('specialkey', function (field, e) {
      if (e.getKey() == e.ENTER) {
        // select the highlighted item first if there is any
        if (this.listKeyNav) {
          this.listKeyNav.selectHighlighted(e);
        }
        // post to server
        gw.app.handleAction(e, field.getEl().dom,
          {postCallback: function () {
            field.clearValue()
          }, postCallbackScope: field})
      }
    });
  }
});
