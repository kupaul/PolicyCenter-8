Ext.define('Gw.override.form.field.Base', {
  override: 'Ext.form.field.Base',

  hideEmptyLabel: true,
  labelSeparator: '', // do not add ':' after the label
  checkChangeBuffer: 0, // no delay

  /*
   * Override initLabelable to show empty labels that have required indicators (*)
   */
  initLabelable: function() {
    var me = this,
        padding = me.padding;

    if (me.getFieldLabel() == '' && !me.hideEmptyLabel && me.required) {
      me.setFieldLabel('&#160;');
    }

    me.callParent(arguments);

  },


  /**
   * Overrides default property in the constructor, so that it won't override the config from a component instance
   */
  constructor: function () {
    var me = this;

    me.labelWidth = gw.ext.Util.getLabelWidth();
    me.plugins = me.plugins || [];
    me.plugins.push({ptype: 'helperitem', pluginId: 'helper'});
    me.callParent(arguments);
  },

  // @SenchaUpgrade mimic the same method of Button. Remove when ExtJs supports tooltip for Text field
  setTooltip: function (tooltip, initial) {
    var me = this;

    if (me.rendered) {
      if (!initial || !tooltip) {
        me.clearTip();
      }
      if (tooltip) {
        if (Ext.quickTipsActive && Ext.isObject(tooltip)) {
          Ext.tip.QuickTipManager.register(Ext.apply({
              target: me.inputEl.id
            },
            tooltip));
        } else {
          me.inputEl.dom.setAttribute(me.getTipAttr(), tooltip);
        }
      }
    }
    me.tooltip = tooltip;

    return me;
  },

  // @SenchaUpgrade mimic the same method of Button. Remove when ExtJs supports tooltip for Text field
  getTipAttr: function () {
    return 'data-qtip';
  },

  // @SenchaUpgrade mimic the same method of Button. Remove when ExtJs supports tooltip for Text field
  clearTip: function () {
    var me = this,
      inputEl = me.inputEl;

    if (me.rendered) {
      if (Ext.quickTipsActive && Ext.isObject(me.tooltip)) {
        Ext.tip.QuickTipManager.unregister(inputEl);
      } else {
        inputEl.dom.removeAttribute(me.getTipAttr());
      }
    }
  },

  /**
   * Forces change handlers right away, and not to wait till blur
   */
  flushChange: function () {
    var me = this;
    if (me.gChangeOnBlur && me.gchanged) {
      me.gchanged = false;
      me.fireEvent('blurchange', me, me.newValueBlur, me.lastValueBlur);
    }
  },

  initComponent: function () {
    var me = this;
    var extraCls = '';

    if (me.item || me.altVal || me.prefix || me.suffix) {
      this.labelableRenderTpl = gw.ext.Util.getLabelableRenderTpl();
    }

    // @SenchaUpgrade add altVal to label rendering data
    if (me.altVal) {
      me.labelableRenderProps.push('altVal');
      me.labelableRenderProps.push('altId');
      me.altId = this.getInputId() + '_altFooter';
    }

    if (me.required) {
      me.cls = (me.cls ? me.cls + ' ' : '') + 'g-required';
    }

    //Todo: extjs upgrade4 set name attribute to be the id for testing
    if (me.name == null) {
      me.name = me.id;
    }
    me.callParent(arguments);

    if (me.invalid) {
      me.markInvalid(me.invalidText ? me.invalidText : ''); // use ExtJs default indicator
    }

    me.on({

      // when an form field is under a toolbar, make the label size by content:
      added: function (comp, container) {
        if (comp.fieldLabel && container instanceof Ext.toolbar.Toolbar) {
          // insert a separate label as sibling to size the label by content:
          var index = container.items.indexOf(comp);
          extraCls = comp.labelClsExtra;
          container.insert(index, {
            xtype: 'label',
            forId: comp.id,
            style: comp.labelStyle,
            cls: (Ext.isString(extraCls) ? extraCls : '') + ' ' + me.cls,
            html: comp.fieldLabel
          });

          comp.hideLabel = true; // hide the original label
        }
      },

      /**
       * Registers tooltip, if any, but only if the field isn't marked as invalid
       * @SenchaUpgrade Should we ask sencha to support tooltip on form field?
       */
      afterrender: function (field) {
        if (field.tooltip && !field.invalid) {
          field.setTooltip(field.tooltip, /*initial*/true);
        }
      },
      /**
       * Unregister tooltip, if any
       */
      beforedestroy: function (field) {
        field.clearTip();
      },
      /**
       * Keeps track if this field has focus.
       * If the field has focus, wait till BLUR before fire gw change event.
       */
      focus: gw.app.deferChangeTillBlur,
      /**
       * Determines whether to fire gw change event right away or wait till BLUR time.
       */
      change: function (comp, newValue, oldValue) {
        if (!comp.gChangeOnBlur) { // fire change right away, if the component doesn't have focus:
          comp.fireEvent('blurchange', comp, newValue, oldValue);
        } else { // tracks changed state, but don't fire gw change event yet:
          if (!comp.gchanged) {
            comp.gchanged = true; // value changed
            comp.lastValueBlur = oldValue; // track the last value
          }
          comp.newValueBlur = newValue; // track the new value
        }
      },
      /**
       * Fires gw change event, if the value has changed since FOCUS:
       */
      blur: function (comp) {
        if (comp.gchanged) {
          comp.gchanged = false;
          if (!comp.isEqual(comp.newValueBlur, comp.lastValueBlur)) {
            comp.fireEvent('blurchange', comp, comp.newValueBlur, comp.lastValueBlur);
          }
        }
        comp.gChangeOnBlur = false;
      },

      /**
       * AHK - 5/29/2013
       * We never want the regular tooltip to display at the same time as the error tooltip,
       * since they can overlap weirdly.  So if there's a tooltip, we want to unregister it when
       * the field is marked invalid, and re-register it when the field is valid again.
       * See PL-26189
       * @SenchaUpgrade
       */
      validitychange: function (comp, isValid) {
        if (comp.tooltip) {
          if (isValid) {
            comp.setTooltip(comp.tooltip, /*initial*/true);
          } else {
            comp.clearTip();
          }
        }
      },
      /**
       * Registers gw change handler when the field is changed and lost focus
       */
      blurchange: gw.app.onChange
    });
  },

  alignErrorIcon: function () {
    this.errorIcon.alignTo(this.getPositionEl(), 'tl-tr', [2, 0]);
  }
});
