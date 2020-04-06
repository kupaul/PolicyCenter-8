/**
 * Fixes bug where destroyed form fields were kept in the basic form
 * fields array.
 * 
 * Reported on bug EXTJSIV-9287 (Marked as fixed in ExtJs 4.2.1 Beta 1)
 * http://www.sencha.com/forum/showthread.php?261008-Ext-JS-4.2.1-Beta-1-Now-Available
 * @Sencha March-28-2013
 */
Ext.define('Gw.override.container.Monitor', {
    override: 'Ext.container.Monitor',
    
    // extension
    onContainerAdd: function(ct, preventChildren) {
        this.callParent(arguments);
        ct.on('beforedestroy', this.handleBeforeDestroy, this, {single: true});
    },
    
    // new method
    handleBeforeDestroy: function(ct) {
        if (ct.ownerCt) {
            this.onContainerRemove(ct.ownerCt, ct);
        }
    },
    
    // override
    handleRemove: function(ct, comp) {
        var me = this;
        // During a destroy we don't want to maintain any of this information,
        // so typically we'll be disabled here
        if (!me.disabled) {
            if (comp.is(me.selector)) {
                me.onItemRemove(ct, comp);
            }
    
            if (comp.isContainer) {
                me.onContainerRemove(ct, comp);
            }
            
            // start override
            else if (comp.menu && comp.menu.isMenu) {
                me.onContainerRemove(comp, comp.menu);
            }
            // eoo
        }
    }
});