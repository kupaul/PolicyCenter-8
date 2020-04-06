Ext.define('Gw.override.grid.feature.Grouping', {
  override: 'Ext.grid.feature.Grouping',

  /**
   * @SenchaUpgrade
   * Fix 4.2 bug when a Grouped Store with remote summary is empty, and no
   * summary data is available.
   *
   * Override involves one line of code and one verification for generateSummaryData():
   *
   *      summaryRows = reader.getRoot(reader.rawData)||[];
   *
   * And
   *
   *      if (!group) {
   *          break;
   *      }
   *
   * Bug filed EXTJSIV-9425
   * @Sencha April-9-2013
   *
   * TODO(choyt): Investigate if generateSummaryData override is still necessary,
   * as the referenced bug is fixed in 4.2.2.
   */
  generateSummaryData: function() {
    var me = this,
        store = me.view.store,
        groups = store.groups.items,
        reader = store.proxy.reader,
        len = groups.length,
        groupField = me.getGroupField(),
        data = {},
        lockingPartner = me.lockingPartner,
        i, group, record,
        root, summaryRows, hasRemote,
        convertedSummaryRow, remoteData;

    /**
     * @cfg {String} [remoteRoot=undefined]
     * The name of the property which contains the Array of summary objects.
     * It allows to use server-side calculated summaries.
     */
    if (me.remoteRoot && reader.rawData) {
      hasRemote = true;
      remoteData = {};
      // reset reader root and rebuild extractors to extract summaries data
      root = reader.root;
      reader.root = me.remoteRoot;
      reader.buildExtractors(true);
      summaryRows = reader.getRoot(reader.rawData)||[];
      len = summaryRows.length;

      // Ensure the Reader has a data conversion function to convert a raw data row into a Record data hash
      if (!reader.convertRecordData) {
        reader.buildExtractors();
      }

      for (i = 0; i < len; ++i) {
        convertedSummaryRow = {};

        // Convert a raw data row into a Record's hash object using the Reader
        reader.convertRecordData(convertedSummaryRow, summaryRows[i]);
        remoteData[convertedSummaryRow[groupField]] = convertedSummaryRow;
      }

      // restore initial reader configuration
      reader.root = root;
      reader.buildExtractors(true);
    }

    for (i = 0; i < len; ++i) {
      group = groups[i];

      if (!group) {
        break;
      }

      // Something has changed or it doesn't exist, populate it
      if (hasRemote || group.isDirty() || !group.hasAggregate()) {
        if (hasRemote) {
          record = me.populateRemoteRecord(group, remoteData);
        } else {
          record = me.populateRecord(group);
        }
        // Clear the dirty state of the group if this is the only Summary, or this is the right hand (normal grid's) summary
        if (!lockingPartner || (me.view.ownerCt === me.view.ownerCt.ownerLockable.normalGrid)) {
          group.commit();
        }
      } else {
        record = group.getAggregateRecord();
        if (lockingPartner && !record.hasPartnerData) {
          me.populateRecord(group);
          record.hasPartnerData = true;
        }
      }
      data[group.key] = record;
    }

    return data;
  },

  /**
   * @SenchaUpgrade
   * Allow 4.2.1 to render fields that contain HTML. Check test case at
   * http://www.sencha.com/forum/showthread.php?265000
   *
   * We had to override the whole TPL, but the changes are pretty simple. We just added
   * htmlEncode to two places.
   *
   *      {record.internalId} -> {record.internalId:htmlEncode}
   *
   * And
   *
   *      {groupId} -> {groupId:htmlEncode}
   *
   * @Sencha June-17-2013
   *
   * TODO(choyt): Investigate overriding getGroupId rather than groupTpl.
   */
  groupTpl: [
    '{%',
    'var me = this.groupingFeature;',
    // If grouping is disabled, do not call setupRowData, and do not wrap
    'if (me.disabled) {',
    'values.needsWrap = false;',
    '} else {',
    // setupRowData requires the index in the data source, not the index in the real store
    'me.setupRowData(values.record, values.rowIndex, values);',
    '}',
    '%}',
    '<tpl if="needsWrap">',
    '<tr {[values.isCollapsedGroup ? ("id=\\"" + values.rowId + "\\"") : ""]} data-boundView="{view.id}" data-recordId="{record.internalId:htmlEncode}" data-recordIndex="{[values.isCollapsedGroup ? -1 : values.recordIndex]}" ',
    'class="{[values.itemClasses.join(" ")]} ', Ext.baseCSSPrefix, 'grid-wrap-row<tpl if="!summaryRecord"> ', Ext.baseCSSPrefix, 'grid-group-row</tpl>" {ariaRowAttr}>',
    '<td class="', Ext.baseCSSPrefix, 'group-hd-container" colspan="{columns.length}" {ariaCellAttr}>',
    '<tpl if="isFirstRow">',
    '{%',
    // Group title is visible if not locking, or we are the locked side, or the locked side has no columns/
    // Use visibility to keep row heights synced without intervention.
    'var groupTitleStyle = (!values.view.lockingPartner || (values.view.ownerCt === values.view.ownerCt.ownerLockable.lockedGrid) || (values.view.lockingPartner.headerCt.getVisibleGridColumns().length === 0)) ? "" : "visibility:hidden";',
    '%}',
    '<div id="{groupId:htmlEncode}" class="', Ext.baseCSSPrefix, 'grid-group-hd {collapsibleCls}" tabIndex="0" hidefocus="on" {ariaCellInnerAttr}>',
    '<div class="', Ext.baseCSSPrefix, 'grid-group-title" style="{[groupTitleStyle]}" {ariaGroupTitleAttr}>',
    '{[values.groupHeaderTpl.apply(values.groupInfo, parent) || "&#160;"]}',
    '</div>',
    '</div>',
    '</tpl>',

    // Only output the child rows if  this is *not* a collapsed group
    '<tpl if="summaryRecord || !isCollapsedGroup">',
    '<table class="', Ext.baseCSSPrefix, '{view.id}-table ', Ext.baseCSSPrefix, 'grid-table',
    '<tpl if="summaryRecord"> ', Ext.baseCSSPrefix, 'grid-table-summary</tpl>"',
    'border="0" cellspacing="0" cellpadding="0" style="width:100%" {ariaSummaryTableAttr}>',
    '{[values.view.renderColumnSizer(out)]}',
    // Only output the first row if this is *not* a collapsed group
    '<tpl if="!isCollapsedGroup">',
    '{%',
    'values.itemClasses.length = 0;',
    'this.nextTpl.applyOut(values, out, parent);',
    '%}',
    '</tpl>',
    '<tpl if="summaryRecord">',
    '{%me.outputSummaryRecord(values.summaryRecord, values, out);%}',
    '</tpl>',
    '</table>',
    '</tpl>',
    '</td>',
    '</tr>',
    '<tpl else>',
    '{%this.nextTpl.applyOut(values, out, parent);%}',
    '</tpl>', {
      priority: 200,

      syncRowHeights: function(firstRow, secondRow) {
        firstRow = Ext.fly(firstRow, 'syncDest');
        secondRow = Ext.fly(secondRow, 'sycSrc');
        var owner = this.owner,
            firstHd = firstRow.down(owner.eventSelector, true),
            secondHd,
            firstSummaryRow = firstRow.down(owner.summaryRowSelector, true),
            secondSummaryRow,
            firstHeight, secondHeight;

        // Sync the heights of header elements in each row if they need it.
        if (firstHd && (secondHd = secondRow.down(owner.eventSelector, true))) {
          firstHd.style.height = secondHd.style.height = '';
          if ((firstHeight = firstHd.offsetHeight) > (secondHeight = secondHd.offsetHeight)) {
            Ext.fly(secondHd).setHeight(firstHeight);
          }
          else if (secondHeight > firstHeight) {
            Ext.fly(firstHd).setHeight(secondHeight);
          }
        }

        // Sync the heights of summary row in each row if they need it.
        if (firstSummaryRow && (secondSummaryRow = secondRow.down(owner.summaryRowSelector, true))) {
          firstSummaryRow.style.height = secondSummaryRow.style.height = '';
          if ((firstHeight = firstSummaryRow.offsetHeight) > (secondHeight = secondSummaryRow.offsetHeight)) {
            Ext.fly(secondSummaryRow).setHeight(firstHeight);
          }
          else if (secondHeight > firstHeight) {
            Ext.fly(firstSummaryRow).setHeight(secondHeight);
          }
        }
      },

      syncContent: function(destRow, sourceRow) {
        destRow = Ext.fly(destRow, 'syncDest');
        sourceRow = Ext.fly(sourceRow, 'sycSrc');
        var owner = this.owner,
            destHd = destRow.down(owner.eventSelector, true),
            sourceHd = sourceRow.down(owner.eventSelector, true),
            destSummaryRow = destRow.down(owner.summaryRowSelector, true),
            sourceSummaryRow = sourceRow.down(owner.summaryRowSelector, true);

        // Sync the content of header element.
        if (destHd && sourceHd) {
          Ext.fly(destHd).syncContent(sourceHd);
        }

        // Sync the content of summary row element.
        if (destSummaryRow && sourceSummaryRow) {
          Ext.fly(destSummaryRow).syncContent(sourceSummaryRow);
        }
      }
    }
  ],

  // @SenchaUpgrade - override private method
  onGroupToggleMenuItemClick: function(menuItem, checked) {
    var me = this;
    var grid = me.grid;
    var summaryFeature = grid.view.getFeature(gw.SimpleGrid.SUMMARY_FEATURE_ID);
    if(summaryFeature){
      summaryFeature.showSummaryRow = !checked;
    }
    me.callParent(arguments);
  },

  // @SenchaUpgrade - override private method
  onGroupMenuItemClick: function(menuItem, e) {
    var me = this;
    var me = this;
    var grid = me.grid;
    var summaryFeature = grid.view.getFeature(gw.SimpleGrid.SUMMARY_FEATURE_ID);
    if(summaryFeature){
      summaryFeature.showSummaryRow = false;
    }
    me.callParent(arguments);
  }
});
