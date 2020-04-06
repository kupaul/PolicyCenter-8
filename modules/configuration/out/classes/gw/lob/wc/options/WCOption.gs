package gw.lob.wc.options

@Export
abstract class WCOption {

  private var _policyPeriod : PolicyPeriod as readonly Period

  //This is "Boolean" rather than "boolean" so that it can be lazily initialized from the null state
  private var _showOnMenu : Boolean = null

  construct (policyPeriod: PolicyPeriod) {
    _policyPeriod = policyPeriod
  }

  abstract property get Label() : String
  abstract property get Mode() : String

  property get ShowOnMenu() : boolean {
    if (_showOnMenu == null) {
      _showOnMenu = not isOnPolicy()
    }
    return _showOnMenu
  }

  property get WCLine() : WorkersCompLine {
    return _policyPeriod.WorkersCompLine
  }

  protected abstract function addToPolicy()
  protected abstract function removeFromPolicy()
  protected abstract function isOnPolicy() : boolean

  function moveFromMenuToActiveList() {
    _showOnMenu = false
    addToPolicy()
  }

  function moveToMenuFromActiveList() {
    _showOnMenu = true
    removeFromPolicy()
  }

  static function createOptionList(policyPeriod : PolicyPeriod) : List<WCOption> {
    return {
      new FederalLiabilityWCOption(policyPeriod),
      new WaiversOfSubrogationWCOption(policyPeriod),
      new OwnerOfficerWCOption(policyPeriod),
      new IndividualsIncludedExcludedWCOption(policyPeriod),
      new RetrospectiveRatingPlanWCOption(policyPeriod),
      new ParticipatingPlanWCOption(policyPeriod),
      new EmployeeLeasingWCOption(policyPeriod),
      new AircraftSeatWCOption(policyPeriod),
      new ExclusionsWCOption(policyPeriod),
      new ManuscriptWCOption(policyPeriod)
    }
  }
}