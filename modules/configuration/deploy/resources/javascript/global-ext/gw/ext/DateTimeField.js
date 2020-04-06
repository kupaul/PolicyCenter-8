/*
 * DateTime field extension
 * Original code from Sencha community forum:
 * http://www.sencha.com/forum/showthread.php?137242-Ext.ux.DateTimeField-DateTimePicker-for-ext4-also-DateTimeMenu-TimePickerField
 *
 * Note: These classes have been customized. In particular, no need to override the height style and initializing the
 * spinner field did not work in the original.
 *  update Ext - 4.1 2012/04/27
 */

/**
 * Time picker field. Hour/minute spinner fields for selecting hour/minutes.
 *
 * TODO tpollinger PL-17741: We need to format the time picker by AM/PM based on user's local.
 */
Ext.define('gw.ext.TimePickerField', {
    extend: 'Ext.form.field.Base',
    alias: 'widget.utimepicker', // prefix ux class with "u" to avoid conflict with base ExtJs class
    alternateClassName: 'Ext.form.field.TimePickerField',
    requires: ['Ext.form.field.Number'],

    // hidden basefield's input
    inputType: 'hidden',

    style: 'padding:4px 0 0 0;margin-bottom:0px',

    twelveHourMode: true,

    amSymbol: 'AM',

    pmSymbol: 'PM',

    /**
     * @cfg {String} value
     * initValue, format: 'H:i:s'
     */
    value: null,

    /**
     * @cfg {Object} spinnerCfg
     *  number input config
     */
    spinnerCfg: {
        width: 45
    },

    /** Override. */
    initComponent: function () {
        var me = this;
        // value already passed in from DateTimePicker
        //me.value = me.value || Ext.Date.format(new Date(), 'H:i:s');

        me.callParent(arguments);// called setValue

        me.spinners = [];

        me.amPmStore = Ext.create('Ext.data.Store', {
          fields: ['code', 'value'],
          data: [
            {'code': 'am', 'value': me.amSymbol},
            {'code': 'pm', 'value': me.pmSymbol}
          ]
        });



        var cfg = Ext.apply({}, me.spinnerCfg, {
            readOnly: me.readOnly,
            disabled: me.disabled,
            style: 'float: left',
            listeners: {
                change: {
                    fn: me.onSpinnerChange,
                    scope: me
                }
            }
        });

      var comboConfig = Ext.apply({}, {
        width: 50
      }, {
        readOnly: me.readOnly,
        disabled: me.disabled,
        style: 'float: left',
        listeners: {
            'select': me.onComboChange,
            'collapse': me.onComboChange,
            scope: me
        }
      });


      me.hoursSpinner = Ext.create('Ext.form.field.Number', Ext.apply({}, cfg, {
          minValue: me.twelveHourMode ? 1 : 0,
          maxValue: me.twelveHourMode ? 12 : 23
      }));
      me.minutesSpinner = Ext.create('Ext.form.field.Number', Ext.apply({}, cfg, {
          minValue: 0,
          maxValue: 59
      }));
      me.amPmCombo = Ext.create('Ext.form.ComboBox', Ext.apply({}, comboConfig, {
        store: me.amPmStore,
        displayField: 'value',
        valueField: 'code'
      }));

      me.spinners.push(me.hoursSpinner, me.minutesSpinner);

    },
    /**
     * @private
     * Override.
     */
    onRender: function () {
        var me = this, spinnerWrapDom, spinnerWrap;
        me.callParent(arguments);

        // render to original BaseField input td
        // spinnerWrap = Ext.get(Ext.DomQuery.selectNode('div', this.el.dom)); // 4.0.2
        spinnerWrapDom = Ext.dom.Query.select('td', this.getEl().dom)[1]; // 4.0 ->4.1 div->td
        spinnerWrap = Ext.get(spinnerWrapDom);
        me.callSpinnersFunction('render', spinnerWrap);

        if (me.twelveHourMode){
          me.callComboFunction('render', spinnerWrap);
        }

        Ext.core.DomHelper.append(spinnerWrap, {
            tag: 'div',
            cls: 'x-form-clear-left'
        });

        this.setRawValue(this.value);
    },

    _valueSplit: function (v) {
        if (Ext.isDate(v)) {
            v = Ext.Date.format(v, 'H:i');
        }
        var split = v.split(':');
        return {
            h: split.length > 0 ? split[0] : 0,
            m: split.length > 1 ? split[1] : 0
        };
    },
    onSpinnerChange: function (s, e) {
        if (!this.rendered) {
            return;
        }
        this.fireEvent('change', this, this.getValue(), this.getRawValue());
    },
    onComboChange: function(a,b,c,d){
      if (!this.rendered) {
        return;
      }
      this.fireEvent('change', this, this.getValue(), this.getRawValue());
    },
    // , call each spinner's function
    callSpinnersFunction: function (funName, args) {
      for (var i = 0; i < this.spinners.length; i++) {
          this.spinners[i][funName](args);
      }
    },
    callComboFunction: function(funName, args){
      this.amPmCombo[funName](args);
    },
    // @private get time as object,
    getRawValue: function () {
        if (!this.rendered) {
            var date = this.value || new Date();
            return this._valueSplit(date);
        } else {
          if(this.twelveHourMode){
            var a = this.amPmCombo.getValue();
            var spinnerH = this.hoursSpinner.getValue();
            var realH = spinnerH;


            if (a === 'am' && spinnerH === 12){
              realH = 0;
            }else if (a === 'pm' && spinnerH != 12){
              realH += 12;
            }

            return {
              h: realH,
              m: this.minutesSpinner.getValue()
            }
          }

          return {
              h: this.hoursSpinner.getValue(),
              m: this.minutesSpinner.getValue()
          };
        }
    },

    // private
    setRawValue: function (value) {
        value = this._valueSplit(value);
        if (this.hoursSpinner) {
          if (this.twelveHourMode){
            value.h >= 12 ? this.amPmCombo.setValue(this.pmSymbol) : this.amPmCombo.setValue(this.amSymbol);
            if (value.h === 0){
              this.hoursSpinner.setValue(12);
            }else if (value.h > 12){
              this.hoursSpinner.setValue(value.h - 12);
            }else{
              this.hoursSpinner.setValue(value.h);
            }

          }else{
            this.hoursSpinner.setValue(value.h);
          }
          this.minutesSpinner.setValue(value.m);

        }

    },
    // overwrite
    getValue: function () {
        return this.getRawValue();
    },
    // overwrite
    setValue: function (value) {
        this.value = Ext.isDate(value) ? Ext.Date.format(value, 'H:i') : value;
        if (!this.rendered) {
            return;
        }
        this.setRawValue(this.value);
        this.validate();
    },
    // overwrite
    disable: function () {
        this.callParent(arguments);
        this.callSpinnersFunction('disable', arguments);
        this.callComboFunction('disable', arguments);
    },
    // overwrite
    enable: function () {
        this.callParent(arguments);
        this.callSpinnersFunction('enable', arguments);
        this.callComboFunction('enable', arguments);

    },
    // overwrite
    setReadOnly: function () {
        this.callParent(arguments);
        this.callSpinnersFunction('setReadOnly', arguments);
        this.callComboFunction('setReadOnly', arguments);

    },
    // overwrite
    clearInvalid: function () {
        this.callParent(arguments);
        this.callSpinnersFunction('clearInvalid', arguments);
        this.callComboFunction('clearInvalid', arguments);
    },
    // overwrite
    isValid: function (preventMark) {
        return this.hoursSpinner.isValid(preventMark) && this.minutesSpinner.isValid(preventMark) && this.amPmCombo.isValid(preventMark);
    },
    // overwrite
    validate: function () {
        return this.hoursSpinner.validate() && this.minutesSpinner.validate() && this.amPmCombo.validate();
    }
});


