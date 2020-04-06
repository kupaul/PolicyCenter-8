Ext.define('gw.ext.Button', {
    extend: 'Ext.button.Button',
    alias: 'widget.gbutton',

    // Allows button to be delegate of click event by default:
    listeners : { click : gw.app.onCompAction},
    initComponent : function() {
      var me = this,
          imgText;

      if (me.icon && !me.text) {
        // for icon only button, use nested image instead of background image, in order to auto size the image
        me.cls = (me.cls ? me.cls + ' ' : '') + 'g-icon-button'
        imgText = '<img src="' + me.icon;
        if (me.iconWidth) {
          imgText = imgText + ' width="' + me.iconWidth + '" height="' + me.iconHeight + '"'
        }
        imgText = imgText + '"/>';
        me.text = imgText;
        delete me.icon
      }

      if (Ext.isString(me.handler)) { // convert string to JS function
        me.ghandler = me.handler;
        me.handler = function() {eval(me.ghandler)}
      }

      me.callParent(arguments);

      if (me.buttonFlags) {
        me.disable();
      }
    }
});
