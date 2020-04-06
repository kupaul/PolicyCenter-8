package gw.plugin.contact.impl
uses gw.plugin.contact.OfficialIdToTaxIdMappingPlugin


@Export
class PCOfficialIdToTaxIdMappingPlugin implements OfficialIdToTaxIdMappingPlugin {

  /**
   * Returns true if the type is either an SSN or a FEIN.
   */
  override function isTaxId(oIdType : OfficialIDType) : boolean {
    return OfficialIDType.TC_SSN == oIdType or OfficialIDType.TC_FEIN == oIdType
  }

}
