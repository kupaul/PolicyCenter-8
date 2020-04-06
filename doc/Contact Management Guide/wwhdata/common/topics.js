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

else if (Guidewire_TopicMatch(TOPIC,"Guidewire PolicyCenter\u00ae") && Guidewire_FMSourceFileMatch(SRCFILE,"cover-contact.html") ) { return "cover-contact.html";}
else if (Guidewire_TopicMatch(TOPIC,"About PolicyCenter Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"about.html") ) { return "about.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed Features in ContactManager") && Guidewire_FMSourceFileMatch(SRCFILE,"whatsnew.03.1.html") ) { return "whatsnew.03.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"New And Changed Features in ContactManager 8.0.2") && Guidewire_FMSourceFileMatch(SRCFILE,"whatsnew.03.2.html") ) { return "whatsnew.03.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"New And Changed Features in ContactManager 8.0.1") && Guidewire_FMSourceFileMatch(SRCFILE,"whatsnew.03.3.html") ) { return "whatsnew.03.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"New And Changed Features in ContactManager 8.0.0") && Guidewire_FMSourceFileMatch(SRCFILE,"whatsnew.03.4.html") ) { return "whatsnew.03.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Changed Features in ContactManager 7.0") && Guidewire_FMSourceFileMatch(SRCFILE,"whatsnew.03.5.html") ) { return "whatsnew.03.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Managing Integrated Contacts") && Guidewire_FMSourceFileMatch(SRCFILE,"managingcontacts-about.04.1.html") ) { return "managingcontacts-about.04.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Client Data Management") && Guidewire_FMSourceFileMatch(SRCFILE,"managingcontacts-about.04.2.html") ) { return "managingcontacts-about.04.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Vendor Data Management") && Guidewire_FMSourceFileMatch(SRCFILE,"managingcontacts-about.04.3.html") ) { return "managingcontacts-about.04.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing ContactManager") && Guidewire_FMSourceFileMatch(SRCFILE,"install.05.1.html") ) { return "install.05.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing ContactManager with QuickStart for Development") && Guidewire_FMSourceFileMatch(SRCFILE,"install.05.2.html") ) { return "install.05.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing ContactManager with Tomcat and SQL Server for Development") && Guidewire_FMSourceFileMatch(SRCFILE,"install.05.3.html") ) { return "install.05.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Integrating ContactManager with Guidewire Core Applications") && Guidewire_FMSourceFileMatch(SRCFILE,"integrate.06.1.html") ) { return "integrate.06.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Integrating ContactManager Using QuickStart") && Guidewire_FMSourceFileMatch(SRCFILE,"integrate.06.2.html") ) { return "integrate.06.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Integrating ContactManager Using Tomcat and SQL Server") && Guidewire_FMSourceFileMatch(SRCFILE,"integrate.06.3.html") ) { return "integrate.06.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Core Application Authentication with ContactManager") && Guidewire_FMSourceFileMatch(SRCFILE,"integrate.06.4.html") ) { return "integrate.06.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring ContactManager Authentication with Core Applications") && Guidewire_FMSourceFileMatch(SRCFILE,"integrate.06.5.html") ) { return "integrate.06.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Searching for Contacts") && Guidewire_FMSourceFileMatch(SRCFILE,"search.07.1.html") ) { return "search.07.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of Contact Search") && Guidewire_FMSourceFileMatch(SRCFILE,"search.07.2.html") ) { return "search.07.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"ContactManager Support for Contact Searches") && Guidewire_FMSourceFileMatch(SRCFILE,"search.07.3.html") ) { return "search.07.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"ClaimCenter Support for Contact Searches") && Guidewire_FMSourceFileMatch(SRCFILE,"search.07.4.html") ) { return "search.07.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"PolicyCenter Support for Contact Searches") && Guidewire_FMSourceFileMatch(SRCFILE,"search.07.5.html") ) { return "search.07.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Support for Contact Searches") && Guidewire_FMSourceFileMatch(SRCFILE,"search.07.6.html") ) { return "search.07.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Securing Access to Contact Information") && Guidewire_FMSourceFileMatch(SRCFILE,"security.08.1.html") ) { return "security.08.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of Contact Security") && Guidewire_FMSourceFileMatch(SRCFILE,"security.08.2.html") ) { return "security.08.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"ContactManager Contact Security") && Guidewire_FMSourceFileMatch(SRCFILE,"security.08.3.html") ) { return "security.08.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"PolicyCenter Contact Security") && Guidewire_FMSourceFileMatch(SRCFILE,"security.08.4.html") ) { return "security.08.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"BillingCenter Contact Security") && Guidewire_FMSourceFileMatch(SRCFILE,"security.08.5.html") ) { return "security.08.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"ClaimCenter Contact Security") && Guidewire_FMSourceFileMatch(SRCFILE,"security.08.6.html") ) { return "security.08.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Extending the Contact Data Model") && Guidewire_FMSourceFileMatch(SRCFILE,"extending.09.1.html") ) { return "extending.09.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of Contact Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"extending.09.2.html") ) { return "extending.09.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Extending the Client Data Model") && Guidewire_FMSourceFileMatch(SRCFILE,"extending.09.3.html") ) { return "extending.09.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Extending the Vendor Contact Data Model") && Guidewire_FMSourceFileMatch(SRCFILE,"extending.09.4.html") ) { return "extending.09.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changing the Subtype of a Contact Instance") && Guidewire_FMSourceFileMatch(SRCFILE,"extending.09.5.html") ) { return "extending.09.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Contact Tags") && Guidewire_FMSourceFileMatch(SRCFILE,"extending-tags.10.1.html") ) { return "extending-tags.10.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Contact Tag Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"extending-tags.10.2.html") ) { return "extending-tags.10.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Contact Tag-based Security") && Guidewire_FMSourceFileMatch(SRCFILE,"extending-tags.10.3.html") ) { return "extending-tags.10.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Linking and Synchronizing Contacts") && Guidewire_FMSourceFileMatch(SRCFILE,"syncing.11.1.html") ) { return "syncing.11.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Linking a Contact") && Guidewire_FMSourceFileMatch(SRCFILE,"syncing.11.2.html") ) { return "syncing.11.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Synchronizing with ContactManager") && Guidewire_FMSourceFileMatch(SRCFILE,"syncing.11.3.html") ) { return "syncing.11.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"ContactManager Rules") && Guidewire_FMSourceFileMatch(SRCFILE,"rules.12.1.html") ) { return "rules.12.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"ContactManager Rule Sets") && Guidewire_FMSourceFileMatch(SRCFILE,"rules.12.2.html") ) { return "rules.12.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"About Preupdate and Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"rules.12.3.html") ) { return "rules.12.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of ContactManager Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"rules.12.4.html") ) { return "rules.12.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Validation Graph in Guidewire ContactManager") && Guidewire_FMSourceFileMatch(SRCFILE,"rules.12.5.html") ) { return "rules.12.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Top-level ContactManager Entities That Trigger Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"rules.12.6.html") ) { return "rules.12.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working Directly in ContactManager") && Guidewire_FMSourceFileMatch(SRCFILE,"admin.13.1.html") ) { return "admin.13.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Logging in to ContactManager") && Guidewire_FMSourceFileMatch(SRCFILE,"admin.13.2.html") ) { return "admin.13.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changing Your Password in ContactManager") && Guidewire_FMSourceFileMatch(SRCFILE,"admin.13.3.html") ) { return "admin.13.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changing Your User Preferences in ContactManager") && Guidewire_FMSourceFileMatch(SRCFILE,"admin.13.4.html") ) { return "admin.13.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Selecting International Settings in ContactManager") && Guidewire_FMSourceFileMatch(SRCFILE,"admin.13.5.html") ) { return "admin.13.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"ContactManager User Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"admin.13.6.html") ) { return "admin.13.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing and Exporting Administrative Data") && Guidewire_FMSourceFileMatch(SRCFILE,"admin.13.7.html") ) { return "admin.13.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Managing Contact Data") && Guidewire_FMSourceFileMatch(SRCFILE,"admin.13.8.html") ) { return "admin.13.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"ContactManager Integration Reference") && Guidewire_FMSourceFileMatch(SRCFILE,"cm-integration.14.01.html") ) { return "cm-integration.14.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"ContactManager Integration Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"cm-integration.14.02.html") ) { return "cm-integration.14.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"ContactManager Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"cm-integration.14.03.html") ) { return "cm-integration.14.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"ContactManager Web Services") && Guidewire_FMSourceFileMatch(SRCFILE,"cm-integration.14.04.html") ) { return "cm-integration.14.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"ContactManager Messaging Events by Entity") && Guidewire_FMSourceFileMatch(SRCFILE,"cm-integration.14.05.html") ) { return "cm-integration.14.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"ABClientAPI Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"cm-integration.14.06.html") ) { return "cm-integration.14.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"ContactMapper Class") && Guidewire_FMSourceFileMatch(SRCFILE,"cm-integration.14.07.html") ) { return "cm-integration.14.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"ContactManager Plugins") && Guidewire_FMSourceFileMatch(SRCFILE,"cm-integration.14.08.html") ) { return "cm-integration.14.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"IFindDuplicatesPlugin Plugin Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"cm-integration.14.09.html") ) { return "cm-integration.14.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"ValidateABContactCreationPlugin Plugin Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"cm-integration.14.10.html") ) { return "cm-integration.14.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Testing Clock Plugin Interface\u2014Only For Non-Production Servers") && Guidewire_FMSourceFileMatch(SRCFILE,"cm-integration.14.11.html") ) { return "cm-integration.14.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Release Notes Archive") && Guidewire_FMSourceFileMatch(SRCFILE,"release-note-archive.15.1.html") ) { return "release-note-archive.15.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire ContactManager 7.0.1 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"release-note-archive.15.2.html") ) { return "release-note-archive.15.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire ContactManager 7.0.2 Release Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"release-note-archive.15.3.html") ) { return "release-note-archive.15.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire ContactManager 7.0.3 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"release-note-archive.15.4.html") ) { return "release-note-archive.15.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire ContactManager 7.0.4 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"release-note-archive.15.5.html") ) { return "release-note-archive.15.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire ContactManager 7.0.5 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"release-note-archive.15.6.html") ) { return "release-note-archive.15.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire ContactManager 7.0.6 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"release-note-archive.15.7.html") ) { return "release-note-archive.15.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire ContactManager 8.0.0 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"release-note-archive.15.8.html") ) { return "release-note-archive.15.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire ContactManager 8.0.1 Release\u00a0Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"release-note-archive.15.9.html") ) { return "release-note-archive.15.9.html";}
else { return("../wwhelp/topic_cannot_be_found.html"); } }

function  WWHBookData_MatchTopic(P)
{
var C=null;P=decodeURIComponent(decodeURIComponent(escape(P)));//workaround epub bug with UTF8 processing!
if (C) { return C } else { return GUIDEWIRE_TOPIC_TO_FILE(P,Guidewire_ExtractSrcFromURL());}
}