/**
 * Date time picker.
 *
 * Extends the date picker to add a time picker to the date picker.
 */
Ext.define('gw.ext.DateTimePicker', {
    extend: 'Ext.picker.Date',
    alias: 'widget.udatetimepicker',  // prefix ux class with "u" to avoid conflict with base ExtJs class
    requires: ['gw.ext.TimePickerField'],

    twelveHourMode: true,

    amSymbol : 'AM',
    pmSymbol : 'PM',

    hideOnClick : false,

    initComponent: function () {

        this.todayText = gw.app.localize("Button.Now");
        this.timeLabel = gw.app.localize("ExtJS.Picker.Date.TimeLabel");
        // keep time part for value
        var value = this.value || new Date();
        this.callParent();
        this.value = value;


    },
    onRender: function (container, position) {
        if (!this.timefield) {
            this.timefield = Ext.create('gw.ext.TimePickerField', {
                fieldLabel: this.timeLabel,
                labelWidth: 50,
                value: Ext.Date.format(this.value, 'H:i')  // 'H:i' is the format used by time picker for split
            });
        }
        this.timefield.ownerCt = this;



        this.callParent(arguments);

        var table = Ext.get(Ext.DomQuery.selectNode('table', this.el.dom));
        var tfEl = Ext.core.DomHelper.insertAfter(table, {
            tag: 'div',
            style: 'border:0px;',
            children: [
                {
                    tag: 'div',
                    cls: 'x-datepicker-footer ux-timefield'
                }
            ]
        }, true);
        this.timefield.render(this.el.child('div div.ux-timefield'));

        var p = this.getEl().parent('div.x-layer');
        if (p) {
            p.setStyle("height", p.getHeight() + 31);
        }
        this.timefield.on('change', this.timeChange, this);

    },
    // listener , timefield change
    timeChange: function (tf, time, rawtime) {
        // if(!this.todayKeyListener) { // before render

        var me = this;
        me.value = this.fillDateTime(this.value);
        me.fireEvent('select_time', me, me.value);


      // } else {
        // this.setValue(this.value);
        // }
    },
    // @private
    fillDateTime: function (value) {
        if (this.timefield) {
            var rawtime = this.timefield.getRawValue();
            value.setHours(rawtime.h);
            value.setMinutes(rawtime.m);
        }
        return value;
    },
    // @private
    changeTimeFiledValue: function (value) {
        this.timefield.un('change', this.timeChange, this);
        this.timefield.setValue(this.value);
        this.timefield.on('change', this.timeChange, this);
    },

    // override  -- note this is modified and is different from ux 4.1.1 version
    getValue: function () {
        var value = this.callParent();

        // value should have the time field set. Setting it in case the super class might have cleared it out
        // This is only set if the caller is not the super class date picker.
        if (this.timefield && !this.isDatePickerCalling(this.getValue)) {
            var rawValue = this.timefield.getRawValue();

            value.setHours(rawValue.h);
            value.setMinutes(rawValue.m);
        }

        return value;
    },

    // override  -- note this is modified and is different from ux 4.1.1 version
    setValue: function (value) {
        this.callParent(arguments);

        if (this.timefield) {
            // If the caller is not the super class date picker, save the time value from the passed in value.
            if (!this.isDatePickerCalling(this.setValue)) {

                if (this.twelveHourMode){
                  var hours = value.getHours();
                  if (value.getHours() >= 12){
                    this.timefield.amPmCombo.setValue('pm');
                    hours = hours === 12 ? 12 : hours - 12;
                  }else{
                    this.timefield.amPmCombo.setValue('am');
                    hours = hours === 0 ? 12 : hours;
                  }
                  this.timefield.hoursSpinner.setValue(hours);
                  this.timefield.minutesSpinner.setValue(value.getMinutes());

                }else{
                  this.timefield.hoursSpinner.setValue(value.getHours());
                  this.timefield.minutesSpinner.setValue(value.getMinutes());
                }


                //this.timefield.setRawValue({h: value.getHours(), m: value.getMinutes()});
            }
            // In any case, set the current time from the time picker field for value.
            var rawValue = this.timefield.getRawValue();
            this.value.setHours(rawValue.h);
            this.value.setMinutes(rawValue.m);
        }
    },

    isDatePickerCalling: function (boundFunction) {
        // TODO Hack: getValue / setValue callers can either be the date picker, where the time field is erased.
        // Other callers are date time picker callers where the time field is expected.
        // Internally, the value stores the date and the time. The super class date picker expects the value
        // field to have the time cleared.
        var callingClassName = Ext.ClassManager.getName(boundFunction.caller.$owner);
        return (callingClassName == "Ext.picker.Date");
    },

    // overwrite : fill time before setValue
    handleDateClick: function (e, t) {
        var me = this,
            handler = me.handler;

        e.stopEvent();
        if (!me.disabled && t.dateValue && !Ext.fly(t.parentNode).hasCls(me.disabledCellCls)) {
            me.doCancelFocus = me.focusOnSelect === false;
            me.setValue(this.fillDateTime(new Date(t.dateValue))); // overwrite: fill time before setValue
            delete me.doCancelFocus;
            me.fireEvent('select', me, me.value);
            if (handler) {
                handler.call(me.scope || me, me, me.value);
            }
            me.onSelect();
        }
    },

    // overwrite : fill time before setValue
    selectToday: function () {
        var me = this,
            btn = me.todayBtn,
            handler = me.handler;

        if (btn && !btn.disabled) {
            // me.setValue(Ext.Date.clearTime(new Date())); //src
            me.setValue(new Date());// overwrite: fill time before setValue
            me.fireEvent('select', me, me.value);
            if (handler) {
                handler.call(me.scope || me, me, me.value);
            }
            me.onSelect();
        }
        return me;
    }
});


