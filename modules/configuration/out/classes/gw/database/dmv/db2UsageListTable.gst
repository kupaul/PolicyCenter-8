<% uses java.util.TimeZone %>
<% uses java.util.Collection %>
<% uses javax.xml.bind.annotation.XmlAccessOrder %>
<% uses gw.xml.XmlSimpleValue %>
<% uses com.guidewire.pl.system.database.dmv.DB2MonClasses %>
<% uses gw.xsd.database.db2objectusage.* %>
<% uses com.guidewire.pl.perfdownload.platform.analyzer.internal.QueryHandle%>
<% uses gw.util.fingerprint.FP64 %>
<% uses java.lang.Integer %>
<% uses java.lang.Double %>

<%@ params( objectUsages : Collection<DB2MonClasses.DB2PDObjectUsage >, linkTitle : String,
            linkGen : block(t : DB2MonClasses.DB2PDObjectUsage ) : String,
            getTotals : block ( key: String ) : DB2MonClasses.DB2MonTotals ) %>

   <table id="hotObjects" class="sortable" border="1" cellpadding="2" cellspacing="0">
     <tr>
   <th>${linkTitle}</th>
   <th>Object Name</th>
   <th>Num Ref With Metrics</th>
   <th>Object L Reads</th>
   <th>Object L Reads/Exec</th>
   <th>Object L Reads % Total</th>
   <th>Object P Reads</th>
   <th>Object P Reads/Execs</th>
   <th>Object P Reads % Total</th>
   <th>Direct Writes</th>
   <th>Direct Write Reqs</th>
   <th>Direct Reads</th>
   <th>Direct Read Reqs</th>
   <th>Rows Inserted</th>
   <th>Rows Deleted</th>
   <th>Rows Updated</th>
   <th>Rows Read</th>
   <th>Overflow Creates</th>
   <th>Overflow Accesses</th>

   <th>Member</th>
   <th>Data Partition Id</th>
   <th>Mon Interval Id</th>
   <th>Last Updated</th>
   <th>Num References</th>
   <th>Lock Wait Time</th>
   <th>Lock Wait Time Global</th>
   <th>Lock Waits</th>
   <th>Lock Waits Global</th>
   <th>Lock Escals</th>
   <th>Lock Escals Global</th>
   <th>Object Data Gbp L Reads</th>
   <th>Object Data Gbp P Reads</th>
   <th>Object Data Gbp Invalid Pages</th>
   <th>Object Data Lbp Pages Found</th>
   <th>Object Data Gbp Indep Pages Found In Lbp</th>
   <th>Usagelistschema</th>
   <th>Usagelistname</th>
        </tr>
           <% var oldObjName = "";
              var totals : DB2MonClasses.DB2MonTotals
              
             var clss = "awrc"
             for (tuRaw in objectUsages) {

             var tu = DB2OBJECTUSAGE.parse(tuRaw.RawXML)
               if (!tu.OBJNAME.contentEquals(oldObjName)) {
                 totals = getTotals(tu.OBJNAME)
                 oldObjName = tu.OBJNAME
               }
             clss  =  clss == "awrnc" ? "awrc"  : "awrnc" %>
         <tr  class="${clss}">

<td>${linkGen(tuRaw)}</td>
<td>${tu.OBJNAME}</td>
<td>${tu.NUM_REF_WITH_METRICS}</td>
<td>${tu.OBJECT_L_READS}</td>
<td>${tu.OBJECT_L_READS/tu.NUM_REF_WITH_METRICS}</td>
<td>${totals.LReads == 0 ? -1 : 100 * tu.OBJECT_L_READS/totals.LReads}</td>
<td>${tu.OBJECT_P_READS}</td>
<td>${tu.OBJECT_P_READS/tu.NUM_REF_WITH_METRICS}</td>
<td>${totals.PReads == 0 ? -1 : 100 * tu.OBJECT_P_READS/totals.PReads}</td>
<td>${tu.DIRECT_WRITES}</td>
<td>${tu.DIRECT_WRITE_REQS}</td>
<td>${tu.DIRECT_READS}</td>
<td>${tu.DIRECT_READ_REQS}</td>
<td>${tu.ROWS_INSERTED}</td>
<td>${tu.ROWS_DELETED}</td>
<td>${tu.ROWS_UPDATED}</td>
<td>${tu.ROWS_READ}</td>
<td>${tu.OVERFLOW_CREATES}</td>
<td>${tu.OVERFLOW_ACCESSES}</td>

<td>${tu.MEMBER}</td>
<td>${tu.DATA_PARTITION_ID}</td>
<td>${tu.MON_INTERVAL_ID}</td>
<td>${tu.LAST_UPDATED}</td>
<td>${tu.NUM_REFERENCES}</td>
<td>${tu.LOCK_WAIT_TIME}</td>
<td>${tu.LOCK_WAIT_TIME_GLOBAL}</td>
<td>${tu.LOCK_WAITS}</td>
<td>${tu.LOCK_WAITS_GLOBAL}</td>
<td>${tu.LOCK_ESCALS}</td>
<td>${tu.LOCK_ESCALS_GLOBAL}</td>
<td>${tu.OBJECT_GBP_L_READS}</td>
<td>${tu.OBJECT_GBP_P_READS}</td>
<td>${tu.OBJECT_GBP_INVALID_PAGES}</td>
<td>${tu.OBJECT_LBP_PAGES_FOUND}</td>
<td>${tu.OBJECT_GBP_INDEP_PAGES_FOUND_IN_LBP}</td>
<td>${tu.USAGELISTSCHEMA}</td>
<td>${tu.USAGELISTNAME}</td>
         </tr>


     <% } %>

    </table>
