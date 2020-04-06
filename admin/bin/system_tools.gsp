uses gw.wsi.pl.systemtoolsapi.types.complex.AWRReportUserSettings
uses gw.api.database.AWRReportUserSettingsFactory
uses gw.wsi.pl.systemtoolsapi.faults.ServerStateException
uses gw.cmdline.util.SystemToolsArgs
uses gw.cmdline.util.ToolkitUtils
uses gw.lang.cli.CommandLineAccess
uses gw.pl.util.FileUtil
uses gw.util.Base64Util
uses gw.util.StreamUtil
uses gw.wsi.pl.systemtoolsapi.SystemToolsAPI
uses gw.wsi.pl.systemtoolsapi.enums.SystemOutLogger_LoggingLevel
uses gw.wsi.pl.systemtoolsapi.types.complex.ProcessID
uses java.io.File
uses java.io.FileOutputStream
uses java.io.IOException
uses java.lang.Integer
uses java.lang.Long
uses java.lang.NumberFormatException
uses java.net.URL
uses java.net.HttpURLConnection
uses java.util.Date

//Initialize the args class for this program
CommandLineAccess.initialize( SystemToolsArgs )

print( "Running ${CommandLineAccess.getCurrentProgram().Name}" )

//New up a messaging soap service
var config = new gw.xml.ws.WsdlConfig()
config.ServerOverrideUrl = new URL(SystemToolsArgs.Server + "/ws/gw/wsi/pl/SystemToolsAPI").toURI() 
config.Guidewire.Authentication.Username = SystemToolsArgs.User
config.Guidewire.Authentication.Password = SystemToolsArgs.Password
var api = new SystemToolsAPI( config );
print( "Connecting as ${config.Guidewire.Authentication.Username} to URL ${config.ServerOverrideUrl}" )

