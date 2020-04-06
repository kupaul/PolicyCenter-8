package gw.lob.gl.schedule
uses gw.lob.common.AbstractScheduleImpl
uses gw.api.productmodel.SchedulePropertyInfo
uses gw.lang.reflect.IPropertyInfo
uses gw.api.productmodel.ScheduleStringPropertyInfo

@Export
class GLLineScheduleCovImpl extends AbstractScheduleImpl<entity.GLLineScheduleCov> {

  construct(delegateOwner : entity.GLLineScheduleCov) {
    super(delegateOwner)
  }

  override property get ScheduledItems() : ScheduledItem[] {
    return Owner.GLLineScheduledItems
  }

  override function createAndAddScheduledItem() : ScheduledItem {
    var scheduledItem = new GLLineScheduleCovItem(Owner.Branch)
    createAutoNumber(scheduledItem)
    Owner.addToGLLineScheduledItems(scheduledItem)
    initializeScheduledItem(scheduledItem)
    return scheduledItem
  }


  override property get PropertyInfos() : SchedulePropertyInfo[] {
    switch (typeof Owner) {
        case GLPestHerbicideApplicatorSchedule:
          return {
            new ScheduleStringPropertyInfo("StringCol1", displaykey.Web.Policy.GL.Schedule.DescriptionofOperations, true)
          }
        default:
          return super.PropertyInfos
    }
  }
  
  override function removeScheduledItem(item : ScheduledItem) {
    Owner.removeFromGLLineScheduledItems(item as GLLineScheduleCovItem)
    renumberAutoNumberSequence()
  }

  override property get CurrentAndFutureScheduledItems() : KeyableBean[] {
    var schedItems = Owner.ScheduledItems.toList()

    Owner.Branch.OOSSlices
      .where(\ p ->  p.GLLine != null)
      .each(\ p ->  {
        var matchingSlicedScheduleCov = p.GLLine.CoveragesFromCoverable.firstWhere(\ c -> c.FixedId == Owner.FixedId) as GLLineScheduleCov
        if (matchingSlicedScheduleCov != null){
          matchingSlicedScheduleCov.ScheduledItems.each(\ s -> {
            if(!schedItems.contains(s)) {
              schedItems.add(s)
            }
          })
        }
      })

    return schedItems.map(\ item -> item as GLLineScheduleCovItem).toTypedArray()
  }

  override property get ScheduleNumberPropInfo() : IPropertyInfo {
    return GLLineScheduleCovItem.Type.TypeInfo.getProperty("ScheduleNumber")
  }
}
