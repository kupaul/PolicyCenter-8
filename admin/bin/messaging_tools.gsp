uses gw.cmdline.util.MessagingToolsArgs
uses gw.lang.cli.CommandLineAccess
uses java.text.SimpleDateFormat
uses java.net.URL
uses gw.webservice.pc.pc800.messagingtoolsapi.MessagingToolsAPI

print( "Running ${CommandLineAccess.getCurrentProgram().Name}" )

//Initialize the args class for this program
CommandLineAccess.initialize( MessagingToolsArgs )

//New up a messaging WS-I service
var config = new gw.xml.ws.WsdlConfig()
config.ServerOverrideUrl = new URL(MessagingToolsArgs.Server + "/ws/gw/webservice/pc/pc800/MessagingToolsAPI").toURI()
config.Guidewire.Authentication.Username = MessagingToolsArgs.User
config.Guidewire.Authentication.Password = MessagingToolsArgs.Password
var api = new MessagingToolsAPI( config );
print( "Connecting as ${config.Guidewire.Authentication.Username} to URL ${config.ServerOverrideUrl}" )

if( MessagingToolsArgs.Purge != null ) {
  var format = new SimpleDateFormat("MM/dd/yyyy")
  var cutoff = format.parse( MessagingToolsArgs.Purge )
  print("Purging completed messages with cutoff ${format.format( cutoff )}" )
  api.purgeCompletedMessages( cutoff )
  print("Message table purged")
} else if( MessagingToolsArgs.Retry != null ) {
  print("Retrying message ${MessagingToolsArgs.Retry}...")
  try {
    if( api.retryMessage( MessagingToolsArgs.Retry ) ) {
      print( "Message retried" )
    } else {
      print( "Message retry failed" )
    }
  } catch( e ) {
    print( "Message retry failed with exception: ${e.Message}" )
  }
} else if( MessagingToolsArgs.Skip != null ) {
  print("Skipping message ${MessagingToolsArgs.Skip}...")
  try {
    if ( api.skipMessage( MessagingToolsArgs.Skip ) ) {
      print( "Message skipped" )
    } else {
      print( "Message skip failed" )
    }
  } catch( e ) {
    print( "Message skip failed with exception: ${e.Message}" )
  }
} else if( MessagingToolsArgs.RetryDest != null ) {
  print("Retrying retryable error messages for destination ${MessagingToolsArgs.RetryDest}...");
  if ( api.retryRetryableErrorMessages( MessagingToolsArgs.RetryDest ) ) {
    print( "Messages retried" )
  } else {
    print( "No messages retried" )
  }
} else if( MessagingToolsArgs.Suspend != null ) {
  api.suspendDestinationBothDirections( MessagingToolsArgs.Suspend )
  print("Destination ${MessagingToolsArgs.Suspend} suspended")
} else if( MessagingToolsArgs.Resume != null ) {
  api.resumeDestinationBothDirections( MessagingToolsArgs.Resume )
  print("Destination ${MessagingToolsArgs.Resume} resumed")
} else if( MessagingToolsArgs.Config != null ) {
  var rtn = api.getConfiguration( MessagingToolsArgs.Config  )
  print("Destination ${MessagingToolsArgs.Config}")
  print("\tChunk ${rtn.ChunkSize}")
  print("\tRetries ${rtn.MaxRetries}")
  print("\tShutdownWait ${rtn.ShutdownTimeout}")
  print("\tInitial ${rtn.InitialRetryInterval}")
  print("\tBackoff ${rtn.RetryBackoffMultiplier}")
  print("\tPoll ${rtn.PollInterval}")
  print("\tThreads ${rtn.NumSenderThreads}")
  print("\tMultiThreadNSOO ${rtn.MultiThreadNonSafeOrderedMessages}")
  print("\tStrictNSOO ${rtn.SingleThreadOnNonSafeOrderedMessages}")
} else if( MessagingToolsArgs.Restart != null ) {
  api.configureDestination( MessagingToolsArgs.Restart,
      MessagingToolsArgs.Wait,
      MessagingToolsArgs.Retries,
      MessagingToolsArgs.Initial,
      MessagingToolsArgs.Backoff,
      MessagingToolsArgs.Poll,
      MessagingToolsArgs.Threads,
      MessagingToolsArgs.Chunk)
  print("Destination ${MessagingToolsArgs.Restart} restarted")
} else if( MessagingToolsArgs.Resync ) {
  var destination = MessagingToolsArgs.Destination
  var accountNumber = MessagingToolsArgs.Account
  if( destination == null or accountNumber == null ) {
    print( "Please include a account number and destination id via the -account and -destination options." )
    return
  }
  try {
    api.resyncAccount( destination, accountNumber )
    print( "Account (${accountNumber}) resynced against destination ${destination}" )
  } catch ( e ) {
    print( "Account resync failed: ${e.Message}" )
  }
} else if ( MessagingToolsArgs.Statistics != null ) {
  var stats = api.getTotalStatistics( MessagingToolsArgs.Statistics )
  print( "Destination ${MessagingToolsArgs.Statistics}: ${stats.Failed} failed, ${stats.Inflight} inflight, "  +
         "${stats.Retry} retryable error, ${stats.Unsent} unsent" )
} else {
  CommandLineAccess.showHelp( MessagingToolsArgs )
}

print( "done" )
