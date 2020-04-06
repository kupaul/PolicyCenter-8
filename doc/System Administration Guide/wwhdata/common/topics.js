/*
 *   Title: TopicUtils-JavaScript.js
 *   
 *  JavaScript related to the TopicUtils code. This file gets COPIED into the output webworks files to support
 *  the link to this page code.
 */

 
// extracts the src=myfilename from the URL
function Guidewire_ExtractSrcFromURL() {
	var VarDocumentURL = window.WWHFrame.location;
	var TheParametersArray = VarDocumentURL.hash.split("&");
	var thisParam;
	var FMSourceFile = "UNKNOWN_FRAMEMAKER_SOURCE_FILE";

	k = TheParametersArray.length;
	for (i= 0 ; i < k; i++) {
	   thisParam = unescape(TheParametersArray[i]);
	   if (thisParam.search(/^src=/) != -1) {
		  FMSourceFile = thisParam.substring(4); // strip off the "src=" at the beginning
		}
	 }
	return FMSourceFile;
}

// takes a file name of format "myfilename.4.3" and gets the beginning part and returns "myfilename" only
function Guidewire_FMSourceFileExtract(FullFileName)
{
  var VarSplitURL= FullFileName.split(".");
  return VarSplitURL[0];
}

// is the src=myfile arg from the URL (which means it was from myfile.fm) match the desired file
// generally speaking we do not care since we just want it unique per book
// so we just say yes, but we say false if it's a special file that allows duplicates in one book
function Guidewire_FMSourceFileMatch(FROM_URL,LOCAL_FILENAME) {
	var varFileURL = FROM_URL.toLowerCase();
	var varFileActual = LOCAL_FILENAME.toLowerCase();

	// SPECIAL CASE FOR UPGRADE GUIDE PROCEDURES -- BASICALLY 
	if (varFileURL.search(/^procedure-/) != -1) {
	  if  (varFileActual.search(/^procedure-/) != -1)  { 
		  return (varFileURL == Guidewire_FMSourceFileExtract(varFileActual)); 
		} else { 
		 return false; 
	   }
	 }
	else {
	   // basically, the default is to say they match... 
	   // if it's one of these specially-handled files, just let it work  
	   return true; 
	}
}


