package gw.webservice.pc.pc700.ccintegration.ccentities

@Export
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.ccintegration.entities.xsd instead")
class CCPCFilteringCriteria {

  // For all of the filter fields below, if the array is null, then no filtering is done.  If the array is empty,
  // then this will mean that no filtered items meet the criteria (and thus everything will be filtered out).

  // In CC, a user can choose from among the list of PolicySummaryVehicles and PolicySummaryProperties to limit which
  // of these are returned.  For the objects that generate these Summary objects, this criteria will be applied to
  // filter what should be returned for both PolicySummary and full policy retrieval.  For objects that don't generate
  // summary objects for CC-side selection, this criteria will not be applied. (Otherwise that would filter out things like
  // GL class codes from a CPP policy if only specific buildings were selected.  The buildings' PolicySystemIDs would
  // be in the criteria but the GL class codes would not be.)
  var _policySystemIDs : String[] as PolicySystemIDs

  // The following criteria can be used to filter vehicles that will be returned for the policy.  Normally, only
  // 1 of the 2 filtering criteria should be set.  This interface just provides a choice of which one to use.
  var _VINS : String[] as VINS;
  var _licensePlates : String[] as LicensePlates

  // The following criteria can be used to filter the drivers that would be returned for the policy.  Typically,
  // the criteria would have only 1 driver.
  // A driver will be returned if the driver's last name begins with any string in the list.
  var _driverLastNames : String[] as DriverLastNames

  // The following criteria allows you to specify 1 or more postal codes.  This will be used to filter out and return
  // only policy locations that fall within the given list of postal codes and only risks & coverages that are attached to
  // those locations.
  var _postalCodes : String[] as PostalCodes

  construct() {
  }

}
