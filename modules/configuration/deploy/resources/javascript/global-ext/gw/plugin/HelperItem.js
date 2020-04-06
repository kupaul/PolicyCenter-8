/**
 * HelperItem Plugin which helps render helper and hook up links
 */
Ext.define('gw.plugin.HelperItem', {
  alias: 'plugin.helperitem',
  extend: 'Ext.AbstractPlugin',

  // ORIGINAL
  /**
   * Shows helper menu next to the helper icon
   */
  showMenu: function () {
    if (this.item && this.item.menu) {
      if (this.item.menu.isHidden()) {
        gw.ext.Util.createAndShowOnDemandMenuIfNeeded(this.item);
        this.item.menu.showAt(this.item.el.getAnchorXY('bl'));
      }
    } else {
      alert("No menu available for field " + this.id)
    }
  },

  // NEW
  destroy: function () {
    var cmp = this.getCmp();

    if (cmp.item) {
      Ext.destroyMembers(cmp.item, 'menu');
      delete cmp.item.menuOpener;
      delete cmp.item;
    }

    Ext.destroyMembers(cmp,
      'suffix',
      'prefix',
      'beforeSubTpl',
      'afterSubTpl',
      'afterContainer'
    );
  },

  init: function (cmp) {
    var suffix;
    var item;
    var me = this;

    cmp.beforeSubTpl = cmp.prefix;
    cmp.afterSubTpl = cmp.suffix;

    //unbox items
    if (cmp.item) {
      if (cmp.item.length > 0) {
        item = cmp.item[0];
      } else if (cmp.item) {
        item = cmp.item;
      }
    }

    if (item) {
      var alt = '';
      var title = '';
      var iconHeight = '';
      var iconWidth = '';
      if (item.text) {
        suffix = '<span class="g-link-button">' + item.text + '</span>';
      } else {
        if (item.altText) {
          alt = '" alt="' + item.altText;
          title = '" title="' + item.altText;  // tooltip for image
        }
        if (item.iconWidth) {
          iconWidth = '" width="' + item.iconWidth;
          iconHeight = '" height="' + item.iconHeight;
        }
        suffix = '<img src="' + item.icon + iconWidth + iconHeight + alt + title + '">';
      }
      // wrap inside an anchor to allow focusing onto this element:
      suffix = '<a href="javascript:void(0)" id="' + item.id + '" class="' + gw.app.getEventSourceCls() + '">' + suffix + '</a>';

      if (item.menu) { // create menu component
        var menu = item.menu;
        delete item.menu;

        item.menu = gw.ext.Util.getOrCreateFieldMenu(item.id, menu);
        item.menuOpener = this;
      }

      if (cmp.afterSubTpl) {
        cmp.afterSubTpl += suffix;
      } else {
        cmp.afterSubTpl = suffix;
      }

      if (cmp instanceof Ext.form.FieldContainer) {
        cmp.afterContainer = cmp.afterSubTpl;
        cmp.afterSubTpl = null;
      }

      cmp.on('boxready', me.onCmpBoxReady, me, {single: true});
    }
  },

  onCmpBoxReady: function (field) {
    var me = this;
    var item;

    if (field.item[0] !== undefined) {
      field.item = field.item[0];
    }

    item = field.item;
    if (item) {
      item.el = Ext.get(item.id);
      if (item.menu) { // show menu when the helper icon is clicked
        field.mon(item.el, 'click', me.showMenu, field, {scope: me, stopEvent: true});
      } else if (field.item.handler) { // custom handler
        field.mon(item.el, 'click', item.handler, field, {stopEvent: true});
      }
      if (field.disabled) {
        item.el.setVisible(false)
      }
    }
  }
});

