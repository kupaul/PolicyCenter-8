/**
 * Defines utility methods used for integration with external content. Public JavaScript methods defined under
 * "gw.api" package are usually safe to be invoked from outside of Guidewire codebase.
 *
 * For example,
 *
 *     var oldValue = gw.api.Util.getValue('MyPage:MyDV:MyField');
 *
 *     gw.api.Util.setValue('MyPage:MyDV:MyField', newValue);
 *
 * Or to set/get values in a batch mode,
 *
 *     var oldValues = gw.api.Util.getValues(['MyPage:MyField1', 'MyPage:MyField2']);
 *
 *     gw.api.Util.setValues({'MyPage:MyField1' : value1, 'MyPage:MyField1' : value2});
 *
 *
 * The above methods are typically invoked by content under PCF TemplatePanel, which automatically converts
 * a PCF element reference to its client side id for the JavaScript call. For example,
 *
 *
 *     <TemplatePanel>
 *
 *       <ReferencedWidget widget="colorCode"/>
 *
 *       <![CDATA[
 *         <script>
 *           function selectColor(color) {
 *             gw.api.Util.setValue('${colorCode}', color);
 *           }
 *         </script>
 *       ...
 *       ]]>
 *     </TemplatePanel>
 *
 *
 */
Ext.namespace('gw.api');

Ext.define('gw.api.Util', {

    /** @private */
    singleton: true,

    /**
     * Returns value of a DetailView Input element
     * @param {String} id Client id of the input element
     * @returns {String} The client side value of input element
     */
    getValue : function (id) {
      var comp = Ext.getCmp(id);
      return gw.ext.Util.getFieldValue(comp);
    },

    /**
     * Get values of multiple DetailView Input elements in a batch mode
     * @param {Array} ids Array of client ids
     * @returns {Array} an array of client side values of the given input elements
     */
    getValues : function (ids) {
      var me = this;
      if (Ext.isArray(ids)) {
        return Ext.Array.map(ids, function(id) {
          return me.getValue(id);
        });
      }

      return null;
    },

    /**
     * Sets the user value for a DetailView Input element.
     * @param {String} id Client id of the input element
     * @param {String} value The user value to set
     */
    setValue : function (id, value) {
      var comp = Ext.getCmp(id);
      gw.ext.Util.setValue(comp, value);
    },

    /**
     * Sets values for multiple DetailView input elements in a batch mode.
     * @param map A map with keys as client input element ids and values as the corresponding value to set
     */
    setValues : function (map) {
      var me = this;
      if (Ext.isObject(map)) {
        Ext.Object.each(map, function(key, value) {
          me.setValue(key, value);
        });
      }
    }
  }
);