// this function takes a topic Name and converts it to a simpler string, such as underscores instead of space chars
// This is also important because FrameMaker + ePubs's  native handling of topic alias names mirror this behavior
//
// IMPORTANT: IF YOU CHANGE THIS CODE IN CONTROLS.JS (IN TEMPLATE OVERRIDES), ALSO CHANGE THE MIRROR FUNCTION IN TOPICUTILS-JAVASCRIPT.JS
// IMPORTANT: IF YOU CHANGE THIS CODE IN TOPICUTILS.FSL, ALSO CHANGE THE MIRROR FUNCTION IN CONTROLS.JS (IN TEMPLATE OVERRIDES)
// THE CONTROLS.JS FUNCTION ENCODES THE URL, AND THIS FUNCTION ENCODES it and compares against the input string with the full name for each topic (potentially with funny characters)
function Guidewire_SafeTopicName(theTitle) {
theTitle = theTitle.replace(/ /g, "_");  // converts space char
theTitle = theTitle.replace(/\u00a0/g, "_");  // converts nbsp char
// censor (remove) characters that mess up epublisher in URLs: forward slash, backslash, question mark, &amp;
theTitle= theTitle.replace(/[\\\/\?]/g, "");
theTitle = theTitle.replace(/&/g, "");
theTitle = theTitle.replace(/\u201c/g, ""); // double quote smart L
theTitle = theTitle.replace(/\u201d/g, "");// double quote smart R
theTitle = theTitle.replace(/\u2018/g, "");// single quote smart L
theTitle = theTitle.replace(/\u2019/g, "");// single quote smart R
theTitle = theTitle.replace(/\u2022/g, "");// trademark
theTitle = theTitle.replace(/'/g, "");// apparently a dumb single quote gets stripped by webworks
theTitle = theTitle.replace(/"/g, "");// to be safe let us strip double quotes too
theTitle = theTitle.replace(/\</g, "(");  // open bracket
theTitle = theTitle.replace(/\>/g, ")");   // close bracket
theTitle = theTitle.replace(/:/g, "_");    // colon
theTitle = theTitle.replace(/&/g, "");
return (theTitle);  }




function Guidewire_TopicMatch(FROMEPUB,WHATTOMATCH) {
var varLower1 = FROMEPUB.toLowerCase();
var varLower2 = WHATTOMATCH.toLowerCase();
var varLower2Safe = Guidewire_SafeTopicName(varLower2)

// match positively if they naturally match, or they match the safe version (convert spaces to underscores...)
var varMatches = (varLower1 == varLower2 || varLower1 == Guidewire_SafeTopicName(varLower2))

// console.log(Guidewire_TopicMatch, varLower1, varLower2, varLower2Safe, varMatches)
return varMatches
}
function GUIDEWIRE_TOPIC_TO_FILE(TOPIC, SRCFILE) { 
if (Guidewire_TopicMatch(TOPIC,"cover")) return "index.html"

else if (Guidewire_TopicMatch(TOPIC,"Guidewire PolicyCenter\u00ae") && Guidewire_FMSourceFileMatch(SRCFILE,"cover-admin.html") ) { return "cover-admin.html";}
else if (Guidewire_TopicMatch(TOPIC,"About PolicyCenter Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"about.html") ) { return "about.html";}
else if (Guidewire_TopicMatch(TOPIC,"Basic Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"configndeploy.03.1.html") ) { return "configndeploy.03.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"The config.xml File") && Guidewire_FMSourceFileMatch(SRCFILE,"configndeploy.03.2.html") ) { return "configndeploy.03.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"The database-config.xml File") && Guidewire_FMSourceFileMatch(SRCFILE,"configndeploy.03.3.html") ) { return "configndeploy.03.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining the Application Server Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"configndeploy.03.4.html") ) { return "configndeploy.03.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Geocoding Feature") && Guidewire_FMSourceFileMatch(SRCFILE,"configndeploy.03.5.html") ) { return "configndeploy.03.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring an Email Server for Notifications") && Guidewire_FMSourceFileMatch(SRCFILE,"configndeploy.03.6.html") ) { return "configndeploy.03.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changing the Unrestricted User") && Guidewire_FMSourceFileMatch(SRCFILE,"configndeploy.03.7.html") ) { return "configndeploy.03.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Logging") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.01.html") ) { return "logging.04.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Logging Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.02.html") ) { return "logging.04.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Specifying Location of Log Files for the View Logs Page") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.03.html") ) { return "logging.04.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Logging in a Multiple Instance Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.04.html") ) { return "logging.04.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Logging Levels") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.05.html") ) { return "logging.04.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Logging Successfully Archived Policy Terms and Policy Periods") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.06.html") ) { return "logging.04.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Logs for Additional System Components") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.07.html") ) { return "logging.04.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Information in Log Messages") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.08.html") ) { return "logging.04.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Listing Logger Categories") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.09.html") ) { return "logging.04.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Making Dynamic Logging Changes without Redeploying") && Guidewire_FMSourceFileMatch(SRCFILE,"logging.04.10.html") ) { return "logging.04.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring and Maintaining the PolicyCenter Database") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.01.html") ) { return "database.05.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Database Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.02.html") ) { return "database.05.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire Database Direct Update Policy") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.03.html") ) { return "database.05.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Connection Pool Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.04.html") ) { return "database.05.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Backing up the PolicyCenter Database") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.05.html") ) { return "database.05.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding and Authorizing Database Upgrades") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.06.html") ) { return "database.05.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Checking Database Consistency") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.07.html") ) { return "database.05.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Database Statistics") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.08.html") ) { return "database.05.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commands for Updating Database Statistics") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.09.html") ) { return "database.05.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Database Statistics Generation") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.10.html") ) { return "database.05.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Checking the Database Statistics Updating Process") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.11.html") ) { return "database.05.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Canceling the Database Statistics Updating Process") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.12.html") ) { return "database.05.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Purging Old Workflows and Workflow Logs") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.13.html") ) { return "database.05.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Resizing Columns") && Guidewire_FMSourceFileMatch(SRCFILE,"database.05.14.html") ) { return "database.05.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Change API") && Guidewire_FMSourceFileMatch(SRCFILE,"datachange.06.1.html") ) { return "datachange.06.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Change API Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"datachange.06.2.html") ) { return "datachange.06.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Typical Use of the Data Change API") && Guidewire_FMSourceFileMatch(SRCFILE,"datachange.06.3.html") ) { return "datachange.06.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Change Command Line Reference(data_change.bat)") && Guidewire_FMSourceFileMatch(SRCFILE,"datachange.06.4.html") ) { return "datachange.06.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Change Web Service Reference (DataChangeAPI)") && Guidewire_FMSourceFileMatch(SRCFILE,"datachange.06.5.html") ) { return "datachange.06.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Managing PolicyCenter Servers") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.01.html") ) { return "mngservers.07.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Stopping the PolicyCenter Application") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.02.html") ) { return "mngservers.07.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Server Modes and Run Levels") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.03.html") ) { return "mngservers.07.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Server Startup Tests") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.04.html") ) { return "mngservers.07.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Monitoring the Servers") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.05.html") ) { return "mngservers.07.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Monitoring and Managing Event Messages") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.06.html") ) { return "mngservers.07.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"System Users") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.07.html") ) { return "mngservers.07.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Minimum and Maximum Password Length") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.08.html") ) { return "mngservers.07.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Client Session Timeout") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.09.html") ) { return "mngservers.07.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Avoiding Session Replication") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.10.html") ) { return "mngservers.07.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Application Server Caching") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.11.html") ) { return "mngservers.07.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Analyzing Server Memory Management") && Guidewire_FMSourceFileMatch(SRCFILE,"mngservers.07.12.html") ) { return "mngservers.07.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Clustering Application Servers") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.01.html") ) { return "clustering.08.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of Clustering") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.02.html") ) { return "clustering.08.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring a Cluster") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.03.html") ) { return "clustering.08.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Enabling and Disabling Clustering") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.04.html") ) { return "clustering.08.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring the Registry Element for Clustering") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.05.html") ) { return "clustering.08.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting the Multicast Address") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.06.html") ) { return "clustering.08.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Specifying the Key Range") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.07.html") ) { return "clustering.08.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Separate Logging Environments") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.08.html") ) { return "clustering.08.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Managing a Cluster") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.09.html") ) { return "clustering.08.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Starting Clustered Servers") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.10.html") ) { return "clustering.08.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Checking Node Health") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.11.html") ) { return "clustering.08.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding a Server to a Cluster") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.12.html") ) { return "clustering.08.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Checking Server Run Level") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.13.html") ) { return "clustering.08.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Server Failures and Removing a Server") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.14.html") ) { return "clustering.08.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Running Administrative Commands") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.15.html") ) { return "clustering.08.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Updating Clustered Servers") && Guidewire_FMSourceFileMatch(SRCFILE,"clustering.08.16.html") ) { return "clustering.08.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Securing PolicyCenter Communications") && Guidewire_FMSourceFileMatch(SRCFILE,"serversecurity.09.1.html") ) { return "serversecurity.09.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using SSL with PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"serversecurity.09.2.html") ) { return "serversecurity.09.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Accessing a PolicyCenter Server Through SSL") && Guidewire_FMSourceFileMatch(SRCFILE,"serversecurity.09.3.html") ) { return "serversecurity.09.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing and Exporting Administrative Data") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.1.html") ) { return "importdata.10.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding Data Import and Export") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.2.html") ) { return "importdata.10.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing Administrative Data from the Command Line") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.3.html") ) { return "importdata.10.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing and Exporting Administrative Data from PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.4.html") ) { return "importdata.10.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Other Import Functions") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.5.html") ) { return "importdata.10.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"The import Directory") && Guidewire_FMSourceFileMatch(SRCFILE,"importdata.10.6.html") ) { return "importdata.10.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Batch Processes and Work Queues") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.01.html") ) { return "batch.11.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Batch Processes") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.02.html") ) { return "batch.11.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Distributable Work Queues") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.03.html") ) { return "batch.11.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Running Batch Processes and Work Queues") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.04.html") ) { return "batch.11.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Performing Custom Actions After Work Queue Completion") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.05.html") ) { return "batch.11.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Distributable Work Queues") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.06.html") ) { return "batch.11.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"List of Batch Processes and Distributable Work Queues") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.07.html") ) { return "batch.11.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Scheduling Batch Processes and Work Queues") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.08.html") ) { return "batch.11.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Events and Messaging with Batch Processes") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.09.html") ) { return "batch.11.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Troubleshooting Batch Processes and Work Queues") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.10.html") ) { return "batch.11.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Interactions Between PolicyCenter and Specific Processes") && Guidewire_FMSourceFileMatch(SRCFILE,"batch.11.11.html") ) { return "batch.11.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Guidewire Document Assistant") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.1.html") ) { return "gwdocassist.12.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Enabling Guidewire Document Assistant") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.2.html") ) { return "gwdocassist.12.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Support for Document Management Systems") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.3.html") ) { return "gwdocassist.12.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Client Configuration Requirements") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.4.html") ) { return "gwdocassist.12.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire Document Assistant Configuration Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.5.html") ) { return "gwdocassist.12.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Assistant Supported File Types") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.6.html") ) { return "gwdocassist.12.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Customizing Document Assistant") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.7.html") ) { return "gwdocassist.12.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Disabling Guidewire Document Assistant") && Guidewire_FMSourceFileMatch(SRCFILE,"gwdocassist.12.8.html") ) { return "gwdocassist.12.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Server and Internal Tools") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.01.html") ) { return "maintenance.13.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Server Tools") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.02.html") ) { return "maintenance.13.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Batch Process Info") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.03.html") ) { return "maintenance.13.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Work Queue Info") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.04.html") ) { return "maintenance.13.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Management Beans") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.05.html") ) { return "maintenance.13.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire Profiler") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.06.html") ) { return "maintenance.13.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cache Info") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.07.html") ) { return "maintenance.13.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Startable Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.08.html") ) { return "maintenance.13.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Set Log Level") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.09.html") ) { return "maintenance.13.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"View Logs") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.10.html") ) { return "maintenance.13.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Info Pages") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.11.html") ) { return "maintenance.13.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cluster Info") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.12.html") ) { return "maintenance.13.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Product Model Info") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.13.html") ) { return "maintenance.13.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Free-text Search") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.14.html") ) { return "maintenance.13.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Internal Tools") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.15.html") ) { return "maintenance.13.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reload") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.16.html") ) { return "maintenance.13.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"PC Sample Data") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.17.html") ) { return "maintenance.13.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Testing System Clock") && Guidewire_FMSourceFileMatch(SRCFILE,"maintenance.13.18.html") ) { return "maintenance.13.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"PolicyCenter Administrative Commands") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.14.01.html") ) { return "commandsref.14.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Administration Tools Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.14.02.html") ) { return "commandsref.14.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Import Tools Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.14.03.html") ) { return "commandsref.14.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Maintenance Tools Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.14.04.html") ) { return "commandsref.14.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Messaging Tools Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.14.05.html") ) { return "commandsref.14.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"System Tools Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.14.06.html") ) { return "commandsref.14.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Table Import Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.14.07.html") ) { return "commandsref.14.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Template Tools Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.14.08.html") ) { return "commandsref.14.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Usage Tools Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.14.09.html") ) { return "commandsref.14.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workflow Tools Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.14.10.html") ) { return "commandsref.14.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Zone Import Command") && Guidewire_FMSourceFileMatch(SRCFILE,"commandsref.14.11.html") ) { return "commandsref.14.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Free-text Batch Load Command") && Guidewire_FMSourceFileMatch(SRCFILE,"search-free-text-batch-load.15.1.html") ) { return "search-free-text-batch-load.15.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"When to Run the Free-text Batch Load Command") && Guidewire_FMSourceFileMatch(SRCFILE,"search-free-text-batch-load.15.2.html") ) { return "search-free-text-batch-load.15.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Prerequisites for Running the Free-text Batch Load Command") && Guidewire_FMSourceFileMatch(SRCFILE,"search-free-text-batch-load.15.3.html") ) { return "search-free-text-batch-load.15.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Running the Free-text Batch Load Command") && Guidewire_FMSourceFileMatch(SRCFILE,"search-free-text-batch-load.15.4.html") ) { return "search-free-text-batch-load.15.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Clean-up Tasks after Running the Free-text Batch Load Command") && Guidewire_FMSourceFileMatch(SRCFILE,"search-free-text-batch-load.15.5.html") ) { return "search-free-text-batch-load.15.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Free-text Batch Load Command and Native SQL") && Guidewire_FMSourceFileMatch(SRCFILE,"search-free-text-batch-load.15.6.html") ) { return "search-free-text-batch-load.15.6.html";}
else { return("../wwhelp/topic_cannot_be_found.html"); } }

function  WWHBookData_MatchTopic(P)
{
var C=null;P=decodeURIComponent(decodeURIComponent(escape(P)));//workaround epub bug with UTF8 processing!
if (C) { return C } else { return GUIDEWIRE_TOPIC_TO_FILE(P,Guidewire_ExtractSrcFromURL());}
}
