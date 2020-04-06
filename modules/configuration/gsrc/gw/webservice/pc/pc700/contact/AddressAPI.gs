package gw.webservice.pc.pc700.contact

uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.exception.RequiredFieldException
uses gw.webservice.SOAPUtil
uses gw.transaction.Transaction
uses gw.api.system.PCLoggerCategory
uses gw.api.webservice.exception.BadIdentifierException
uses gw.pl.persistence.core.Bundle

/**
 * API for external systems to interact with addresses in PolicyCenter.
 */
@Export
@gw.xml.ws.annotation.WsiWebService( "http://guidewire.com/pc/ws/gw/webservice/pc/pc700/contact/AddressAPI" )
@Deprecated("As of 8.0 use gw.webservice.pc.pc800.contact.AddressAPI instead")
class AddressAPI {

  /**
   * Updates an address with given public ID by calling AddressService#updateAddress which
   * has the out-of-th-box default of updating the specified address and the addresses linked to it.
   *
   * @param address The address to update
   * @param publicId The unique identifier for this address
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  function updateAddress(address : AddressData, publicId : String) {
    executeApiCallAndAssertAddressNotNull(\ b -> AddressService.Instance.updateAddress(address, false, publicId, b), publicId)
  }

  /**
   * Updates an address with given public ID.
   * This method will NOT update linked addresses.
   *
   * @param address The address to update
   * @param publicId The unique identifier for this address
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  function updateAddressOnly(address : AddressData, publicId : String) {
    executeApiCallAndAssertAddressNotNull(\ b -> AddressService.Instance.updateAddressOnly(address, false, publicId, b), publicId)
  }

  /**
   * Updates an address with given public ID and updates all linked addresses
   * if this address is linked.
   *
   * @param address The address to update
   * @param publicId The unique identifier for this address
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  function updateAddressAndLinkedAddresses(address : AddressData, publicId : String) {
    executeApiCallAndAssertAddressNotNull(\ b -> AddressService.Instance.updateAddressAndLinkedAddresses(address, false, publicId, b), publicId)
  }

  /**
   * Updates an address with given public ID and unlinks this address
   * if it is linked.
   *
   * @param address The address to update
   * @param publicId The unique identifier for this address
   */
  @Throws(SOAPException, "If communication errors occur")
  @Throws(RequiredFieldException, "If required field is missing")
  @Throws(BadIdentifierException, "If cannot find entity with given identifier")
  function updateAddressAndUnlink(address : AddressData, publicId : String) {
    executeApiCallAndAssertAddressNotNull(\ b -> AddressService.Instance.updateAddressAndUnlink(address, false, publicId, b), publicId)
  }

  private function executeApiCallAndAssertAddressNotNull(executeApiCall(bundle : Bundle) : Address, publicId : String) {
    SOAPUtil.require(publicId, "publicId")
    Transaction.runWithNewBundle(\ bundle -> {
      SOAPUtil.convertToSOAPException(PCLoggerCategory.ADDRESS_API, \ -> {
        assertAddressNotNull(executeApiCall(bundle), publicId)
      })
    })
  }

  private function assertAddressNotNull(address : Address, publicId : String) {
    if (address == null) {
      throw new BadIdentifierException(displaykey.Webservice.Error.CannotFindAddressByPublicID(publicId))
    }
  }
}