//Ping the server and print its current run level
if( SystemToolsArgs.Ping ) {
  var result = api.getRunlevel()
  var runLevelString = "unknown mode : " + result
  if( result == MULTIUSER) {
    runLevelString = "ready (multiuser mode)"
  } else if( result == STARTING ) {
    runLevelString = "starting up"
  } else if ( result == MAINTENANCE ) {
    runLevelString = "in maintenance mode"
  } else if ( result == DAEMONS ) {
    runLevelString = "in daemons mode"
  }
  print( "Server on '${SystemToolsArgs.Server}' is ${runLevelString}" )
} else if( SystemToolsArgs.CheckDBConsistency != null ) {
  //Perform DB consistency checks
  if (SystemToolsArgs.CheckDBConsistency.length == 0) {
    print( "Submitting DBCC batch job for all database tables from server at '${SystemToolsArgs.Server}'" )
    print( "View results on the Consistency Checks Server Tools Info Page." )
    var pid = api.submitDBCCBatchJob(null, null)
    print( "Database Consistency Checks batch job is being run with PID ${pid.Pid}" )
  } else if( SystemToolsArgs.CheckDBConsistency.length != 2 ) {
    print( "Please specify both a table selection and a consistency check type selection" )
  } else {
    var tablesToCheckArray = convertCommandLineArg(SystemToolsArgs.CheckDBConsistency[0])
    var checksToRunArray = convertCommandLineArg(SystemToolsArgs.CheckDBConsistency[1])
    print("Submitting DBCC batch job for tables: ")
    printCommandLineArgs(tablesToCheckArray)
    print(" and running checks of type: " )
    printCommandLineArgs( checksToRunArray )
    print("View results on the Consistency Checks Server Tools Info Page." )
    try {
    var pid = api.submitDBCCBatchJob(tablesToCheckArray, checksToRunArray)
    print( "Database Consistency Checks batch job is being run with PID ${pid.Pid}" )
    } catch ( e : ServerStateException ) {
      print ( "ERROR:  Unable to submit job.  Reason: ${e.Message}" )
  }
  }
} else if( SystemToolsArgs.GetDBCCState != null and !SystemToolsArgs.GetDBCCState.equals("")) {
  //Check if DBCC is running
  print( "Checking state of consistency check run from server at '${SystemToolsArgs.Server}'" )
  print("The state of the consistency checks process is currently: " + api.getDBCCState())
} else if( SystemToolsArgs.UpdateStatistics != null ) {
  //Kick off the update stats process
  if (SystemToolsArgs.UpdateStatistics.length == 0) {
    print( "Submitting the INCREMENTAL update stats batch job to server at '${SystemToolsArgs.Server}'" )
    api.submitUpdateStats(null, true)
  } else if( SystemToolsArgs.UpdateStatistics.length != 2 ) {
    print( "Please specify both a description and a boolean (true for INCREMENTAL and false for FULL update stats)" )
  } else {
    var descriptionParam = SystemToolsArgs.UpdateStatistics[0]
    var incrementalParam = Boolean.parseBoolean(SystemToolsArgs.UpdateStatistics[1])
    print("Submitting the update stats batch job with description: ")
    print(descriptionParam)
    print("and incremental: ")
    print(incrementalParam)
    try {
    api.submitUpdateStats(descriptionParam, incrementalParam)
    } catch ( e : ServerStateException ) {
      print ( "Unable to submit job.  Reason: ${e.Message}" )
  }
  }
} else if( SystemToolsArgs.CancelUpdateStats != null and !SystemToolsArgs.CancelUpdateStats.equals("")) {
  //Cancel running update stats process
  print("Cancel the update stats process if running")
  api.cancelUpdateStats()
} else if( SystemToolsArgs.GetUpdateStatsState != null and !SystemToolsArgs.GetUpdateStatsState.equals("")) {
  //Check if the update stats process is running
  print( "Checking state of the update stats process from server at '${SystemToolsArgs.Server}'" )
  print("The state of the update stats process is currently: " + api.getUpdateStatsState())
} else if( SystemToolsArgs.SqlServerPerfReport != null ) {
  if( SystemToolsArgs.SqlServerPerfReport.length != 1 and SystemToolsArgs.SqlServerPerfReport.length != 0) {
    print( "Please specify one arguments to SqlServerDmvSnapshot:  whether to collect statistics" )
  } else {
    var collectStatisticsParam = false
    if (SystemToolsArgs.SqlServerPerfReport.length == 1) {
      collectStatisticsParam = Boolean.parseBoolean(SystemToolsArgs.SqlServerPerfReport[0])
    }
    print("Submitting SQL Server DMV Performance Performance Report with collect statistics set to ${collectStatisticsParam}" )
    print("View results on the SQL Server DMV Snapshot Server Tools Info Page or download it here." )
    try {
      var pid = api.submitDmvReportBatchJob(collectStatisticsParam)
      print( "SQL Server DMV Performance Report batch job is being run with PID ${pid.Pid}" )
    } catch ( e : ServerStateException ) {
      print ( "Unable to submit job.  Reason: ${e.Message}" )
    }
  }
} else if( SystemToolsArgs.AwrSnapshots != null ) {
  if( SystemToolsArgs.AwrSnapshots.length != 1 ) {
    print( "Please specify one argument to AwrSnapshots, the number of most recent AWR snapshots to display." )
  } else {
    var numSnapshots : int;
    var argError = false
    try {
      numSnapshots = Integer.parseInt(SystemToolsArgs.AwrSnapshots[0])
    } catch ( e ) {
      argError = true
      print( "First argument to AwrSnapshots, '${SystemToolsArgs.AwrSnapshots[0]}', is not a number." )
    }
    if (!argError) {
      try {
        var databaseSnapshotInfos = api.getRecentAWRSnapshotInfo(numSnapshots)
        if (databaseSnapshotInfos.length == 0) {
          print( "No AWR snapshots found." )
        } else {
          print( "${numSnapshots} most recent AWR snapshots" )
          for( snapshot in databaseSnapshotInfos ) {
            print("ID=${snapshot.Id}, SnapTime=${snapshot.SnapTime}, InstanceStartupTime=${snapshot.StartupTime}")
          }
        }
      } catch ( e ) {
        print ( "Unable to get snapshots.  Reason: ${e.Message}" )
      }
    }
  }
} else if( SystemToolsArgs.RunAwrReport != null ) {
  if( SystemToolsArgs.RunAwrReport.length != 3 ||
      SystemToolsArgs.RunAwrReport.length == 1 &&
        (SystemToolsArgs.RunAwrReport[0].equals("help") || SystemToolsArgs.RunAwrReport[0].equals("?")) ) {
    print( "Please specify three arguments to OracleAWRPerfReport:  beginSnapId, endSnapId, probeV$tables(true/false)" )
    print( "   or beginSnapId, endSnapId, @fn.properties" )
    print( "If using properties file, valid properties are:" )
    print( AWRReportUserSettingsFactory.SystemToolsPropertiesHelpMsg )
  } else {
    var beginSnapId : int
    var snapIdArgError = false
    try {
      beginSnapId = Integer.parseInt(SystemToolsArgs.RunAwrReport[0])
    } catch ( e ) {
      snapIdArgError = true
      print( "First argument, '${SystemToolsArgs.RunAwrReport[0]}', is not a number." )
    }
    var endSnapId : int
    try {
      endSnapId = Integer.parseInt(SystemToolsArgs.RunAwrReport[1])
    } catch ( e ) {
      snapIdArgError = true
      print( "Second argument, '${SystemToolsArgs.RunAwrReport[1]}', is not a number. ")
    }
    if( beginSnapId == endSnapId ) {
      snapIdArgError = true
      print( "First and second arguments, '${SystemToolsArgs.RunAwrReport[1]}', must be different numbers. " )
    } else if ( beginSnapId > endSnapId ) {  // reverse if backwards
      var saveBeginSnapId = beginSnapId
      beginSnapId = endSnapId
      endSnapId = saveBeginSnapId
    }
    if( !snapIdArgError ) {
      var pid : ProcessID
      var awrReportUserSettings : AWRReportUserSettings
      if (SystemToolsArgs.RunAwrReport[2].startsWith("@")) {
        try {
          awrReportUserSettings = ToolkitUtils.readAWRRunParams(SystemToolsArgs.RunAwrReport[2].substring(1))
         } catch (e) {
          print( "Could not finish AWR report: ${e.Message}" )
            java.lang.System.exit(5)
         }
      } else {
        awrReportUserSettings = ToolkitUtils.createAWRReportUserSettings( new AWRReportUserSettingsFactory() )
        awrReportUserSettings.ProbeVDollarTables = Boolean.parseBoolean( SystemToolsArgs.RunAwrReport[2] )
      }
      var awrReportUserSettingsFactory = ToolkitUtils.getAWRReportUserSettingsFactory(awrReportUserSettings)
      var errors = awrReportUserSettingsFactory.validateAWRParams()
      if( errors.size > 0 ) {
        print( "Param settings are: " + awrReportUserSettingsFactory.BooleanSettingsString)
        print( "Errors found in param settings:\n" )
        for( error in errors ) {
          print( error )
        }
      } else {
        awrReportUserSettings.BeginSnapId = beginSnapId
        awrReportUserSettings.EndSnapId = endSnapId
        print( "Submitting Oracle AWR Performance Report between snapshots " +
            Integer.toString(awrReportUserSettings.BeginSnapId) + " and " + Integer.toString(awrReportUserSettings.EndSnapId) +
            " and arguments:\n" + awrReportUserSettingsFactory.BooleanSettingsString )
        try {
          pid = api.submitAwrReportBatchJob(awrReportUserSettings)
          print( "Oracle AWR Performance Report batch job is being run with PID ${pid.Pid}" )
          print("View results on the Oracle AWR Information Server Tools Info Page or download it here." )
        } catch (e : ServerStateException) {
          print ( "Unable to submit job.  Reason: ${e.Message}" )
        }
      }
    }
  }
} else if (SystemToolsArgs.ListPerfReports != null) {
  var numDownloads : int;
  if (SystemToolsArgs.ListPerfReports.length != 0 && SystemToolsArgs.ListPerfReports.length != 1) {
     print( "Please specify zero or one arguments to listPerfReports, the number of most recent database perf reports to display, "
        + "with the default of all." )
  } else {
    var argError = false
    if (SystemToolsArgs.ListPerfReports.length == 0) {
      numDownloads = 0;
    } else {
      try {
        numDownloads = Integer.parseInt(SystemToolsArgs.ListPerfReports[0])
      } catch (e : NumberFormatException) {
        argError = true
        print("First argument to ListOraDownloads, '${SystemToolsArgs.ListPerfReports[0]}', is not a number.")
      }
    }
    if (!argError) {
      try {
        var perfDownloadDetails = api.getPerfReportsInfo(numDownloads)
        if (perfDownloadDetails.length == 0) {
          print( "No database performance download found." )
        } else {
          print( "Most recent database performance downloads" )
          for (perfDownloadDetail in perfDownloadDetails) {
            print (perfDownloadDetail)
          }
        }
      } catch (e) {
        print ("Unable to get download info.  Reason: ${e.Message}")
      }
    }
  }
} else if( SystemToolsArgs.DownloadPerfReport != null ) {
   if( SystemToolsArgs.DownloadPerfReport.length != 1 ) {
     print( "Please specify one argument to getPerfReport, the ID of the report to download." )
   } else {
     var reportID : String;
     var argError = false
     try {
       reportID = SystemToolsArgs.DownloadPerfReport[0]
     } catch ( e ) {
       argError = true
       print( "First argument to getPerfReport, '${SystemToolsArgs.DownloadPerfReport[0]}', is not a number." )
     }
     if (!argError) {
       var authString = SystemToolsArgs.User + ":" + SystemToolsArgs.Password
       var encoded = Base64Util.encode(authString.Bytes)
       var url = new URL("${SystemToolsArgs.Server}/service/dbinfo?reportid=${reportID}");
       try {
         var urlConnection = url.openConnection() as HttpURLConnection
         urlConnection.setRequestProperty("Authorization", "Basic " + encoded)
         var filePath =  SystemToolsArgs.FilePath == null ? "." : SystemToolsArgs.FilePath
         if (urlConnection.ResponseCode == HttpURLConnection.HTTP_NOT_FOUND) {
           print("Database performance report ${reportID} was not found")
         } else if (urlConnection.ContentType.equals("application/x-zip-compressed")) {
           var zipFile = createZipFile("DbPerfReport", filePath)
           StreamUtil.copy(urlConnection.InputStream, new FileOutputStream(zipFile))
           print("Database performance report stored in ${zipFile.CanonicalPath}")
         } else {
           var textFile = createTextFile("DbPerfReportErrors", filePath)
           StreamUtil.copy(urlConnection.InputStream, new FileOutputStream(textFile))
           print("Zip file not returned.  Error messages saved in ${textFile.CanonicalPath}")
         }
	     } catch (e : IOException) {
         print ( "Unable to get database performance report.  Reason: ${e.Class} ${e.Message}" )
       }
     }
   }
 } else if( SystemToolsArgs.GetDBStatisticsStatements ) {
  for( data in api.getUpdateTableStatisticsData() ) {
    var updateStmts = data.StatisticsUpdateStatements.Entry.join(";\n")
    print( "--<%=data.TableName%>\n ${updateStmts}\n" )
  }
 } else if( SystemToolsArgs.GetIncrementalDBStatisticsStatements ) {
  for( data in api.getIncrementalUpdateTableStatisticsData() ) {
    var updateStmts = data.StatisticsUpdateStatements.Entry.join(";\n")
    print( "--<%=data.TableName%>\n ${updateStmts}\n" )
  }
 } else if( SystemToolsArgs.ReportDBStats != null ) {
  //Report DB Statistics
  var filePath =  SystemToolsArgs.FilePath == null ? "." : SystemToolsArgs.FilePath
  if ( SystemToolsArgs.ReportDBStats.length == 0 ) {
    print("Generating and reporting database statistics for all database tables from '${SystemToolsArgs.Server}'; this may take a while");
    printDBStatsCommandLineArgs(null, null, null)
    var bytes = api.reportPartialDatabaseCatalogStatistics(null, null, null)
    writeZipFile(bytes, "DBCatalogStatistics", filePath )
  } else if( SystemToolsArgs.ReportDBStats.length != 3 ) {
    print("Please specify a table selection, a staging table selection and a typelist table selection");
  } else {
    print("Generating and reporting database statistics for selected database tables from '${SystemToolsArgs.Server}'; this may take a while")
    var tables = convertCommandLineArg( SystemToolsArgs.ReportDBStats[0] )
    var stagingTables = convertCommandLineArg( SystemToolsArgs.ReportDBStats[1] )
    var typelistTables = convertCommandLineArg( SystemToolsArgs.ReportDBStats[2] )
    var bytes = api.reportPartialDatabaseCatalogStatistics(tables, stagingTables, typelistTables)
    writeZipFile(bytes, "DBCatalogStatistics", filePath );
  }
} else if( SystemToolsArgs.Version ) {
    var version = api.getVersion()
    if (version == null) {
      print("Server '${SystemToolsArgs.Server}' is not ready")
      return
    }
    var configVersion = version.ConfigVersion
    if (configVersion == "") {
        configVersion = "(not available)"
    }
    print("")
    print("Server:                  ${SystemToolsAPI.ADDRESS}")
    print("Product version:         ${version.AppVersion}")
    print("Database schema version: ${version.SchemaVersion}")
    print( version.ConfigVersion )
    print("Config version:          ${configVersion}")
} else if ( SystemToolsArgs.Maintenance ) {
  //Runlevel stuff
  try {
    api.setRunlevel( MAINTENANCE )
    print("Server in maintenance mode")
  } catch (e) {
    print( "Unable to switch server to maintenance mode.  Reason: ${e.Message}")
  }
} else if ( SystemToolsArgs.Daemons ) {
  try {
    api.setRunlevel( DAEMONS )
    print("Server in daemons mode")
  } catch (e) {
    print( "Unable to switch server to daemons mode.  Reason: ${e.Message}")
  }
} else if ( SystemToolsArgs.MultiUser ) {
  try {
    api.setRunlevel( MULTIUSER )
    print("Server in multiuser mode")
  } catch (e) {
    print( "Unable to switch server to multiuser mode.  Reason: ${e.Message}")
  }
} else if ( SystemToolsArgs.SessionInfo ) {
  //Show session information
  var activeSessionData = api.getActiveSessionData()

  //partition sessions on user name
  var userNameToSessions = activeSessionData.partition( \ s -> s.UserName == null ? "Temporary system user" : s.UserName   )

  //collapse to count of user names
  var userNameToCount = userNameToSessions.mapValues( \ l -> l.Count )

  //sort entries by count
  var entriesSortedByCount = userNameToCount.entrySet().toList().sortByDescending( \ m -> m.Value  )

  //print out each username and the number of sessions they have
  print( "${activeSessionData.length} active sessions:" )
  for( entry in entriesSortedByCount ) {
    print( "${entry.Key} - ${entry.Value}" )
  }
} else if( SystemToolsArgs.UpdateLoggingLevel != null ) {
  //Update the logging level of the server
  if( SystemToolsArgs.UpdateLoggingLevel.length != 2 ) {
    print( "Please specify both a logger and a new logging level")
  } else {
    api.updateLoggingLevel(SystemToolsArgs.UpdateLoggingLevel[0], SystemOutLogger_LoggingLevel.forGosuValue( SystemToolsArgs.UpdateLoggingLevel[1] ))
  }
} else if( SystemToolsArgs.LoggerCategories ) {
  //Show all logger categories on the server
  api.getLoggingCategories().each( \ s -> print( s )  )
} else if( SystemToolsArgs.ReloadLoggingConfig ) {
  //Reload the logging configuration
  print( "Reloading logging config..." )
  api.reloadLoggingConfig()
  print( "Logger configuration reloaded" )
} else if ( SystemToolsArgs.RecalculateChecksums ) {
  print("Attempting to recalculate file checksums . . .")
  if ( api.recalculateFileChecksums() ) {
    print("File checksums successfully recalculated")
  } else {
    print( "Cannot recalculate checksums as the server is running either with clustering disabled or with configuration verification disabled" )
  }
} else if ( SystemToolsArgs.VerifyDBSchema ) {
  print("Verify the data model matches the physical database of server at '${SystemToolsArgs.Server}'; this may take a few minutes");
  var diffs = api.verifyDatabaseSchema()
  if (diffs.length != 0) {
    print("Inconsistencies detected!");
    diffs.each( \ s -> print( s )  )
  } else {
    print("No inconsistencies found");
  }
} else {
  CommandLineAccess.showHelp( SystemToolsArgs )
}

