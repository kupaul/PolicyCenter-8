Ext.define('gw.ext.ChoiceRadio', {
  extend: 'Ext.form.field.Radio',
  alias: 'widget.choiceradio',

  initComponent: function () {
    this.callParent(arguments);//initComponent on super
    this.un('blurchange', gw.app.onChange);
    this.on('blurchange', function (radio, newValue, oldValue) {
      var checkedItemCount = 0;
      var checkedRadioItem;
      //TODO : @SenchaUpgrade radio.getManager() is private function in ExtJS4, be careful when upgrade since ExtJS could change internal function.
      // cannot find alternative function in 4.1.1
      radio.getManager().getByName(radio.name, radio.getFormId()).each(function (item) {
        if (item.checked) {
          checkedItemCount++;
          checkedRadioItem = item;
        }
      })
      if (checkedItemCount == 1) {
        gw.app.handleChange(checkedRadioItem, true, false)
      }
    });
  }
});
