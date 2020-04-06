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

else if (Guidewire_TopicMatch(TOPIC,"Guidewire PolicyCenter\u00ae") && Guidewire_FMSourceFileMatch(SRCFILE,"cover-bestpractice.html") ) { return "cover-bestpractice.html";}
else if (Guidewire_TopicMatch(TOPIC,"About PolicyCenter Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"about.html") ) { return "about.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Model Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-datamodel.3.1.html") ) { return "bp-datamodel.3.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Entity Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-datamodel.3.2.html") ) { return "bp-datamodel.3.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Typelist Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-datamodel.3.3.html") ) { return "bp-datamodel.3.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data Model Best Practices Checklist") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-datamodel.3.4.html") ) { return "bp-datamodel.3.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"User Interface Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-user-interface.4.1.html") ) { return "bp-user-interface.4.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Page Configuration Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-user-interface.4.2.html") ) { return "bp-user-interface.4.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Display Keys Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-user-interface.4.3.html") ) { return "bp-user-interface.4.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"User Interface Performance Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-user-interface.4.4.html") ) { return "bp-user-interface.4.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Avoid Post on Change and Client Reflection for Page Refreshes") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-user-interface.4.5.html") ) { return "bp-user-interface.4.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Avoid Repeated Calculations of Expensive Widget Values") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-user-interface.4.6.html") ) { return "bp-user-interface.4.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Avoid Expensive Calculations of Widget Properties") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-user-interface.4.7.html") ) { return "bp-user-interface.4.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Use Application Permission Keys for Visibility and Editability") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-user-interface.4.8.html") ) { return "bp-user-interface.4.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"User Interface Best Practices Checklist") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-user-interface.4.9.html") ) { return "bp-user-interface.4.9.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rules Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-rules.5.1.html") ) { return "bp-rules.5.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rules Naming Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-rules.5.2.html") ) { return "bp-rules.5.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Observe Rule Naming Conventions") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-rules.5.3.html") ) { return "bp-rules.5.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Observe Operating System Length Restrictions on Rule Names") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-rules.5.4.html") ) { return "bp-rules.5.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Get and Display Rule Names in Messages") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-rules.5.5.html") ) { return "bp-rules.5.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Assign a Dedicated Rules Librarian to Manage Rule Names") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-rules.5.6.html") ) { return "bp-rules.5.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rules Performance Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-rules.5.7.html") ) { return "bp-rules.5.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rules Best Practices Checklist") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-rules.5.8.html") ) { return "bp-rules.5.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Language Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.01.html") ) { return "bp-gosu.6.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Naming and Declaration Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.02.html") ) { return "bp-gosu.6.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Observe General Gosu Naming Conventions") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.03.html") ) { return "bp-gosu.6.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Omit Type Specifications with Variable Initialization") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.04.html") ) { return "bp-gosu.6.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Add a Suffix to Functions and Classes to Avoid Name Conflicts") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.05.html") ) { return "bp-gosu.6.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Declare Functions Private Unless Absolutely Necessary") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.06.html") ) { return "bp-gosu.6.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Use Public Properties Instead of Public Variables") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.07.html") ) { return "bp-gosu.6.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Do Not Declare Static Scope for Mutable Variables") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.08.html") ) { return "bp-gosu.6.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Use Extensions to Add Functions to Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.09.html") ) { return "bp-gosu.6.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Match Capitalization of Types, Keywords, and Symbols") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.10.html") ) { return "bp-gosu.6.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Commenting Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.11.html") ) { return "bp-gosu.6.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Block Comments") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.12.html") ) { return "bp-gosu.6.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Javadoc Comments") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.13.html") ) { return "bp-gosu.6.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Single-line Comments") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.14.html") ) { return "bp-gosu.6.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Trailing Comments") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.15.html") ) { return "bp-gosu.6.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Comment Delimiters to Disable Code") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.16.html") ) { return "bp-gosu.6.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Coding Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.17.html") ) { return "bp-gosu.6.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Use Whitespace Effectively") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.18.html") ) { return "bp-gosu.6.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Use Parentheses Effectively") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.19.html") ) { return "bp-gosu.6.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"Use Curly Braces Effectively") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.20.html") ) { return "bp-gosu.6.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"Program Defensively Against Conditions that Can Fail") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.21.html") ) { return "bp-gosu.6.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"Omit Semicolons as Statement Delimiters") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.22.html") ) { return "bp-gosu.6.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"Use != Instead of () as the Inequality Operator") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.23.html") ) { return "bp-gosu.6.23.html";}
else if (Guidewire_TopicMatch(TOPIC,"Observe Null Safety with Equality Operators") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.24.html") ) { return "bp-gosu.6.24.html";}
else if (Guidewire_TopicMatch(TOPIC,"Use typeis Expressions for Automatic Downcasting") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.25.html") ) { return "bp-gosu.6.25.html";}
else if (Guidewire_TopicMatch(TOPIC,"Observe Loop Control Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.26.html") ) { return "bp-gosu.6.26.html";}
else if (Guidewire_TopicMatch(TOPIC,"Return from Functions as Early as Possible") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.27.html") ) { return "bp-gosu.6.27.html";}
else if (Guidewire_TopicMatch(TOPIC,"Use Query Builder APIs instead of Find Expressions in New Code") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.28.html") ) { return "bp-gosu.6.28.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Performance Best Practices") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.29.html") ) { return "bp-gosu.6.29.html";}
else if (Guidewire_TopicMatch(TOPIC,"Use the Fastest Technique for String Concatenation") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.30.html") ) { return "bp-gosu.6.30.html";}
else if (Guidewire_TopicMatch(TOPIC,"Consider the Order of Terms in Compound Expressions") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.31.html") ) { return "bp-gosu.6.31.html";}
else if (Guidewire_TopicMatch(TOPIC,"Avoid Repeated Method Calls Within an Algorithm") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.32.html") ) { return "bp-gosu.6.32.html";}
else if (Guidewire_TopicMatch(TOPIC,"Remove Constant Variables and Expressions from Loops") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.33.html") ) { return "bp-gosu.6.33.html";}
else if (Guidewire_TopicMatch(TOPIC,"Pull Up Multiple Performance Intensive Method Calls") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.34.html") ) { return "bp-gosu.6.34.html";}
else if (Guidewire_TopicMatch(TOPIC,"Be Wary of Dot Notation with Object Access Paths") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.35.html") ) { return "bp-gosu.6.35.html";}
else if (Guidewire_TopicMatch(TOPIC,"Avoid Code that Incidentally Queries the Database") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.36.html") ) { return "bp-gosu.6.36.html";}
else if (Guidewire_TopicMatch(TOPIC,"Use Comparison Methods to Filter Queries") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.37.html") ) { return "bp-gosu.6.37.html";}
else if (Guidewire_TopicMatch(TOPIC,"Use Count Properties on Query Builder Results and Find Queries") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.38.html") ) { return "bp-gosu.6.38.html";}
else if (Guidewire_TopicMatch(TOPIC,"Use Activity Pattern Codes Instead of Public IDs in Comparisons") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.39.html") ) { return "bp-gosu.6.39.html";}
else if (Guidewire_TopicMatch(TOPIC,"Do Not Instantiate Plugins for Every Execution") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.40.html") ) { return "bp-gosu.6.40.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Best Practices Checklist") && Guidewire_FMSourceFileMatch(SRCFILE,"bp-gosu.6.41.html") ) { return "bp-gosu.6.41.html";}
else { return("../wwhelp/topic_cannot_be_found.html"); } }

function  WWHBookData_MatchTopic(P)
{
var C=null;P=decodeURIComponent(decodeURIComponent(escape(P)));//workaround epub bug with UTF8 processing!
if (C) { return C } else { return GUIDEWIRE_TOPIC_TO_FILE(P,Guidewire_ExtractSrcFromURL());}
}