print( "done" )
java.lang.System.exit(0)

//==============================================================================
// Helper functions
//==============================================================================
function convertCommandLineArg( commandLineArg : String ) : String[] {
  var args : String[]
  if (commandLineArg.equalsIgnoreCase("all")) {
    // null is the return value
  } else if (commandLineArg.equalsIgnoreCase("none")) {
    args = {}
  } else if (not commandLineArg.startsWith("@")) { // single table
    args = {commandLineArg};
  } else { // file of table names
    var filename = commandLineArg.substring(1)
    args = ToolkitUtils.readSimpleCSV( filename )
  }
  return args;
}

function printCommandLineArgs( argsToCheck : String[] ) {
  if (argsToCheck == null) {
    print( "all" );
  } else if (argsToCheck.length == 0) {
    print( "none" );
  } else {
    print( argsToCheck.join( ", " ) )
  }
}

function printDBStatsCommandLineArgs(tablesToCheckArray : String[] , stagingTablesToCheckArray : String[] , typeListTablesToCheckArray : String[] ) {
  print("Running partial database statistics for tables: ")
  printCommandLineArgs(tablesToCheckArray)
  print("  and staging tables: ")
  printCommandLineArgs(stagingTablesToCheckArray)
  print("  and typelist tables: ")
  printCommandLineArgs(typeListTablesToCheckArray)
  print("")
}

function createZipFile(filename : String, filePath : String) : File {
  return createFile(filename, filePath, "zip")
}

function createTextFile(filename : String, filePath : String) : File {
  return createFile(filename, filePath, "txt")
}

function createFile(fileName : String, filePath : String, suffix : String) : File {
  if (filePath == null) {
    filePath = ".";
  }
  if (filePath.endsWith(File.separator)) {
    filePath = filePath.substring(0, filePath.length() - 1);
  }
  var date = new Date()
  var dateString = date.toString().replace(" ", "_").replace(":", ".")
  return new File("${filePath}${File.separator}${fileName}_${dateString}.${suffix}")
}

function writeZipFile( bytes : byte[] , fileName : String, filePath : String ) {
  var zipFile = createZipFile(fileName, filePath)
  print( "Writing zip file ${zipFile.toString()}" )
  try {
    zipFile.writeBytes( bytes )
    print( "Done writing file ${zipFile.toString()}" )
  } catch( e ) {
    print( "Could not write file ${zipFile.toString()}" )
    print( e.Message )
    e.printStackTrace()
  }
}
