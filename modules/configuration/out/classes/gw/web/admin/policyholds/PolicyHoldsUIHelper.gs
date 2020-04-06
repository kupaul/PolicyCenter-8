package gw.web.admin.policyholds

@Export
class PolicyHoldsUIHelper {

  public static function getUnaddedZones(policyHold : entity.PolicyHold, zones : Zone[]) : Zone[] {
    if (zones.HasElements) {
      return zones.where(\ z -> !policyHold.PolicyHoldZones.hasMatch(\ p -> p.Code == z.Code))
    }
    return zones
  }
}