/**
 * Date time field
 *
 * The date time field shows a formatted date and time.
 *
 * TODO tpollinger PL-17741 needs localized time formats.
 */
Ext.define('gw.ext.DateTimeField', {
    extend: 'Ext.form.field.Date',
    alias: 'widget.datetimefield', // Referenced by server side
    requires: ['gw.ext.DateTimePicker'],

    dateFormat: 'd-m-Y',  // default datetime format
    timeFormat: 'H:i',

    initComponent: function () {
        this.format = this.dateFormat + ' ' + this.timeFormat;
        this.addEvents([
          'select_time'
        ]);

        this.callParent();
    },

    getValue: function () {
        return this.parseDate(Ext.form.field.Date.superclass.getValue.call(this)) || '';
    },

    onSelectTime: function(m, d) {
      var me = this;

      me.setValue(d);
    },

    //@SenchaUpgrade: Check if event originated in the AM/PM combo box, Picker.js is listening
    //for mousedown events on Ext.dom() and the standard origin check fails since the picker dom
    //is technically not a child of combo box element
    collapseIf: function(e) {
      var me = this;

      if (!me.isDestroyed
        && !e.within(me.bodyEl, false, true)
        && !e.within(me.picker.el, false, true)
        && !me.isEventWithinPickerLoadMask(e)
        && !e.within(me.picker.timefield.amPmCombo.getPicker().el, false, true)) {
        me.collapse();
      }

    },

    //@SenchaUpgrade: Check if event originated in the AM/PM combo box, Picker.js is listening
    //for mousedown events on Ext.dom() and the standard origin check fails since the picker dom
    //is technically not a child of combo box element. Also, there's no documentation on
    //mimicBlur
    mimicBlur: function(e) {
      var me = this,
        picker = me.picker;
      // ignore mousedown events within the picker element
      if (!picker || !e.within(picker.el, false, true) && !me.isEventWithinPickerLoadMask(e)
        && !e.within(picker.timefield.amPmCombo.getPicker().el, false, true)) {
        me.callParent(arguments);
      }
    },
    // overwrite
    createPicker: function () {
        var me = this,
            format = Ext.String.format;

        return Ext.create('gw.ext.DateTimePicker', {
            ownerCt: me.ownerCt,
            renderTo: document.body,
            floating: true,
            hidden: true,
            focusOnShow: true,
            minDate: me.minValue,
            maxDate: me.maxValue,
            disabledDatesRE: me.disabledDatesRE,
            disabledDatesText: me.disabledDatesText,
            disabledDays: me.disabledDays,
            disabledDaysText: me.disabledDaysText,
            format: me.format,
            timeFormat: this.timeFormat,
            dateFormat: this.dateFormat,
            showToday: me.showToday,
            startDay: me.startDay,
            hideOnClick: false,
            minText: format(me.minText, me.formatDate(me.minValue)),
            maxText: format(me.maxText, me.formatDate(me.maxValue)),
            listeners: {
                scope: me,
                select: me.onSelect,
                select_time: me.onSelectTime
            },
            keyNavConfig: {
                esc: function () {
                    me.collapse();
                }
            }
        });
    }
});

