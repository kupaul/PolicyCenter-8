package gw.plugin.policyperiod.impl

uses gw.plugin.InitializablePlugin
uses gw.rating.AbstractRatingEngine

uses java.lang.IllegalArgumentException
uses java.util.Map
uses gw.api.system.PCDependenciesGateway

@Export
class PCRatingPlugin extends SysTableRatingPlugin implements InitializablePlugin {

  public static final var MINIMAL_RATING_LEVEL : String = "RatingLevel"
  var _defaultMinimumBookStatusLevel : RateBookStatus

  override function setParameters(params : Map<Object, Object>) {
    setDefaultMinimumBookStatusLevel(params.get(MINIMAL_RATING_LEVEL) as String)
  }

  protected property get ServerInProductionMode() : boolean {
    return PCDependenciesGateway.ServerMode.Production
  }

  private function setDefaultMinimumBookStatusLevel(minimumRatingLevel : String) {
    var rateBookStatus = RateBookStatus.get(minimumRatingLevel)
    if (rateBookStatus == null) {
      throw new IllegalArgumentException(displaykey.Web.Rating.Errors.InvalidRatingLevel(minimumRatingLevel))
    }
    if (ServerInProductionMode and rateBookStatus != TC_ACTIVE) {
      throw new IllegalArgumentException(displaykey.Web.Rating.Errors.InvalidRatingLevel.ForProduction(rateBookStatus, RateBookStatus.TC_ACTIVE))
    }
    _defaultMinimumBookStatusLevel = rateBookStatus
  }

  override protected function createRatingEngine(line : PolicyLine) : AbstractRatingEngine {
    var rateBookEngine = line.createRatingEngine(RateMethod.TC_RATEFLOW, {RateEngineParameter.TC_RATEBOOKSTATUS -> _defaultMinimumBookStatusLevel})
    if (rateBookEngine == null) {
      return super.createRatingEngine(line)
    }
    return rateBookEngine
  }
}
