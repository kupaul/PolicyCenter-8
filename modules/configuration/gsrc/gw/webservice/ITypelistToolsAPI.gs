package gw.webservice

uses gw.api.webservice.exception.PermissionException
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.typelisttools.TypeKeyData
uses java.lang.SuppressWarnings
uses gw.api.webservice.typelisttools.TypelistToolsAPIHelper

/**
 * ITypelistToolsAPI provides methods that allow for the extraction of typelist data from the
 * system.
 */
@RpcWebService({SystemPermissionType.TC_SOAPADMIN})
@Deprecated("Use WS-I webservice gw.wsi.pl.TypelistToolsAPI instead.")
@SuppressWarnings("deprecation")
@Export
class ITypelistToolsAPI {

  /**
   * Given the name of a typelist, returns an array of all the typekey instances contained within.  An exception is
   * thrown if no typelist exists with the given name.
   *
   * @param typelistName the case-insensitive name of the typelist to look up. for example: "accidenttype"
   * @return an array of codes of typekeys contained within the typelist
   */
  @Throws (PermissionException, "if the caller does not have all of the following permissions: ADMIN")
  @Throws (SOAPException, "if no typelist exists with the given name")
  public function getTypelistValues(typelistName : String) : TypeKeyData[] {
    return TypelistToolsAPIHelper.getTypelistValues( typelistName )
  }

  /**
   * For use during imports, returns an array of TypeKeyData objects given a typelist, a namespace, and an
   * alias.  If no typecodes are found, will return a zero-length, non-null array.  A namespace generally corresponds
   * to an external integration source, but multiple namespaces per source are allowed.  NOTE: this method allows
   * multiple typecodes to use the same namespace-alias tuple.  If you require a namespace-alias to resolve to a
   * single typecode, please use getTypeKeyByAlias.
   *
   * @param typelist  the name of the given typelist (case-insensitive)
   * @param namespace the given namespace (case-insensitive)
   * @param alias     the given alias (case-insensitive)
   * @return array of TypeKeyData objects, or a zero-length, non-null string array if no typecodes match
   */
  @Throws (SOAPException, "")
  @Throws (PermissionException, "if the caller does not have all of the following permissions: ADMIN")
  public function getTypeKeysByAlias(typelist : String, namespace : String, alias : String) : TypeKeyData[]{
    return TypelistToolsAPIHelper.getTypeKeysByAlias( typelist, namespace, alias )
  }

  /**
   * For use during imports, returns a TypeKeyData instance corresponding to a typecode in the given typelist that
   * matches the given namespace/alias.  If no match is found, returns null.  If more than one match is found, throws a
   * SOAPException.
   *
   * @param typelist  the name of the given typelist (case-insensitive)
   * @param namespace the given namespace (case-insensitive)
   * @param alias     the given alias (case-insensitive)
   * @return TypeKeyData instance corresponding to a typecode; null if no match found
   */
  @Throws (SOAPException, "if more than one result is found for the given namespace/alias")
  @Throws (PermissionException, "if the caller does not have all of the following permissions: ADMIN")
  public function getTypeKeyByAlias(typelist : String, namespace : String, alias : String) : TypeKeyData {
    return TypelistToolsAPIHelper.getTypeKeyByAlias( typelist, namespace, alias )
  }

  /**
   * For use during exports, returns an array of strings representing external aliases to internal typecodes given
   * a typelist, a namespace, and an internal code.  If no aliases are found, then a zero-length, non-null array is
   * returned.  A namespace generally corresponds to an external integration source, but multiple namespaces per source
   * are allowed. NOTE: this method allows multiple aliases to correspond to the same namespace-typecode tuple.  If you
   * require a namespace-typecode to resolve to a single alias, please use getAliasByInternalCode.
   *
   * @param typelist  the name of the given typelist (case-insensitive)
   * @param namespace the given namespace (case-insensitive)
   * @param code      the given typecode (case-insensitive)
   * @return string array of aliases, or a zero-length, non-null string array if no aliases match
   */
  @Throws (SOAPException, "")
  @Throws (PermissionException, "if the caller does not have all of the following permissions: ADMIN")
  public function getAliasesByInternalCode(typelist : String, namespace : String, code : String) : String[]{
    return TypelistToolsAPIHelper.getAliasesByInternalCode( typelist, namespace, code)
  }

  /**
   * For use during exports, returns a string corresponding to an alias to an internal typecode given a typelist, a
   * namespace, and an internal code.  If no match is found, returns null.  If more than one match is found, throws a
   * SOAPException.
   *
   * @param typelist  the name of the given typelist (case-insensitive)
   * @param namespace the given namespace (case-insensitive)
   * @param code      the given typecode (case-insensitive)
   * @return string corresponding to a typecode; null if no match found
   */
  @Throws (SOAPException, "if more than one result is found for the given namespace/typecode")
  @Throws (PermissionException, "if the caller does not have all of the following permissions: ADMIN")
  public function getAliasByInternalCode(typelist : String, namespace : String, code : String) : String {
    return TypelistToolsAPIHelper.getAliasByInternalCode( typelist, namespace, code)
  }
}
