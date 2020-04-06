package gw.plugin.diff.impl

uses gw.api.diff.BeanMatcher
uses gw.api.domain.Clause
uses gw.api.logicalmatch.LogicalMatcher

@Export
class PCBeanMatcher implements BeanMatcher {
  /**
   * Determine if two beans are really the same "thing", e.g. they are the same 
   * logical entity. Used by compareField when matching up array elements to see
   * which are added, removed, or changed, and to see if two links point to the
   * same logical entity vs. different entities.
   */
  public override function doBeansMatch(b1 : KeyableBean, b2 : KeyableBean) : boolean {
    if (b1 == b2) {
      return true
    } else if (typeof b1 != typeof b2) {
      return false
    } else if (fixedIdsMatch(b1, b2)) {
      return true //check fixed id match before logical match for performance
    } else if (matchesWithLogicalMatchers(b1, b2) ) {
      return true 
    } else if (matchesWithoutLogicalMatchers(b1, b2)) {
      return true
    }
    return false
  }
  
  private function matchesWithLogicalMatchers(b1: KeyableBean, b2 : KeyableBean) : boolean {
    if (b1 typeis LogicalMatcher) {
      return b1.isLogicalMatchUntyped(b2)
    }
    return false
  }

  private function fixedIdsMatch(b1: KeyableBean, b2 : KeyableBean) : boolean {
    if (b1 typeis EffDated and b2 typeis EffDated) {
      return b1.FixedId == b2.FixedId
    }
    return false
  }
 
  /**
   * Use the matchesWithoutLogicalMatchers when:
   * <p> If bean is a <b>Clause</b> (coverage, exclusion, etc), then use clause properties to define a match </p>
   * <p> If bean is an <b>OfficialID</b>, @see PL-15143 </p>
   * <p> If bean is a <b>Cost</b>, it cannot become a candidate for duplicate add resolution, that functionality needs to be separated first </p>
   */
  private function matchesWithoutLogicalMatchers(b1 : KeyableBean, b2 : KeyableBean) : boolean {
    if (b1 typeis Clause) {
      return doBeansMatch(b1.OwningCoverable, (b2 as Clause).OwningCoverable) and b1.Pattern.Code == (b2 as Clause).Pattern.Code
    } else if (b1 typeis OfficialID) {
      return (b1.OfficialIDType == (b2 as OfficialID).OfficialIDType) 
          and (b1.State == (b2 as OfficialID).State)
          and (b1.Contact == (b2 as OfficialID).Contact)
    } else if (b1 typeis Cost) {
      return b1.isMatchingBean(b2)
    } else {
      return false
    }
  }
}
