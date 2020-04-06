/*
This file is part of Ext JS 4.2

Copyright (c) 2011-2013 Sencha Inc

Contact:  http://www.sencha.com/contact

Commercial Usage
Licensees holding valid commercial licenses may use this file in accordance with the Commercial
Software License Agreement provided with the Software or, alternatively, in accordance with the
terms contained in a written agreement between you and Sencha.

If you are unsure which license is appropriate for your use, please contact the sales department
at http://www.sencha.com/contact.

Build date: 2013-03-11 22:33:40 (aed16176e68b5e8aa1433452b12805c0ad913836)
*/
Ext.define('Titanium.panel.Panel', {
    override: 'Ext.panel.Panel',
    initComponent: function() {
        var me = this,
            initialConfig = me.initialConfig;
        
        // specific ic rules for inline-details UI
        if (me.ui === 'inline-details') {
            if (!Ext.isDefined(me.initialConfig.bodyPadding)) {
                me.bodyPadding = 10;
            }
        }
        
        me.callParent(arguments);
    },
    
    onAdd: function(item) {
        this.callParent(arguments);
        
        // specific rules for tabpanels inside list-details UI
        if (item.isXType && item.isXType('tabpanel')) {
            item.addCls(Ext.baseCSSPrefix + 'list-details-tabpanel');
        }
    }
});