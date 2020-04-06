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

else if (Guidewire_TopicMatch(TOPIC,"Guidewire Glossary") && Guidewire_FMSourceFileMatch(SRCFILE,"cover-glossary.html") ) { return "cover-glossary.html";}
else if (Guidewire_TopicMatch(TOPIC,"Glossary") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.01.html") ) { return "terms.2.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"A") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.02.html") ) { return "terms.2.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"B") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.03.html") ) { return "terms.2.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"C") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.04.html") ) { return "terms.2.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"D") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.05.html") ) { return "terms.2.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"E") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.06.html") ) { return "terms.2.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"F") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.07.html") ) { return "terms.2.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"G") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.08.html") ) { return "terms.2.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"H") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.09.html") ) { return "terms.2.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"I") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.10.html") ) { return "terms.2.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"J") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.11.html") ) { return "terms.2.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"K") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.12.html") ) { return "terms.2.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"L") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.13.html") ) { return "terms.2.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"M") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.14.html") ) { return "terms.2.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"N") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.15.html") ) { return "terms.2.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"O") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.16.html") ) { return "terms.2.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"P") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.17.html") ) { return "terms.2.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"R") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.18.html") ) { return "terms.2.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"S") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.19.html") ) { return "terms.2.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"T") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.20.html") ) { return "terms.2.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"U") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.21.html") ) { return "terms.2.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"W") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.22.html") ) { return "terms.2.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"X") && Guidewire_FMSourceFileMatch(SRCFILE,"terms.2.23.html") ) { return "terms.2.23.html";}
else { return("../wwhelp/topic_cannot_be_found.html"); } }

function  WWHBookData_MatchTopic(P)
{
var C=null;P=decodeURIComponent(decodeURIComponent(escape(P)));//workaround epub bug with UTF8 processing!
if (C) { return C } else { return GUIDEWIRE_TOPIC_TO_FILE(P,Guidewire_ExtractSrcFromURL());}
}
