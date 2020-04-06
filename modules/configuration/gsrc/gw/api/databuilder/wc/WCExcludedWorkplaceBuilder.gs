package gw.api.databuilder.wc
uses gw.api.databuilder.DataBuilder
uses gw.api.databuilder.BuilderContext

@Export
class WCExcludedWorkplaceBuilder extends DataBuilder<WCExcludedWorkplace, WCExcludedWorkplaceBuilder> {

  construct() {
    super(WCExcludedWorkplace)
  }

  protected override function createBean(context : BuilderContext) : WCExcludedWorkplace {
    var line = context.getParentBean() as entity.WorkersCompLine
    return line.createAndAddWCExcludedWorkplace()
  }
  
  final function withExcludedItem(item : String) : WCExcludedWorkplaceBuilder {
    set(WCExcludedWorkplace.Type.TypeInfo.getProperty("ExcludedItem"), item)
    return this
  }

  final function withState(state : State) : WCExcludedWorkplaceBuilder {
    set(WCExcludedWorkplace.Type.TypeInfo.getProperty("State"), state)
    return this
  }
}
