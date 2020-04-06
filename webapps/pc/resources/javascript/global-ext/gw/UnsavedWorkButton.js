/**
* A menu which contains a DataView and reloads DetailView store right before show.
* It is currently only used in UnsavedWorkButton.
* TODO: ExtJs4 upgrade - we can use "cls" attribute on each node to underline a tree node
*/
Ext.define('gw.dataviewmenu', {
    extend: 'Ext.menu.Menu',
    alias: 'widget.dataviewmenu',

    showSeparator: false,
    plain: true,

    initComponent: function () {
        var me = this;

        me.border = false;
        me.addCls(Ext.baseCSSPrefix + 'dataviewmenu');
        me.callParent(arguments);
        me.add({
            xtype: 'component',
            itemId: 'loading-indicator',
            html: 'Loading...',
            cls: Ext.baseCSSPrefix + 'dataviewmenu-loading-indicator'
        });
    },

    getDataComponent: function () {
        return this.child('component[store]');
    },

    beforeShow: function () {
        var me = this,
            dataview = me.getDataComponent();
        store = dataview.store;

        me.callParent(arguments);

        // clear store
        store.removeAll();

        // show loading indicator
        dataview.hide();
        me.child('#loading-indicator').show();

        // make sure the button id is used as store id
        if (!store.storeId) {
            store.setModelId(me.getBubbleTarget().el.id);
        }

        // load store
        store.load(function () {
            me.child('#loading-indicator').hide();
            dataview.show();

            // realign menu
            // the ajax response (processCommands) suspends layouts. We have to
            // wait until layout is ready to realign.
            me.on('afterlayout', me.realignMenu, me, {single: true});

            // Don't need to redo layout. Menu components shrink wrap around content.
            // this.redoComponentLayout();
        });
    },

    realignMenu: function () {
        var refOwner = this.getRefOwner();
        this.showBy(refOwner, refOwner.menuAlign || 'tr-br?');
    }
});

/**
* A button with an AJAX menu that displays unsaved work entries
*/
Ext.define("gw.UnsavedWorkButton", {
    extend: 'Ext.button.Button',
    alias: 'widget.unsavedworkbutton',
    cls: 'g-no-menu-icon',
    iconCls: 'g-unsavedwork-icon',
    menuAlign: 'tr-br?',
    menu: {
        xtype: 'dataviewmenu',
        items: [
            {xtype: 'unsavedworklist'}
        ]
    }
});