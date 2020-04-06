package gw.lob.pa

uses gw.validation.PCValidationContext

@Export
class PALineQuickQuoteValidation extends PALineValidation {

  construct(aContext : PCValidationContext, aLine : entity.PersonalAutoLine) {
    super(aContext, aLine)
  }

  /**
   * Validate the PA Quick Quote Line.
   *
   * Checks the following:
   * <ul>
   *   <li>Policy is for no more than a year</li>
   *   <li>Validate Coverages</li>
   *   <li>Validate Assignment</li>
   *   <li>Validate Vehicles for Quick Quote</li>
   *   <li>Validate Drivers for Quick Quote</li>
   * </ul>
   */
  override function doValidate() {
    policyPeriodOneYearMax()

    CoveragesValidator.doValidate()
    AssignmentValidator.doValidate()
    VehiclesValidator.validateQQ()
    DriversValidator.validateQQ()
  }

}
