Ext.define('gw.ext.Chart', {
  extend: 'Ext.chart.Chart',
  alias: 'widget.gchart',

  requires: [
    'Ext.chart.series.Bar',
    'Ext.chart.axis.Category',
    'Ext.chart.axis.Numeric',
    'Ext.chart.series.Pie',
    'Ext.chart.series.Area',
    'Ext.chart.series.Line',
    'Ext.chart.series.Scatter',
    'Ext.chart.axis.Time',
    'Ext.chart.series.Radar',
    'Ext.chart.axis.Radial',
    'Ext.chart.series.Gauge',
    'Ext.chart.axis.Gauge'
  ],

  animate: true,

  initComponent: function() {
    var me = this;
    me.store = Ext.create('Ext.data.JsonStore', {
      fields: me.fields,
      data: me.data
    });
    delete me.fields;
    delete me.data;

    if (me.axes) {
      Ext.Array.each(me.axes, function(axis) {

        if (axis.type == 'Time') {
          if (axis.step) {
            axis.step[0] = eval(axis.step[0]); // get the value for an ExtJS const (e.g. Ext.Date.MONTH)
          }
        }

        if (axis.gLabelRotate) {
          axis.label = axis.label || {};
          axis.label.rotate = {degrees: axis.gLabelRotate};
          delete axis.gLabelRotate;
        }

        if (axis.gUseWholeNumbers) {
          // round up to whole number
          // @SenchaUpgrade Using "decimals: 0" from ExtJs may cause duplicate tick labels for the axis. Use a
          //                custom renderer function for now, to (1) round to whole number, and (2) omit duplicates.
          axis.label = axis.label || {};
          Ext.applyIf(axis.label, {renderer: function(v) {
            var val = Math.round(v); // round up to whole number
            var val2 = Math.round(v*10)/10; // round up to 1 decimal
            return val == val2 ? val : ''; // only show each whole number ONCE
          }});
        }

      })
    }

    if (me.series) {
      Ext.Array.each(me.series, function(item) {
        item.highlight = true;
        item.showInLegend = true;
        item.tips = {
          trackMouse: true
          // width: 140,
          // height: 28
        };

/*
        item.renderer = function(sprite, record, attributes, index, store) {
          if (this.gColor) { // color override
            if (index % this.chart.series.length == this.seriesIdx) {
              if (this.gColor) {

              }
            }
          }
//          console.log('series renderers: ' + this.type + '; render-index: ' + index + '; series idx:' + this.seriesIdx + '; #series:' + this.chart.series.length);
          return attributes;
        };
*/

        switch (item.type) {
          case 'pie':
            if (item.label) {
              Ext.applyIf(item.label, {display: 'rotate'});
            }

            item.tips.renderer = function(storeItem) {
              // calculate and display percentage on hover
              var total = 0;
              me.store.each(function(rec) {
                total += rec.get(item.angleField);
              });

              this.setTitle((item.label.field ? storeItem.get(item.label.field) : '') +
                   ' (' + Math.round(storeItem.get(item.angleField)) +
                   ', ' + Math.round(storeItem.get(item.angleField) / total * 100) + '%)');
            };
            break;

          case 'gauge':
//            item.needle = true;
            item.donut = 70;
            item.style = Ext.apply(item.style || {}, {
              opacity : 0.63
            });

            item.tips.renderer = function(storeItem) {
              this.setTitle(Math.round(storeItem.get(item.angleField)));
            };
            break;

          case 'bar':
          case 'area':
          case 'line':
          case 'scatter':
          case 'radar':

            item.tips.renderer = function (storeItem, item) {
              for (var i = 0; i < item.series.yField.length; i++) {
                var dataField = (item.series.yField.length == 1) ?
                     item.series.yField[i] :
                     (item.yField || item.storeField);
                if (item.series.yField[i] == dataField) {
                  this.setTitle(item.series.title[i] + ': ' + storeItem.get(dataField));
                  break;
                }
              }
            };

            if (item.type == 'area') {

              item.style = Ext.apply(item.style || {}, {
                opacity : 0.63
              });

            } else if (item.type == 'radar') {

              item.showMarkers = true;
              item.markerConfig = { radius:4, size:4 };
              item.style = { 'stroke-width': 2, fill:'none' };

            } else if (item.type == 'line' || item.type == 'scatter') {

              item.highlight = { size:6, radius:6 };
              item.markerConfig = { size:4, radius:4 };

            } else if (item.type == 'bar') {

              item.column = true; // column instead of bar

            }

            break;
        }
      })
    }

    me.callParent(arguments);
  }
});
