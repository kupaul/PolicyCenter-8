/**
 * Defines the hierarchical menu links in the left nav bar
 */
Ext.define('gw.AccordionModel', {
    extend: 'Ext.data.Model',
    fields: ['title', 'eventId', {
        name: 'collapsible',
        type: 'boolean',
        //todo: revisit meaning of collapsible (collision with panel config and with existing expandable)
        convert: function(v) {
            return (v == "" ? true : false);
        }
    }]
});
