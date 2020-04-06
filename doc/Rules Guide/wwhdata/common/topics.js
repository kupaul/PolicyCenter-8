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

else if (Guidewire_TopicMatch(TOPIC,"Guidewire PolicyCenter\u00ae") && Guidewire_FMSourceFileMatch(SRCFILE,"cover-rules.html") ) { return "cover-rules.html";}
else if (Guidewire_TopicMatch(TOPIC,"About PolicyCenter Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"about.html") ) { return "about.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Business Rules") && Guidewire_FMSourceFileMatch(SRCFILE,"p-rules.html") ) { return "p-rules.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rules: A Background") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_using.04.1.html") ) { return "rules_using.04.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Introduction to Business Rules") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_using.04.2.html") ) { return "rules_using.04.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Important Terminology") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_using.04.3.html") ) { return "rules_using.04.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of PolicyCenter Rule Sets") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_using.04.4.html") ) { return "rules_using.04.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rules Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_overview.05.1.html") ) { return "rules_overview.05.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rule Design Template") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_overview.05.2.html") ) { return "rules_overview.05.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rule Structure") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_overview.05.3.html") ) { return "rules_overview.05.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Exiting a Rule") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_overview.05.4.html") ) { return "rules_overview.05.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Annotations and PolicyCenter Business Rules") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_overview.05.5.html") ) { return "rules_overview.05.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invoking a Gosu Rule from Gosu Code") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_overview.05.6.html") ) { return "rules_overview.05.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using the Rules Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_rules.06.1.html") ) { return "studio_rules.06.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Rules") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_rules.06.2.html") ) { return "studio_rules.06.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Renaming or Deleting a Rule") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_rules.06.3.html") ) { return "studio_rules.06.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Changing the Root Entity of a Rule") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_rules.06.4.html") ) { return "studio_rules.06.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Making a Rule Active or Inactive") && Guidewire_FMSourceFileMatch(SRCFILE,"studio_rules.06.5.html") ) { return "studio_rules.06.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Writing Rules: Testing and Debugging") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_bestpractices.07.1.html") ) { return "rules_bestpractices.07.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Generating Rule Debugging Information") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_bestpractices.07.2.html") ) { return "rules_bestpractices.07.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Custom Logging Methods") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_bestpractices.07.3.html") ) { return "rules_bestpractices.07.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Writing Rules: Examples") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_writing.08.1.html") ) { return "rules_writing.08.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Accessing Fields on Subtypes") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_writing.08.2.html") ) { return "rules_writing.08.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Looking for One or More Items Meeting Conditions") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_writing.08.3.html") ) { return "rules_writing.08.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Taking Actions on More Than One Subitem") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_writing.08.4.html") ) { return "rules_writing.08.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Checking Permissions") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_writing.08.5.html") ) { return "rules_writing.08.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rule Set Categories") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.01.html") ) { return "pc_rulesets.09.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rule Set Summaries") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.02.html") ) { return "pc_rulesets.09.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Assignment") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.03.html") ) { return "pc_rulesets.09.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Assignment Engine") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.04.html") ) { return "pc_rulesets.09.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Audit") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.05.html") ) { return "pc_rulesets.09.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Event Message") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.06.html") ) { return "pc_rulesets.09.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Event Fired") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.07.html") ) { return "pc_rulesets.09.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Exception") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.08.html") ) { return "pc_rulesets.09.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Renewal") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.09.html") ) { return "pc_rulesets.09.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.10.html") ) { return "pc_rulesets.09.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Validation in the User Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.11.html") ) { return "pc_rulesets.09.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Validatable Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.12.html") ) { return "pc_rulesets.09.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Validation Levels") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.13.html") ) { return "pc_rulesets.09.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Triggering Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.14.html") ) { return "pc_rulesets.09.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"The validate Method") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.15.html") ) { return "pc_rulesets.09.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Validation Rule Example") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_rulesets.09.16.html") ) { return "pc_rulesets.09.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"PolicyCenter Rule Execution") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_execution.10.1.html") ) { return "rules_execution.10.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Generating a Rule Repository Report") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_execution.10.2.html") ) { return "rules_execution.10.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Generating a Rule Execution Report") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_execution.10.3.html") ) { return "rules_execution.10.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Advanced Topics") && Guidewire_FMSourceFileMatch(SRCFILE,"p-rules_advanced.html") ) { return "p-rules_advanced.html";}
else if (Guidewire_TopicMatch(TOPIC,"Assignment in PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"assignment_pc.12.01.html") ) { return "assignment_pc.12.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding Assignment") && Guidewire_FMSourceFileMatch(SRCFILE,"assignment_pc.12.02.html") ) { return "assignment_pc.12.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Primary and Secondary Assignment") && Guidewire_FMSourceFileMatch(SRCFILE,"assignment_pc.12.03.html") ) { return "assignment_pc.12.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Role Assignment") && Guidewire_FMSourceFileMatch(SRCFILE,"assignment_pc.12.04.html") ) { return "assignment_pc.12.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Gosu Support for Assignment Entities") && Guidewire_FMSourceFileMatch(SRCFILE,"assignment_pc.12.05.html") ) { return "assignment_pc.12.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Assignment Success or Failure") && Guidewire_FMSourceFileMatch(SRCFILE,"assignment_pc.12.06.html") ) { return "assignment_pc.12.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Assignment Events") && Guidewire_FMSourceFileMatch(SRCFILE,"assignment_pc.12.07.html") ) { return "assignment_pc.12.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Assignment Method Reference") && Guidewire_FMSourceFileMatch(SRCFILE,"assignment_pc.12.08.html") ) { return "assignment_pc.12.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Queue Assignment") && Guidewire_FMSourceFileMatch(SRCFILE,"assignment_pc.12.09.html") ) { return "assignment_pc.12.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Immediate Assignment") && Guidewire_FMSourceFileMatch(SRCFILE,"assignment_pc.12.10.html") ) { return "assignment_pc.12.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Condition-based Assignment") && Guidewire_FMSourceFileMatch(SRCFILE,"assignment_pc.12.11.html") ) { return "assignment_pc.12.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Round-robin Assignment") && Guidewire_FMSourceFileMatch(SRCFILE,"assignment_pc.12.12.html") ) { return "assignment_pc.12.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Dynamic Assignment") && Guidewire_FMSourceFileMatch(SRCFILE,"assignment_pc.12.13.html") ) { return "assignment_pc.12.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Assignment Methods in Assignment Pop-ups") && Guidewire_FMSourceFileMatch(SRCFILE,"assignment_pc.12.14.html") ) { return "assignment_pc.12.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Performing Class-Based Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.01.html") ) { return "validation_pc.13.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"What is Class-Based Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.02.html") ) { return "validation_pc.13.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Class-Based Validation: An Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.03.html") ) { return "validation_pc.13.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Field-Level Validation: A Review") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.04.html") ) { return "validation_pc.13.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Validation Levels: A Review") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.05.html") ) { return "validation_pc.13.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Class-Based Validation Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.06.html") ) { return "validation_pc.13.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"PCValidation") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.07.html") ) { return "validation_pc.13.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"PCValidationBase") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.08.html") ) { return "validation_pc.13.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"PCValidationContext") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.09.html") ) { return "validation_pc.13.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"PCValidationResult") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.10.html") ) { return "validation_pc.13.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Base Configuration Validation Classes") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.11.html") ) { return "validation_pc.13.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Validation Chaining") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.12.html") ) { return "validation_pc.13.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"PolicyPeriodValidation: validateImpl Method") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.13.html") ) { return "validation_pc.13.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"PolicyPeriodValidation Validation Checks") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.14.html") ) { return "validation_pc.13.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invariant Validation Checks") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.15.html") ) { return "validation_pc.13.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Static Validation Checks") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.16.html") ) { return "validation_pc.13.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Invoking Class-Based Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.17.html") ) { return "validation_pc.13.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Example: Invoking Validation in a Job Wizard Step") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_pc.13.18.html") ) { return "validation_pc.13.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Performing Rule-based Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_platform_entities.14.01.html") ) { return "validation_platform_entities.14.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"What is Rule-based Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_platform_entities.14.02.html") ) { return "validation_platform_entities.14.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rule-based Validation: An Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_platform_entities.14.03.html") ) { return "validation_platform_entities.14.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Validation Graph") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_platform_entities.14.04.html") ) { return "validation_platform_entities.14.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Traversing the Validation Graph") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_platform_entities.14.05.html") ) { return "validation_platform_entities.14.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Top-level Entities that Trigger Full Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_platform_entities.14.06.html") ) { return "validation_platform_entities.14.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"ValidationTrigger Example") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_platform_entities.14.07.html") ) { return "validation_platform_entities.14.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overriding Validation Triggers") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_platform_entities.14.08.html") ) { return "validation_platform_entities.14.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Validation Performance Issues") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_platform_entities.14.09.html") ) { return "validation_platform_entities.14.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Debugging the Validation Graph") && Guidewire_FMSourceFileMatch(SRCFILE,"validation_platform_entities.14.10.html") ) { return "validation_platform_entities.14.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Sending Emails") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_sending_emails.15.01.html") ) { return "rules_sending_emails.15.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Guidewire PolicyCenter and Email") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_sending_emails.15.02.html") ) { return "rules_sending_emails.15.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Email Object Model") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_sending_emails.15.03.html") ) { return "rules_sending_emails.15.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Email Utility Methods") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_sending_emails.15.04.html") ) { return "rules_sending_emails.15.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Email Transmission") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_sending_emails.15.05.html") ) { return "rules_sending_emails.15.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding Email Templates") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_sending_emails.15.06.html") ) { return "rules_sending_emails.15.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating an Email Template") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_sending_emails.15.07.html") ) { return "rules_sending_emails.15.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Localizing an Email Template") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_sending_emails.15.08.html") ) { return "rules_sending_emails.15.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"The IEmailTemplateSource Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_sending_emails.15.09.html") ) { return "rules_sending_emails.15.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring PolicyCenter to Send Emails") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_sending_emails.15.10.html") ) { return "rules_sending_emails.15.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Sending Emails from Gosu") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_sending_emails.15.11.html") ) { return "rules_sending_emails.15.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Saving an Email Message as a Document") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_sending_emails.15.12.html") ) { return "rules_sending_emails.15.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Creation") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_documentcreation.16.1.html") ) { return "rules_documentcreation.16.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Synchronous and Asynchronous Document Production") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_documentcreation.16.2.html") ) { return "rules_documentcreation.16.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Integrating Document Functionality with PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_documentcreation.16.3.html") ) { return "rules_documentcreation.16.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"The IDocumentTemplateDescriptor Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_documentcreation.16.4.html") ) { return "rules_documentcreation.16.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"The IDocumentTemplateDescriptor API") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_documentcreation.16.5.html") ) { return "rules_documentcreation.16.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"The DocumentProduction Class") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_documentcreation.16.6.html") ) { return "rules_documentcreation.16.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Templates") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_documentcreation.16.7.html") ) { return "rules_documentcreation.16.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Creation Examples") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_documentcreation.16.8.html") ) { return "rules_documentcreation.16.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Troubleshooting") && Guidewire_FMSourceFileMatch(SRCFILE,"rules_documentcreation.16.9.html") ) { return "rules_documentcreation.16.9.html";}
else { return("../wwhelp/topic_cannot_be_found.html"); } }

function  WWHBookData_MatchTopic(P)
{
var C=null;P=decodeURIComponent(decodeURIComponent(escape(P)));//workaround epub bug with UTF8 processing!
if (C) { return C } else { return GUIDEWIRE_TOPIC_TO_FILE(P,Guidewire_ExtractSrcFromURL());}
}
