Ext.define('gw.ext.Choice', {
  extend: 'Ext.panel.Panel',
  requires: 'Ext.layout.container.Column',
  alias: 'widget.choice',
  layout: 'column',
  border: false,
  cls: 'g-choice',
  defaults: {
    bodyStyle: 'padding:5px'
  },
  initComponent: function () {
    if (this.items) {
      var inputs = {
        layout: 'anchor',
        border: false,
        frame: false,
        items: this.items
      };
      if (this.initialConfig.id) {
        var id = this.initialConfig.id
        this.id = id + '_Panel'
        this.items = [
          {
            border: false,
            items: [
              {
                xtype: 'choiceradio',
                name: this.name,
                id: id,
                checked: this.checked,
                eventParam: id,
                inputValue: id,
                postOnChange: true
              }
            ]
          },
          inputs
        ]
      } else {
        // For read-only mode, we don't render the radio buttons.
        this.items = [inputs]
      }
    } else {
      this.hidden = true; // do not show choice that has no content
    }
    this.callParent(arguments);//initComponent on super
  }
});
