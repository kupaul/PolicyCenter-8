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

else if (Guidewire_TopicMatch(TOPIC,"Guidewire PolicyCenter\u00ae") && Guidewire_FMSourceFileMatch(SRCFILE,"cover-install.html") ) { return "cover-install.html";}
else if (Guidewire_TopicMatch(TOPIC,"About PolicyCenter Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"about.html") ) { return "about.html";}
else if (Guidewire_TopicMatch(TOPIC,"Introduction to Installation") && Guidewire_FMSourceFileMatch(SRCFILE,"introduction.3.1.html") ) { return "introduction.3.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Selecting an Installation Scenario") && Guidewire_FMSourceFileMatch(SRCFILE,"introduction.3.2.html") ) { return "introduction.3.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Viewing the Development and Production Environments") && Guidewire_FMSourceFileMatch(SRCFILE,"introduction.3.3.html") ) { return "introduction.3.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Preparing a PolicyCenter Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.01.html") ) { return "preinstall.4.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installation Environments Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.02.html") ) { return "preinstall.4.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating Accounts to Run PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.03.html") ) { return "preinstall.4.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring the Application Server") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.04.html") ) { return "preinstall.4.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring the Database") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.05.html") ) { return "preinstall.4.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Database Permissions") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.06.html") ) { return "preinstall.4.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Linguistic Search Collation") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.07.html") ) { return "preinstall.4.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Compression") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.08.html") ) { return "preinstall.4.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Oracle for PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.09.html") ) { return "preinstall.4.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring SQL Server for PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.10.html") ) { return "preinstall.4.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Development Workstation Information") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.11.html") ) { return "preinstall.4.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Client Information") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.12.html") ) { return "preinstall.4.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing Java") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.13.html") ) { return "preinstall.4.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing Ant") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.14.html") ) { return "preinstall.4.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Environment Variables") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.15.html") ) { return "preinstall.4.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Documenting Your Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"preinstall.4.16.html") ) { return "preinstall.4.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing a PolicyCenter Development Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"quickstart.5.1.html") ) { return "quickstart.5.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Multiple PolicyCenter Development Instances") && Guidewire_FMSourceFileMatch(SRCFILE,"quickstart.5.2.html") ) { return "quickstart.5.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing the QuickStart Development Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"quickstart.5.3.html") ) { return "quickstart.5.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing a Tomcat Development Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"quickstart.5.4.html") ) { return "quickstart.5.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the QuickStart Database") && Guidewire_FMSourceFileMatch(SRCFILE,"quickstart.5.5.html") ) { return "quickstart.5.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using SQL Server or Oracle in a Development Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"quickstart.5.6.html") ) { return "quickstart.5.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Archiving for Development Testing") && Guidewire_FMSourceFileMatch(SRCFILE,"quickstart.5.7.html") ) { return "quickstart.5.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Enabling Reinsurance Management or Disabling Work Queue") && Guidewire_FMSourceFileMatch(SRCFILE,"quickstart.5.8.html") ) { return "quickstart.5.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing Sample Data") && Guidewire_FMSourceFileMatch(SRCFILE,"quickstart.5.9.html") ) { return "quickstart.5.9.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing a PolicyCenter Production Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.01.html") ) { return "install.6.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Unpacking the Configuration Files") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.02.html") ) { return "install.6.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring a Database Connection") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.03.html") ) { return "install.6.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"The (database) Element") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.04.html") ) { return "install.6.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Mapping Logical Tablespaces to Physical Tablespaces") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.05.html") ) { return "install.6.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Options for Individual Tables") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.06.html") ) { return "install.6.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining Table Groups") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.07.html") ) { return "install.6.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining the JDBC URL") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.08.html") ) { return "install.6.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Specifying a Database Password") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.09.html") ) { return "install.6.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Enabling SQL Server JDBC Logging") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.10.html") ) { return "install.6.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring PolicyCenter to Use a JNDI Data Source") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.11.html") ) { return "install.6.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating a JNDI Data Source on JBoss") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.12.html") ) { return "install.6.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating a JNDI Data Source on WebLogic") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.13.html") ) { return "install.6.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating a JNDI Data Source on WebSphere") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.14.html") ) { return "install.6.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Deploying PolicyCenter to the Application Server") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.15.html") ) { return "install.6.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing a JBoss Production Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.16.html") ) { return "install.6.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing a Tomcat Production Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.17.html") ) { return "install.6.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing a WebLogic Production Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.18.html") ) { return "install.6.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing a WebSphere Production Environment") && Guidewire_FMSourceFileMatch(SRCFILE,"install.6.19.html") ) { return "install.6.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"Additional PolicyCenter Setup Tasks") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.01.html") ) { return "postinstall.7.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Free-text Search Setup") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.02.html") ) { return "postinstall.7.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Up Free-text Search for Embedded Operation") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.03.html") ) { return "postinstall.7.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Up Free-text Search for JBoss") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.04.html") ) { return "postinstall.7.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Up Free-text Search for Tomcat") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.05.html") ) { return "postinstall.7.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Up Free-text Search for WebLogic") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.06.html") ) { return "postinstall.7.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Up Free-text Search for WebSphere") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.07.html") ) { return "postinstall.7.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Up the Free-text Batch Load Command") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.08.html") ) { return "postinstall.7.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changing the Superuser Password") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.09.html") ) { return "postinstall.7.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Generating Java and SOAP API Libraries") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.10.html") ) { return "postinstall.7.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Enabling Integration between ClaimCenter and PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.11.html") ) { return "postinstall.7.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Enabling Integration between BillingCenter and PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.12.html") ) { return "postinstall.7.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Enabling Archiving or Disabling Archiving Work Queues") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.13.html") ) { return "postinstall.7.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing Rating Management") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.14.html") ) { return "postinstall.7.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing Reinsurance Management or Disabling Work Queue") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.15.html") ) { return "postinstall.7.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Starting PolicyCenter on the Application Server") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.16.html") ) { return "postinstall.7.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Starting PolicyCenter on JBoss") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.17.html") ) { return "postinstall.7.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Starting PolicyCenter on Tomcat on Windows") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.18.html") ) { return "postinstall.7.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Starting PolicyCenter on WebLogic") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.19.html") ) { return "postinstall.7.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"Starting PolicyCenter on WebSphere") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.20.html") ) { return "postinstall.7.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"Connecting to PolicyCenter with a Web Client") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.21.html") ) { return "postinstall.7.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"Additional Installation Information") && Guidewire_FMSourceFileMatch(SRCFILE,"postinstall.7.22.html") ) { return "postinstall.7.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commands Reference") && Guidewire_FMSourceFileMatch(SRCFILE,"toolsandscripts.8.1.html") ) { return "toolsandscripts.8.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Tuning Command Line Tool Memory Settings") && Guidewire_FMSourceFileMatch(SRCFILE,"toolsandscripts.8.2.html") ) { return "toolsandscripts.8.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"QuickStart Command Tools") && Guidewire_FMSourceFileMatch(SRCFILE,"toolsandscripts.8.3.html") ) { return "toolsandscripts.8.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Build Tools") && Guidewire_FMSourceFileMatch(SRCFILE,"toolsandscripts.8.4.html") ) { return "toolsandscripts.8.4.html";}
else { return("../wwhelp/topic_cannot_be_found.html"); } }

function  WWHBookData_MatchTopic(P)
{
var C=null;P=decodeURIComponent(decodeURIComponent(escape(P)));//workaround epub bug with UTF8 processing!
if (C) { return C } else { return GUIDEWIRE_TOPIC_TO_FILE(P,Guidewire_ExtractSrcFromURL());}
}
