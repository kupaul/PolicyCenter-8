package gw.lob.gl.schedule
uses gw.api.productmodel.IValueRangeGetter
uses gw.api.productmodel.SchedulePolicyLocationPropertyInfo

/**
 * A {@link ScheduledItemColumnInfo} for a {@link PolicyLocation}
 */
@Export
class ScheduleGLPolicyLocationPropertyInfo extends SchedulePolicyLocationPropertyInfo{

  /**
   * Constructs a new column info with the passed arguments.
   *
   * @param columnName       {@link #Column}'s name
   * @param colLabel         Text to display for the column label in LVs
   * @param valueRangeGetter returns a range of values for drop downs
   * @param isRequired       Whether or not the input cell should be required
   *
   * @throws IllegalArgumentException if columnName, colLabel, or valueRangeGetter is null or no property named <code>columnName</code>
   *                                  exists on <code>GLScheduledItem</code>
   */
  construct(columnName : String, colLabel : String, valueRangeGetter : IValueRangeGetter, isRequired : boolean) {
    super(GLScheduledItem, columnName, colLabel, valueRangeGetter, isRequired)
  }
}
