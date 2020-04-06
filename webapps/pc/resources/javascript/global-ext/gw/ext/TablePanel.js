/**
 * A table layout panel, it also support pagination
 */
Ext.define('gw.ext.TablePanel', {
  extend: 'gw.ext.PagingPanel',
  alias: 'widget.gtablepanel',

  initComponent:function () {
    var gEqualWidth =  this.gEqualWidth;
    if (this.columns !== null) {
      this.layout.columns = this.columns;
    }
    Ext.apply(this.layout, {
           tdAttrs: {
             style : {
               padding: '5px',
               'vertical-align' : 'top'
             }
           }}
    );
    this.layout.tableAttrs.border = this.hasBorder === true ? 1 : 0; // draw border for each table cell if border is true
    // adding empty components to the end of the table if elements in the last row is less than the number of columns
    var totalFieldCount = 0;
    if (this.columns && this.columns > 1 && this.items) {
      var tdWidth = 100 / this.columns;
      var tdWidthPercent =  tdWidth.toFixed(0) + "%";
      Ext.each(this.items, function (item) {
        if (!item.hidden) {
          if (item.colspan) {
            totalFieldCount += item.colspan;
          } else {
            if (gEqualWidth == true) {
              item.tdAttrs = {width : tdWidthPercent};
            }
            totalFieldCount++;
          }
        }
      });
      var elementsInLastRow = totalFieldCount % this.columns;
      if (elementsInLastRow > 0) {
        var elementToAdd = this.columns - elementsInLastRow;
        var addItem = (gEqualWidth == true) ?  {xtype:'component', tdAttrs: {width : tdWidthPercent}} :
                                               {xtype:'component'};
        for(var i = 0; i < elementToAdd; i++) {
          this.items.push(addItem);
        }
      }
    }
    this.callParent(arguments);
  }
});
