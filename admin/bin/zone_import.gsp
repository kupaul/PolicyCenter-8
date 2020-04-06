uses gw.cmdline.util.ZoneImportToolsArgs
uses gw.lang.cli.CommandLineAccess
uses gw.api.soap.GWAuthenticationHandler
uses java.lang.Integer
uses java.lang.System
uses java.io.File
uses java.net.URL
uses gw.wsi.pl.zoneimportapi.ZoneImportAPI


print( "Running ${CommandLineAccess.getCurrentProgram().Name}" )

//Initialize the args class for this program
CommandLineAccess.initialize( ZoneImportToolsArgs )

//New up a maintenance soap service
var config = new gw.xml.ws.WsdlConfig()
config.ServerOverrideUrl = new URL(ZoneImportToolsArgs.Server + "/ws/gw/wsi/pl/ZoneImportAPI").toURI() 
config.Guidewire.Authentication.Username = ZoneImportToolsArgs.User
config.Guidewire.Authentication.Password = ZoneImportToolsArgs.Password
var api = new ZoneImportAPI( config );
print( "Connecting as ${config.Guidewire.Authentication.Username} to URL ${config.ServerOverrideUrl}" )

var charSetName = "UTF-8"

if(ZoneImportToolsArgs.Charset != null) {
  charSetName = ZoneImportToolsArgs.Charset
}

if(ZoneImportToolsArgs.Import != null) {
  if(ZoneImportToolsArgs.Country == null) {
    print("Please specify both a country and a file to import.")
    System.exit(-1)
  }

  print("Import data for country ${ZoneImportToolsArgs.Country} from file ${ZoneImportToolsArgs.Import}")

  try {
    var zoneData = new File(ZoneImportToolsArgs.Import).read()
    var rows = api.importToStaging( ZoneImportToolsArgs.Country, zoneData, ZoneImportToolsArgs.Clearstaging )
    if(rows < 1) {
      print("Zone data import failed: ${ZoneImportToolsArgs.Import} (The file does not contain any data)")
    } else {
      print("Zone data import succeeded: ${rows} rows imported.")
    }
  } catch (e) {
    print("Zone data import failed: ${e.Message}")
  }
} else if(ZoneImportToolsArgs.Clearproduction) {
  try {
    api.clearProductionTables( ZoneImportToolsArgs.Country )
    print("Clearing production tables succeeded")
  } catch (e) {
    print("Clearing production tables failed: ${e.Message}")
  }
} else if(ZoneImportToolsArgs.Clearstaging) {
  try {
    api.clearStagingTables( ZoneImportToolsArgs.Country )
    if(ZoneImportToolsArgs.Country != null) {
      print("Clearing staging tables for country=${ZoneImportToolsArgs.Country} succeeded")    
    } else {
      print("Clearing staging tables succeeded")
    }
  } catch (e) {
    print("Clearing staging tables failed: ${e.Message}")
  }
} else {
  CommandLineAccess.showHelp( ZoneImportToolsArgs )
}

