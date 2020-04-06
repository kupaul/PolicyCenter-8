package gw.rating.rtm.util

uses gw.api.system.PCConfigParameters

@Export
class RatingConfig {

  property get MemoryThreshold() : int {
    return PCConfigParameters.RateTableManagementMemoryRowThreshold.Value
  }

  property get RTMRowCountNormalizationThreshold() : int {
    return PCConfigParameters.RateTableManagementNormalizationRowThreshold.Value
  }

  property get RTMRowCountNormalizationLimit() : int {
    return PCConfigParameters.RateTableManagementNormalizationRowLimit.Value
  }
}
