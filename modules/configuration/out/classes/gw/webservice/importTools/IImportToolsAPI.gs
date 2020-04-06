package gw.webservice.importTools

uses gw.api.webservice.WSRunlevel
uses gw.api.webservice.importTools.ImportResults
uses gw.api.webservice.importTools.ImportToolsImpl
uses gw.api.webservice.exception.DataConversionException
uses gw.api.webservice.exception.PermissionException
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.exception.SOAPServerException
uses gw.api.webservice.exception.RequiredFieldException
uses java.lang.SuppressWarnings

/**
 * IImportToolsAPI is a remote interface to a set of tools to import XML data to the
 * server.
 * <p/>
 * The XML import format is defined by dynamically-generated XML Schema Definition (XSD) files. Regenerate the XSD
 * files with the regen-xsd task. After XSD regeneration, you will find the XSD files in dist/xsd/import,
 * including the three XSD files: xx_typelists.xsd, xx_entities.xsd, xx_import.xsd (with "xx" replaced by the Guidewire
 * product code, e.g., "cc" for ClaimCenter).
 */
@RpcWebService(WSRunlevel.NODAEMONS, {SystemPermissionType.TC_SOAPADMIN})
@Deprecated("Use WS-I webservice gw.wsi.pl.ImportToolsAPI instead.")
@SuppressWarnings("deprecation")
@Export
class IImportToolsAPI
{
  construct()
  {
  }

  /**
   * Import XML data.
   * To improve performance, the XML data string can be wrapped with CDATA tags.
   * For example:
   * <pre>&lt;![CDATA[<br>
   *   ...import XML...<br>
   * ]]></pre>
   *
   * Note that importing data through this call does not generate events for the newly imported objects.
   * <p>
   * <b>WARNING</b>: this is <em>only</em> supported for administrative database tables (such as User)
   * because these XML import routines do not perform complete data validation tests on imported data.
   * Any other use (claims, policies, etc) is dangerous and is <b>NOT</b> supported
   *
   * @param xmlData The data to import, passed as a String.    This may not be null or empty.
   * @return Set of results of the import (number of entities imported by type, and so on).  If the import failed,
   *         ImportResults will have the ok flag set to <code>false</code>, and the errorLog element will
   *         contain descriptions of the errors that were encountered.
   */
  @Throws(DataConversionException, "If the data can't be imported because it violates duplicate key constraints, contains nulls in non-nullable fields, or otherwise can't be safely inserted into the database.")
  @Throws(RequiredFieldException, "If xmlData is null or empty.")
  @Throws(SOAPException, "")
  @Throws(PermissionException, "If the user does not have SOAP Admin permission.")
  public function importXmlData(xmlData : String) : ImportResults {
    var delegate_ = new ImportToolsImpl()
    return delegate_.importXmlData( xmlData )
  }

  /**
   * Import XML data, passing the data as an array of UTF-8 bytes representing the XML string.
   * To improve performance, the XML data string can be wrapped with CDATA tags.
   * For example:
   * <pre>&lt;![CDATA[<br>
   *   ...import XML...<br>
   * ]]></pre>
   *
   * Note that importing data through this call does not generate events for the newly imported objects.
   * <p>
   * <b>WARNING</b>: this is <em>only</em> supported for administrative database tables (such as User)
   * because these XML import routines do not perform complete data validation tests on imported data.
   * Any other use (claims, policies, etc) is dangerous and is <b>NOT</b> supported
   *
   * @see #importXmlData(String)
   * @param xmlData The data to import, passed as a byte[] for the UTF-8 bytes representing the XML string.    This may not be null or empty.
   * @return Set of results of the import (number of entities imported by type, and so on).  If the import failed,
   *         ImportResults will have the ok flag set to <code>false</code>, and the errorLog element will
   *         contain descriptions of the errors that were encountered.
   */
  @Throws(DataConversionException, "If the data can't be imported because it violates duplicate key constraints, contains nulls in non-nullable fields, or otherwise can't be safely inserted into the database.")
  @Throws(RequiredFieldException, "If xmlData is null or empty.")
  @Throws(SOAPException, "")
  @Throws(PermissionException, "If the user does not have SOAP Admin permission.")
  public function importXmlDataAsByteArray(xmlData : byte[]) : ImportResults {
    var delegate_ = new ImportToolsImpl()
    return delegate_.importXmlDataAsByteArray( xmlData )
  }

