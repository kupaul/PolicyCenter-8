package gw.lob.pa
uses gw.api.copier.AbstractEffDatedCopyable


@Export
class VehicleDriverCopier extends AbstractEffDatedCopyable<VehicleDriver> {

  construct(driver : VehicleDriver) {
    super(driver)
  }

  override function copyBasicFieldsFromBean(driver : VehicleDriver) {
    _bean.PercentageDriven = driver.PercentageDriven
  }

}
