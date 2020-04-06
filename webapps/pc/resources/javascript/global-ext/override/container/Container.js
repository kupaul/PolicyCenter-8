/**
 * Overrides Container to support links and subtitle in the header
 */
Ext.define('Gw.override.container.Container', {
  override: 'Ext.container.Container',

  initComponent: function () {

    if (this.headerItems) {
      if (this.headerItems.length > 0) {
        this.tools = [];
        this.title = [];
        Ext.each(this.headerItems, function (item) {
          if (item.autoEl  || item.cls == 'x-panel-header-text' || item.subTitle) {
            if (item.autoEl && item.autoEl.cls == 'x-panel-inline-icon') {
                // insert title and title icon to the panel TITLE
                var autoEl = item.autoEl;
                if (item.id) {
                  autoEl.id = item.id; // apply id
                }
                this.title.push(Ext.core.DomHelper.markup(autoEl)) ;
            } else if (item.cls == 'x-panel-header-text') {
              if (item.xtype == 'glink') {  //title is a link
                this.tools.push({
                  id: item.id,
                  xtype: item.xtype,
                  cls: item.cls,
                  text: item.text
                });
              } else {
                this.title.push('<span class="g-title" id="' + item.id + '">' + item.text + '</span>');  //title is plain text
              }
            }
            if (item.subTitle) {
              this.title.push('<span class="g-subtitle">' + item.subTitle + '</span>');
            }
            return;
          }

          // insert other type of header item as "tools":
          if (item.items) {
            Ext.each(item.items, function (child) {
              this.tools.push(child)
            }, this)
          } else {
            this.tools.push(item)
            }
        }, this);

        if (this.tools.length == 0) {
          delete this.tools;
        }
        if (this.title.length == 0) {
          delete this.title;
        } else {
          this.title = this.title.join('')
        }
      }

      delete this.headerItems
    } else if (this.subTitle) {  //wizard subtitle
      this.title = (this.title ? this.title : '') + '<span class="g-subtitle-wizard">' + this.subTitle + '</span>';
    }

    this.callParent(arguments);
  }});

