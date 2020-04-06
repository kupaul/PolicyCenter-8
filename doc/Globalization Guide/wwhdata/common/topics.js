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

else if (Guidewire_TopicMatch(TOPIC,"Guidewire PolicyCenter\u00ae") && Guidewire_FMSourceFileMatch(SRCFILE,"cover-global.html") ) { return "cover-global.html";}
else if (Guidewire_TopicMatch(TOPIC,"About PolicyCenter Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"about.html") ) { return "about.html";}
else if (Guidewire_TopicMatch(TOPIC,"Introduction") && Guidewire_FMSourceFileMatch(SRCFILE,"p-intro.html") ) { return "p-intro.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding Globalization") && Guidewire_FMSourceFileMatch(SRCFILE,"understanding.04.1.html") ) { return "understanding.04.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Dimensions of Globalization") && Guidewire_FMSourceFileMatch(SRCFILE,"understanding.04.2.html") ) { return "understanding.04.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Selecting Language and Regional Formats in PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"understanding.04.3.html") ) { return "understanding.04.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuration Files Used for Globalization") && Guidewire_FMSourceFileMatch(SRCFILE,"understanding.04.4.html") ) { return "understanding.04.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Globalization Configuration Parameters in config.xml") && Guidewire_FMSourceFileMatch(SRCFILE,"understanding.04.5.html") ) { return "understanding.04.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Language Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"p-language.html") ) { return "p-language.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Languages") && Guidewire_FMSourceFileMatch(SRCFILE,"language_packs.06.1.html") ) { return "language_packs.06.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"About Display Languages") && Guidewire_FMSourceFileMatch(SRCFILE,"language_packs.06.2.html") ) { return "language_packs.06.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Installing Display Languages") && Guidewire_FMSourceFileMatch(SRCFILE,"language_packs.06.3.html") ) { return "language_packs.06.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Upgrading Display Languages") && Guidewire_FMSourceFileMatch(SRCFILE,"language_packs.06.4.html") ) { return "language_packs.06.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting the Default Display Language") && Guidewire_FMSourceFileMatch(SRCFILE,"language_packs.06.5.html") ) { return "language_packs.06.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Selecting a Personal Language Preference") && Guidewire_FMSourceFileMatch(SRCFILE,"language_packs.06.6.html") ) { return "language_packs.06.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localized Printing") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_printing.html") ) { return "localization_printing.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing PolicyCenter String Resources") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_strings.08.1.html") ) { return "localization_strings.08.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding String Resources") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_strings.08.2.html") ) { return "localization_strings.08.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Exporting and Importing String Resources") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_strings.08.3.html") ) { return "localization_strings.08.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing Display Keys") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_strings.08.4.html") ) { return "localization_strings.08.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing Typecodes") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_strings.08.5.html") ) { return "localization_strings.08.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing Gosu Error Messages") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_strings.08.6.html") ) { return "localization_strings.08.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing Product Model String Resources") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_strings.08.7.html") ) { return "localization_strings.08.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing PolicyCenter with Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_studio.09.1.html") ) { return "localization_studio.09.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Viewing Unicode Characters in Studio") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_studio.09.2.html") ) { return "localization_studio.09.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing Rule Set Names and Descriptions") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_studio.09.3.html") ) { return "localization_studio.09.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting the IME Mode for Field Inputs") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_studio.09.4.html") ) { return "localization_studio.09.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting a Language for a Block of Gosu Code") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_studio.09.5.html") ) { return "localization_studio.09.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing Administration Data") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_db_column.10.1.html") ) { return "localization_db_column.10.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding Administration Data") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_db_column.10.2.html") ) { return "localization_db_column.10.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localized Columns in Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_db_column.10.3.html") ) { return "localization_db_column.10.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localization Tables in the Database") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_db_column.10.4.html") ) { return "localization_db_column.10.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"System Table Localization") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_db_column.10.5.html") ) { return "localization_db_column.10.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing Guidewire Workflow") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_workflow.11.1.html") ) { return "localization_workflow.11.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing PolicyCenter Workflow") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_workflow.11.2.html") ) { return "localization_workflow.11.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing Workflow Step Names") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_workflow.11.3.html") ) { return "localization_workflow.11.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating a Locale-Specific Workflow SubFlow") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_workflow.11.4.html") ) { return "localization_workflow.11.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing Gosu Code in a Workflow Step") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_workflow.11.5.html") ) { return "localization_workflow.11.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing Templates") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_templates.12.1.html") ) { return "localization_templates.12.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"About Templates") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_templates.12.2.html") ) { return "localization_templates.12.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating Localized Documents, Emails, and Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_templates.12.3.html") ) { return "localization_templates.12.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Localization Support") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_templates.12.4.html") ) { return "localization_templates.12.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Regional Format Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"p-locale.html") ) { return "p-locale.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Regional Formats") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_add.14.1.html") ) { return "localization_add.14.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Regional Formats") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_add.14.2.html") ) { return "localization_add.14.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting the Default Application Locale for Regional Formats") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_add.14.3.html") ) { return "localization_add.14.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Regional Formats for a Block of Gosu Code") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_add.14.4.html") ) { return "localization_add.14.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with the Japanese Imperial Calendar") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_JIC.15.1.html") ) { return "localization_JIC.15.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Japanese Imperial Calendar Date Widget") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_JIC.15.2.html") ) { return "localization_JIC.15.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Japanese Dates") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_JIC.15.3.html") ) { return "localization_JIC.15.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting the Japanese Imperial Calendar as the Default for a Region") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_JIC.15.4.html") ) { return "localization_JIC.15.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting a Field to Always Display the Japanese Imperial Calendar") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_JIC.15.5.html") ) { return "localization_JIC.15.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting a Field to Conditionally Display the Japanese Imperial Calendar") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_JIC.15.6.html") ) { return "localization_JIC.15.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Japanese Imperial Dates in Gosu") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_JIC.15.7.html") ) { return "localization_JIC.15.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"National Formats and Data Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"p-national.html") ) { return "p-national.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Currencies") && Guidewire_FMSourceFileMatch(SRCFILE,"currency.17.1.html") ) { return "currency.17.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"PolicyCenter Base Configuration Currencies") && Guidewire_FMSourceFileMatch(SRCFILE,"currency.17.2.html") ) { return "currency.17.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Currency Typecodes") && Guidewire_FMSourceFileMatch(SRCFILE,"currency.17.3.html") ) { return "currency.17.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Monetary Amounts in the Data Model and in Gosu") && Guidewire_FMSourceFileMatch(SRCFILE,"currency.17.4.html") ) { return "currency.17.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Monetary Amount Data Type") && Guidewire_FMSourceFileMatch(SRCFILE,"currency.17.5.html") ) { return "currency.17.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Currency-related Configuration Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"currency.17.6.html") ) { return "currency.17.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting the Default Application Currency") && Guidewire_FMSourceFileMatch(SRCFILE,"currency.17.7.html") ) { return "currency.17.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Choosing a Rounding Mode") && Guidewire_FMSourceFileMatch(SRCFILE,"currency.17.8.html") ) { return "currency.17.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting the Currency Display Mode") && Guidewire_FMSourceFileMatch(SRCFILE,"currency.17.9.html") ) { return "currency.17.9.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Geographic Data") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_jurisdictions.18.1.html") ) { return "localization_jurisdictions.18.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Country Typecodes") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_jurisdictions.18.2.html") ) { return "localization_jurisdictions.18.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Country Address Formats") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_jurisdictions.18.3.html") ) { return "localization_jurisdictions.18.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting the Default Application Country") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_jurisdictions.18.4.html") ) { return "localization_jurisdictions.18.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Jurisdiction Information") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_jurisdictions.18.5.html") ) { return "localization_jurisdictions.18.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Zone Information") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_jurisdictions.18.6.html") ) { return "localization_jurisdictions.18.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Address Information") && Guidewire_FMSourceFileMatch(SRCFILE,"address_config.19.01.html") ) { return "address_config.19.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Addresses in PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"address_config.19.02.html") ) { return "address_config.19.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding Global Addresses") && Guidewire_FMSourceFileMatch(SRCFILE,"address_config.19.03.html") ) { return "address_config.19.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Address Modes in Page Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"address_config.19.04.html") ) { return "address_config.19.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Address Owners") && Guidewire_FMSourceFileMatch(SRCFILE,"address_config.19.05.html") ) { return "address_config.19.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"AddressOwnerFieldId Class") && Guidewire_FMSourceFileMatch(SRCFILE,"address_config.19.06.html") ) { return "address_config.19.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Automatic Address Completion and Fill-in") && Guidewire_FMSourceFileMatch(SRCFILE,"address_config.19.07.html") ) { return "address_config.19.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Automatic Address Completion") && Guidewire_FMSourceFileMatch(SRCFILE,"address_config.19.08.html") ) { return "address_config.19.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Automatic Address Fill-in") && Guidewire_FMSourceFileMatch(SRCFILE,"address_config.19.09.html") ) { return "address_config.19.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Address Automatic Completion and Fill-in Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"address_config.19.10.html") ) { return "address_config.19.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Phone Information") && Guidewire_FMSourceFileMatch(SRCFILE,"phone_config.20.1.html") ) { return "phone_config.20.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Phone Configuration Files") && Guidewire_FMSourceFileMatch(SRCFILE,"phone_config.20.2.html") ) { return "phone_config.20.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Phone Configuration Parameters") && Guidewire_FMSourceFileMatch(SRCFILE,"phone_config.20.3.html") ) { return "phone_config.20.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Phone Number PCF Widget") && Guidewire_FMSourceFileMatch(SRCFILE,"phone_config.20.4.html") ) { return "phone_config.20.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Linguistic Search and Sort") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_sorting.21.1.html") ) { return "localization_sorting.21.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Linguistic Search and Sort of Character Data") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_sorting.21.2.html") ) { return "localization_sorting.21.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Effect of Character Data Storage Type on Searching and Sorting") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_sorting.21.3.html") ) { return "localization_sorting.21.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Searching and Sorting in Configured Languages") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_sorting.21.4.html") ) { return "localization_sorting.21.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Search in the PolicyCenter Database") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_sorting.21.5.html") ) { return "localization_sorting.21.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Searching and the Oracle Database") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_sorting.21.6.html") ) { return "localization_sorting.21.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Searching and the SQL Server Database") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_sorting.21.7.html") ) { return "localization_sorting.21.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Sort in the PolicyCenter Database") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_sorting.21.8.html") ) { return "localization_sorting.21.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring National Field Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_fieldvalidation.22.1.html") ) { return "localization_fieldvalidation.22.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding National Field Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_fieldvalidation.22.2.html") ) { return "localization_fieldvalidation.22.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing Field Validators for National Field Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"localization_fieldvalidation.22.3.html") ) { return "localization_fieldvalidation.22.3.html";}
else { return("../wwhelp/topic_cannot_be_found.html"); } }

function  WWHBookData_MatchTopic(P)
{
var C=null;P=decodeURIComponent(decodeURIComponent(escape(P)));//workaround epub bug with UTF8 processing!
if (C) { return C } else { return GUIDEWIRE_TOPIC_TO_FILE(P,Guidewire_ExtractSrcFromURL());}
}
