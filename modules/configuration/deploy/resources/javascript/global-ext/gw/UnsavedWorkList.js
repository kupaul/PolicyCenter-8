/**
* Model for unsaved work list
*/
Ext.define('gUnsavedWorkModel', {
    extend: 'Ext.data.Model',
    fields:['entryCls','titleCls','title','titleId','icon','iconId','entryKey']
});

/**
* A custom DataView that contains a list of unsaved work entries
*/
Ext.define("gw.UnsavedWorkList", {
    extend: 'Ext.view.View',
    alias: 'widget.unsavedworklist',

    cls: "unsavedwork",
    itemSelector: 'tr',

    initComponent: function () {
        var me = this;

        me.addCls(Ext.baseCSSPrefix + 'unsavedwork-list');
        me.overItemCls = Ext.baseCSSPrefix + 'unsavedwork-item-over';

        Ext.apply(me, {
            store: Ext.create('gw.ModelStore', {
                model: 'gUnsavedWorkModel'
            }),
            tpl: Ext.create('Ext.XTemplate',
                '<table class="', Ext.baseCSSPrefix, 'unsavedwork-table" border="0" cellspacing="0" cellpadding="0">',
                '<tpl for=".">',
                '<tr class="{entryCls}">',
                '<td class="text {titleCls}">',
                '<tpl if="titleId"><a id="{titleId}"></tpl>',
                '{title}',
                '<tpl if="titleId"></a></tpl>',
                '</td>',
                '<td class="icon">',
                '<tpl if="iconId"><a id="{iconId}"></tpl>',
                '{icon}',
                '<tpl if="iconId"></a></tpl>',
                '</td>',
                '</tr>',
                '</tpl>',
                '</table>'
            )
        });

        me.callParent(arguments);

        me.on('itemclick', me.onListItemClick, me);
    },

    /**
     * Handles clicking on any anchor with this DataView.
     * Note that one data record (i.e. a TR) may contains multiple anchors, each with a different action.
     */
    onListItemClick: function (dataView, record, item, index, evt) {
        var viewRootId, target, entryKey;

        // When the DataView is inside a menu, the menu will invoke this event again. Stop it!
        evt.stopEvent();

        // look up which anchor is clicked:
        target = evt.getTarget('a', 3);
        if (target) {
            viewRootId = this.store.storeId;
            entryKey = record.get('entryKey'); // the key to identify the unsaved work entry

            if (target.id.match(/discard$/)) { // discard the entry
                gw.app.confirm(
                    '',
                    gw.app.localize('Java.UnsavedWork.ConfirmDiscard', record.get('title')),
                    function (btn) {
                        if (btn === 'yes' || btn === 'ok') {
                            gw.app.requestViewRoot(viewRootId, {
                                cancelEntry: entryKey
                            });
                        }
                    }
                );
            }
            else { // navigate to the entry
                gw.app.handleAction(null, viewRootId, {
                    param: entryKey
                });
            }
        }
    }
});