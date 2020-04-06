package gw.policy
/**
 * User: Kuntal Paul Exavalu
 * Date: 25/9/19
 * Time: 1:15 PM
 */
enhancement PeriodVisibleEnhancement : entity.PolicyPeriod {

  property get TermNumberVisible() : boolean {
    return this.TermType == typekey.TermType.TC_ANNUAL
  }

}

