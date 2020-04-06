package gw.api.databuilder.wc

uses gw.api.databuilder.BuilderContext

/**
 * @author dpetrusca
 */
@Export
class WCCoveredEmployeeBuilder extends WCCoveredEmployeeBuilderBase<WCCoveredEmployee, WCCoveredEmployeeBuilder> {
  construct() {
    super(WCCoveredEmployee)    
  }

  protected override function createBean(context : BuilderContext) : WCCoveredEmployee {
    var line = context.getParentBean() as entity.WorkersCompLine
    return line.createAndAddWCCoveredEmployee()
  }
}
