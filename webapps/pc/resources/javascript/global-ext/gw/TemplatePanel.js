/**
 * A special panel that allows custom HTML content (including JavaScript)
 */
Ext.define('gw.TemplatePanel', {
  extend: 'Ext.panel.Panel',
  alias: ['widget.templatepanel', 'widget.calendarpanel'],

  layout: {
    type: 'fit'
  },

  afterRender: function () {
    this.callParent(arguments);
    if (this.dhtml) {
      this.update(this.dhtml, /*loadScripts*/true);
      delete this.dhtml;
    }
  }
});

