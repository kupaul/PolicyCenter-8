package gw.job.sxs

uses gw.api.match.MatchableTreeTraverserConfig

/**
 * This class is responsible for mapping from a period to the appropriate base data copy configuration class
 */
@Export
public class SideBySideCopyConfig {
  public function getMatchableTreeTraverserConfigForPeriod(period : PolicyPeriod) : MatchableTreeTraverserConfig {
    // Only monoline personal auto is supported
    var line = period.Lines.singleWhere(\ l -> l.SideBySideEnabled)
    return line.SideBySideBaseDataConfig
  }
}