  /**
   * Import CSV data.
   *
   * Note that importing data through this call does not generate events for the newly imported objects.
   * <p>
   * <b>WARNING</b>: this is <em>only</em> supported for administrative database tables (such as User)
   * because these XML import routines do not perform complete data validation tests on imported data.
   * Any other use (claims, policies, etc) is dangerous and is <b>NOT</b> supported
   *
   * @param csvData The data to import, passed as a String.  This may not be null.
   * @return Set of results of the import (number of entities imported by type, and so on).  If the import failed,
   *         ImportResults will have the ok flag set to <code>false</code>, and the errorLog element will
   *         contain descriptions of the errors that were encountered.
   */
  @Throws(DataConversionException, "If the data can't be imported because it violates duplicate key constraints, contains nulls in non-nullable fields, or otherwise can't be safely inserted into the database.")
  @Throws(RequiredFieldException, "If csvData is null.")
  @Throws(SOAPException, "")
  @Throws(PermissionException, "If the user does not have SOAP Admin permission.")
  public function importCsvData(csvData : String, dataSet : int, ignoreNullConstraintViolations : boolean, ignoreAllErrors : boolean) : ImportResults {
    var delegate_ = new ImportToolsImpl()
    return delegate_.importCsvData( csvData, dataSet, ignoreNullConstraintViolations, ignoreAllErrors )
  }

  /**
   * Convert CSV data to XML data suitable to be imported by {@link #importXmlData(String)}
   *
   * @param csvData                        A String containing CSV data
   * @param ignoreNullConstraintViolations Whether to continue after detecting an empty field in the CSV that
   *                                       corresponds to a property that is not nullable.  If false, throws an exception in this situation.
   * @param ignoreAllErrors
   * @return a String containing equivalent import data in XML format, suitable for import by #importXmlData(String)
   */
  @Throws(SOAPException, "")
  @Throws(SOAPServerException, "")
  @Throws(PermissionException, "If the user does not have SOAP Admin permission.")
  public function csvToXml(csvData : String, ignoreNullConstraintViolations : boolean, ignoreAllErrors : boolean) : String {
    var delegate_ = new ImportToolsImpl()
    return delegate_.csvToXml( csvData, ignoreNullConstraintViolations, ignoreAllErrors )
  }

  /**
   * Convert CSV data to XML data suitable to be imported {@link #importXmlData(String)}
   *
   * @param csvData                        A String containing CSV data
   * @param dataSet                        An int defining the number of the dataset to be imported.  Datasets are ordered by inclusion, and
   *                                       the smallest dataset is always numbered 0.  Thus Dataset 0 is a subset of dataset 1, and datatset 1
   *                                       is a subset of dataset 2, etc.  If this param is set to -1, all data will be imported.
   * @param ignoreNullConstraintViolations Whether to continue after detecting an empty field in the CSV that
   *                                       corresponds to a property that is not nullable.  If false, throws an exception in this situation.
   * @param ignoreAllErrors
   * @return a String containing equivalent import data in XML format, suitable for import by #importXmlData(String)
   */
  @Throws(SOAPException, "")
  @Throws(SOAPServerException, "")
  @Throws(PermissionException, "If the user does not have SOAP Admin permission.")
  public function csvToXml(csvData : String, dataSet : int, ignoreNullConstraintViolations : boolean, ignoreAllErrors : boolean) : String {
    var delegate_ = new ImportToolsImpl()
    return delegate_.csvToXml( csvData, dataSet, ignoreNullConstraintViolations, ignoreAllErrors )
  }

  /**
   * Export XML data into CSV data.  The reverse operation from #csvToXml(String)
   *
   * @param xmlData String containing CSV data
   * @return a String containing equivalent import data in CSV format.  The result of calling csvToXml on the result
   *         should be an equivalent XML document to #xmlData.
   */
  @Throws(SOAPException, "")
  @Throws(PermissionException, "If the user does not have SOAP Admin permission.")
  public function xmlToCsv(xmlData : String) : String {
    var delegate_ = new ImportToolsImpl()
    return delegate_.xmlToCsv( xmlData)
  }

  /**
   * Rebuild the role privileges data by deleting the priviliges data in the database, and then
   * re-importing the roleprivileges.csv file.
   */
  @Throws(SOAPException, "")
  @Throws(SOAPServerException, "")
  @Throws(PermissionException, "If the user does not have SOAP Admin permission.")
  public function rebuildRolePrivileges() {
    var delegate_ = new ImportToolsImpl()
    delegate_.rebuildRolePrivileges()
  }

}
