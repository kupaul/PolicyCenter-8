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

else if (Guidewire_TopicMatch(TOPIC,"Guidewire PolicyCenter\u00ae") && Guidewire_FMSourceFileMatch(SRCFILE,"cover-app.html") ) { return "cover-app.html";}
else if (Guidewire_TopicMatch(TOPIC,"About PolicyCenter Documentation") && Guidewire_FMSourceFileMatch(SRCFILE,"about.html") ) { return "about.html";}
else if (Guidewire_TopicMatch(TOPIC,"Introduction") && Guidewire_FMSourceFileMatch(SRCFILE,"p_intro.html") ) { return "p_intro.html";}
else if (Guidewire_TopicMatch(TOPIC,"Introduction to PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"intro.04.1.html") ) { return "intro.04.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Product Model") && Guidewire_FMSourceFileMatch(SRCFILE,"intro.04.2.html") ) { return "intro.04.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Policy Lifecycle") && Guidewire_FMSourceFileMatch(SRCFILE,"intro.04.3.html") ) { return "intro.04.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"PolicyCenter Integration Points") && Guidewire_FMSourceFileMatch(SRCFILE,"intro.04.4.html") ) { return "intro.04.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Integration with Other Guidewire Applications") && Guidewire_FMSourceFileMatch(SRCFILE,"intro.04.5.html") ) { return "intro.04.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"PolicyCenter Users") && Guidewire_FMSourceFileMatch(SRCFILE,"intro.04.6.html") ) { return "intro.04.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"PolicyCenter User Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"p-highlevelui.html") ) { return "p-highlevelui.html";}
else if (Guidewire_TopicMatch(TOPIC,"Navigating PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_organization.06.1.html") ) { return "pc_organization.06.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Logging into PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_organization.06.2.html") ) { return "pc_organization.06.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting Preferences") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_organization.06.3.html") ) { return "pc_organization.06.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Selecting International Settings in PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_organization.06.4.html") ) { return "pc_organization.06.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Common Areas in the PolicyCenter User Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_organization.06.5.html") ) { return "pc_organization.06.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"PolicyCenter Tabs") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_organization.06.6.html") ) { return "pc_organization.06.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"QuickJump") && Guidewire_FMSourceFileMatch(SRCFILE,"quickjump.07.1.html") ) { return "quickjump.07.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"QuickJump Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"quickjump.07.2.html") ) { return "quickjump.07.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using QuickJump") && Guidewire_FMSourceFileMatch(SRCFILE,"quickjump.07.3.html") ) { return "quickjump.07.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring QuickJump") && Guidewire_FMSourceFileMatch(SRCFILE,"quickjump.07.4.html") ) { return "quickjump.07.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"QuickJump References") && Guidewire_FMSourceFileMatch(SRCFILE,"quickjump.07.5.html") ) { return "quickjump.07.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Basic Search") && Guidewire_FMSourceFileMatch(SRCFILE,"search_fulltext.08.1.html") ) { return "search_fulltext.08.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Basic Search Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"search_fulltext.08.2.html") ) { return "search_fulltext.08.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Basic Policy Search Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"search_fulltext.08.3.html") ) { return "search_fulltext.08.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Basic Search User Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"search_fulltext.08.4.html") ) { return "search_fulltext.08.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Basic Search") && Guidewire_FMSourceFileMatch(SRCFILE,"search_fulltext.08.5.html") ) { return "search_fulltext.08.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Advanced Search") && Guidewire_FMSourceFileMatch(SRCFILE,"search_db.09.1.html") ) { return "search_db.09.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Advanced Search Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"search_db.09.2.html") ) { return "search_db.09.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with the Advanced Search Tab") && Guidewire_FMSourceFileMatch(SRCFILE,"search_db.09.3.html") ) { return "search_db.09.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Saving Your Work") && Guidewire_FMSourceFileMatch(SRCFILE,"autosave.html") ) { return "autosave.html";}
else if (Guidewire_TopicMatch(TOPIC,"PolicyCenter Policy Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"p-jobs.html") ) { return "p-jobs.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"jobs.12.1.html") ) { return "jobs.12.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Overview of Policy Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"jobs.12.2.html") ) { return "jobs.12.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Key Features of Policy Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"jobs.12.3.html") ) { return "jobs.12.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Policy Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"jobs.12.4.html") ) { return "jobs.12.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Submission Policy Transaction") && Guidewire_FMSourceFileMatch(SRCFILE,"submission.13.1.html") ) { return "submission.13.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Submission Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"submission.13.2.html") ) { return "submission.13.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Submission General Steps") && Guidewire_FMSourceFileMatch(SRCFILE,"submission.13.3.html") ) { return "submission.13.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Submission Key Features") && Guidewire_FMSourceFileMatch(SRCFILE,"submission.13.4.html") ) { return "submission.13.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"The Submission Manager") && Guidewire_FMSourceFileMatch(SRCFILE,"submission.13.5.html") ) { return "submission.13.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Submissions") && Guidewire_FMSourceFileMatch(SRCFILE,"submission.13.6.html") ) { return "submission.13.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating a Submission") && Guidewire_FMSourceFileMatch(SRCFILE,"submission.13.7.html") ) { return "submission.13.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Copying a Submission") && Guidewire_FMSourceFileMatch(SRCFILE,"submission.13.8.html") ) { return "submission.13.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Issuance Policy Transaction") && Guidewire_FMSourceFileMatch(SRCFILE,"issuance.14.1.html") ) { return "issuance.14.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Issuance Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"issuance.14.2.html") ) { return "issuance.14.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Issuance General Steps") && Guidewire_FMSourceFileMatch(SRCFILE,"issuance.14.3.html") ) { return "issuance.14.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Issuances") && Guidewire_FMSourceFileMatch(SRCFILE,"issuance.14.4.html") ) { return "issuance.14.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Renewal Policy Transaction") && Guidewire_FMSourceFileMatch(SRCFILE,"renewals.15.1.html") ) { return "renewals.15.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Renewal Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"renewals.15.2.html") ) { return "renewals.15.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Renewal General Steps") && Guidewire_FMSourceFileMatch(SRCFILE,"renewals.15.3.html") ) { return "renewals.15.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Renewal Key Features") && Guidewire_FMSourceFileMatch(SRCFILE,"renewals.15.4.html") ) { return "renewals.15.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Pre-renewal Directions") && Guidewire_FMSourceFileMatch(SRCFILE,"renewals.15.5.html") ) { return "renewals.15.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Underwriting Issues and Referral Reasons") && Guidewire_FMSourceFileMatch(SRCFILE,"renewals.15.6.html") ) { return "renewals.15.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Renewals") && Guidewire_FMSourceFileMatch(SRCFILE,"renewals.15.7.html") ) { return "renewals.15.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cancellation Policy Transaction") && Guidewire_FMSourceFileMatch(SRCFILE,"cancellation.16.1.html") ) { return "cancellation.16.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cancellation Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"cancellation.16.2.html") ) { return "cancellation.16.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cancellation General Steps") && Guidewire_FMSourceFileMatch(SRCFILE,"cancellation.16.3.html") ) { return "cancellation.16.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Cancellations") && Guidewire_FMSourceFileMatch(SRCFILE,"cancellation.16.4.html") ) { return "cancellation.16.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Change Transaction") && Guidewire_FMSourceFileMatch(SRCFILE,"policy_change.17.1.html") ) { return "policy_change.17.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Change Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"policy_change.17.2.html") ) { return "policy_change.17.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Change General Steps") && Guidewire_FMSourceFileMatch(SRCFILE,"policy_change.17.3.html") ) { return "policy_change.17.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Change Key Features") && Guidewire_FMSourceFileMatch(SRCFILE,"policy_change.17.4.html") ) { return "policy_change.17.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Policy Changes") && Guidewire_FMSourceFileMatch(SRCFILE,"policy_change.17.5.html") ) { return "policy_change.17.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating a Policy Change") && Guidewire_FMSourceFileMatch(SRCFILE,"policy_change.17.6.html") ) { return "policy_change.17.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Editing the Policy Change Effective Date") && Guidewire_FMSourceFileMatch(SRCFILE,"policy_change.17.7.html") ) { return "policy_change.17.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reinstatement Policy Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"reinstatement.18.1.html") ) { return "reinstatement.18.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reinstatement Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"reinstatement.18.2.html") ) { return "reinstatement.18.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reinstatement General Steps") && Guidewire_FMSourceFileMatch(SRCFILE,"reinstatement.18.3.html") ) { return "reinstatement.18.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reinstatement Key Features") && Guidewire_FMSourceFileMatch(SRCFILE,"reinstatement.18.4.html") ) { return "reinstatement.18.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Reinstatements") && Guidewire_FMSourceFileMatch(SRCFILE,"reinstatement.18.5.html") ) { return "reinstatement.18.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rewrite Policy Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"rewrite.19.1.html") ) { return "rewrite.19.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rewrite Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"rewrite.19.2.html") ) { return "rewrite.19.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rewrite General Steps") && Guidewire_FMSourceFileMatch(SRCFILE,"rewrite.19.3.html") ) { return "rewrite.19.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rewrite Key Features") && Guidewire_FMSourceFileMatch(SRCFILE,"rewrite.19.4.html") ) { return "rewrite.19.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Rewrites") && Guidewire_FMSourceFileMatch(SRCFILE,"rewrite.19.5.html") ) { return "rewrite.19.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rewrite New Account Policy Transaction") && Guidewire_FMSourceFileMatch(SRCFILE,"rewrite_new_account.20.1.html") ) { return "rewrite_new_account.20.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rewrite New Account Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"rewrite_new_account.20.2.html") ) { return "rewrite_new_account.20.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Rewrite New Account") && Guidewire_FMSourceFileMatch(SRCFILE,"rewrite_new_account.20.3.html") ) { return "rewrite_new_account.20.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Premium Audit Policy Transaction") && Guidewire_FMSourceFileMatch(SRCFILE,"audit.21.1.html") ) { return "audit.21.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Final Audit Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"audit.21.2.html") ) { return "audit.21.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Premium Report Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"audit.21.3.html") ) { return "audit.21.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Audit Roles") && Guidewire_FMSourceFileMatch(SRCFILE,"audit.21.4.html") ) { return "audit.21.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Premium Audit and Other Policy Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"audit.21.5.html") ) { return "audit.21.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Premium Audit General Steps") && Guidewire_FMSourceFileMatch(SRCFILE,"audit.21.6.html") ) { return "audit.21.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Final Audits") && Guidewire_FMSourceFileMatch(SRCFILE,"audit.21.7.html") ) { return "audit.21.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working With Premium Reports") && Guidewire_FMSourceFileMatch(SRCFILE,"audit.21.8.html") ) { return "audit.21.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Side-by-side Quoting") && Guidewire_FMSourceFileMatch(SRCFILE,"job_sidebyside.22.01.html") ) { return "job_sidebyside.22.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Side-by-side Quoting Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"job_sidebyside.22.02.html") ) { return "job_sidebyside.22.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Base Data Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"job_sidebyside.22.03.html") ) { return "job_sidebyside.22.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Side-by-side Quoting Process Flow") && Guidewire_FMSourceFileMatch(SRCFILE,"job_sidebyside.22.04.html") ) { return "job_sidebyside.22.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Side-by-side Quoting in the User Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"job_sidebyside.22.05.html") ) { return "job_sidebyside.22.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Tools Menu Items for Side-by-side Quoting") && Guidewire_FMSourceFileMatch(SRCFILE,"job_sidebyside.22.06.html") ) { return "job_sidebyside.22.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Side-by-side Quoting Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"job_sidebyside.22.07.html") ) { return "job_sidebyside.22.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Versions Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"job_sidebyside.22.08.html") ) { return "job_sidebyside.22.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Side-by-side Quoting") && Guidewire_FMSourceFileMatch(SRCFILE,"job_sidebyside.22.09.html") ) { return "job_sidebyside.22.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Selecting Side-by-side Quoting in a Submission") && Guidewire_FMSourceFileMatch(SRCFILE,"job_sidebyside.22.10.html") ) { return "job_sidebyside.22.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Editing a Version in a Policy Transaction with Side-by-side Quoting") && Guidewire_FMSourceFileMatch(SRCFILE,"job_sidebyside.22.11.html") ) { return "job_sidebyside.22.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Binding and Issuing a Side-by-side Submission") && Guidewire_FMSourceFileMatch(SRCFILE,"job_sidebyside.22.12.html") ) { return "job_sidebyside.22.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multi-version Quoting") && Guidewire_FMSourceFileMatch(SRCFILE,"multiversion.23.1.html") ) { return "multiversion.23.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multi-version Quoting and Side-by-side Quoting") && Guidewire_FMSourceFileMatch(SRCFILE,"multiversion.23.2.html") ) { return "multiversion.23.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Multi-version Quoting") && Guidewire_FMSourceFileMatch(SRCFILE,"multiversion.23.3.html") ) { return "multiversion.23.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Setting the Maximum Number of Multi-version Quotes") && Guidewire_FMSourceFileMatch(SRCFILE,"multiversion.23.4.html") ) { return "multiversion.23.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Lines of Business") && Guidewire_FMSourceFileMatch(SRCFILE,"p-lobs.html") ) { return "p-lobs.html";}
else if (Guidewire_TopicMatch(TOPIC,"Line of Business Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_overview.html") ) { return "lob_overview.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commercial Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_ba.26.01.html") ) { return "lob_ba.26.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commercial Auto Screens") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_ba.26.02.html") ) { return "lob_ba.26.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Offerings Screen for Commercial Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_ba.26.03.html") ) { return "lob_ba.26.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Qualification Screen for Commercial Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_ba.26.04.html") ) { return "lob_ba.26.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Info Screen for Commercial Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_ba.26.05.html") ) { return "lob_ba.26.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Locations Screen for Commercial Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_ba.26.06.html") ) { return "lob_ba.26.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Vehicles Screen for Commercial Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_ba.26.07.html") ) { return "lob_ba.26.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commercial Auto Line Screen for Commercial Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_ba.26.08.html") ) { return "lob_ba.26.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Drivers Screen for Commercial Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_ba.26.09.html") ) { return "lob_ba.26.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifiers Screen for Commercial Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_ba.26.10.html") ) { return "lob_ba.26.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Risk Analysis Screen for Commercial Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_ba.26.11.html") ) { return "lob_ba.26.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Review Screen for Commercial Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_ba.26.12.html") ) { return "lob_ba.26.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Forms Screen for Commercial Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_ba.26.13.html") ) { return "lob_ba.26.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Screen for Commercial Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_ba.26.14.html") ) { return "lob_ba.26.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commercial Auto Object Model") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_ba.26.15.html") ) { return "lob_ba.26.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Businessowners") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_bop.27.01.html") ) { return "lob_bop.27.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Businessowners Screens") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_bop.27.02.html") ) { return "lob_bop.27.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Offerings Screen for Businessowners") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_bop.27.03.html") ) { return "lob_bop.27.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Qualification Screen for Businessowners") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_bop.27.04.html") ) { return "lob_bop.27.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Info Screen for Businessowners") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_bop.27.05.html") ) { return "lob_bop.27.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Businessowners Line Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_bop.27.06.html") ) { return "lob_bop.27.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Locations Screen for Businessowners") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_bop.27.07.html") ) { return "lob_bop.27.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Buildings and Locations Screen for Businessowners") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_bop.27.08.html") ) { return "lob_bop.27.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifiers Screen for Businessowners") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_bop.27.09.html") ) { return "lob_bop.27.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Risk Analysis Screen for Businessowners") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_bop.27.10.html") ) { return "lob_bop.27.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Review Screen for Businessowners") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_bop.27.11.html") ) { return "lob_bop.27.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Quote Screen for Businessowners") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_bop.27.12.html") ) { return "lob_bop.27.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Forms Screen for Businessowners") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_bop.27.13.html") ) { return "lob_bop.27.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Screen for Businessowners") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_bop.27.14.html") ) { return "lob_bop.27.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Businessowners Object Model") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_bop.27.15.html") ) { return "lob_bop.27.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commercial Package Policy") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cpp.28.01.html") ) { return "lob_cpp.28.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commercial Package Screens") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cpp.28.02.html") ) { return "lob_cpp.28.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Offerings Screen for Commercial Package") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cpp.28.03.html") ) { return "lob_cpp.28.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Qualification Screen for Commercial Package") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cpp.28.04.html") ) { return "lob_cpp.28.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Info Screen for Commercial Package") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cpp.28.05.html") ) { return "lob_cpp.28.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Line Selection Screen for Commercial Package") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cpp.28.06.html") ) { return "lob_cpp.28.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Locations Screen for Commercial Package") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cpp.28.07.html") ) { return "lob_cpp.28.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Line of Business Screens for Commercial Package") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cpp.28.08.html") ) { return "lob_cpp.28.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifiers Screen for Commercial Package") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cpp.28.09.html") ) { return "lob_cpp.28.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Risk Analysis Screen for Commercial Package") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cpp.28.10.html") ) { return "lob_cpp.28.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Quote Screen for Commercial Package") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cpp.28.11.html") ) { return "lob_cpp.28.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Forms Screen for Commercial Package") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cpp.28.12.html") ) { return "lob_cpp.28.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Screen for Commercial Package") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cpp.28.13.html") ) { return "lob_cpp.28.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commercial Package Object Model") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cpp.28.14.html") ) { return "lob_cpp.28.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commercial Package Product Model") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cpp.28.15.html") ) { return "lob_cpp.28.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commercial Property") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cp.29.01.html") ) { return "lob_cp.29.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Commercial Property") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cp.29.02.html") ) { return "lob_cp.29.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commercial Property Screens") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cp.29.03.html") ) { return "lob_cp.29.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Info Screen for Commercial Property") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cp.29.04.html") ) { return "lob_cp.29.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Buildings and Locations Screen for Commercial Property") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cp.29.05.html") ) { return "lob_cp.29.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Blankets Screen for Commercial Property") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cp.29.06.html") ) { return "lob_cp.29.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifiers Screen for Commercial Property") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cp.29.07.html") ) { return "lob_cp.29.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Risk Analysis Screen for Commercial Property") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cp.29.08.html") ) { return "lob_cp.29.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Review Screen for Commercial Property") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cp.29.09.html") ) { return "lob_cp.29.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Quote Screen for Commercial Property") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cp.29.10.html") ) { return "lob_cp.29.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Forms Screen for Commercial Property") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cp.29.11.html") ) { return "lob_cp.29.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Screen for Commercial Property") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cp.29.12.html") ) { return "lob_cp.29.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Commercial Property Object Model") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cp.29.13.html") ) { return "lob_cp.29.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Commercial Property") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_cp.29.14.html") ) { return "lob_cp.29.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"General Liability") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_gl.30.01.html") ) { return "lob_gl.30.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"General Liability Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_gl.30.02.html") ) { return "lob_gl.30.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"General Liability Screens") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_gl.30.03.html") ) { return "lob_gl.30.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Qualification Screen for General Liability") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_gl.30.04.html") ) { return "lob_gl.30.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Info Screen for General Liability") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_gl.30.05.html") ) { return "lob_gl.30.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Locations Screen for General Liability") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_gl.30.06.html") ) { return "lob_gl.30.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Coverages Screen for General Liability") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_gl.30.07.html") ) { return "lob_gl.30.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Exposures Screen for General Liability") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_gl.30.08.html") ) { return "lob_gl.30.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifiers Screen for General Liability") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_gl.30.09.html") ) { return "lob_gl.30.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Risk Analysis Screen for General Liability") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_gl.30.10.html") ) { return "lob_gl.30.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Review Screen for General Liability") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_gl.30.11.html") ) { return "lob_gl.30.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Quote Screen for General Liability") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_gl.30.12.html") ) { return "lob_gl.30.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Forms Screen for General Liability") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_gl.30.13.html") ) { return "lob_gl.30.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Screen for General Liability") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_gl.30.14.html") ) { return "lob_gl.30.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"General Liability Object Model") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_gl.30.15.html") ) { return "lob_gl.30.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Inland Marine") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.01.html") ) { return "lob_im.31.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Inland Marine Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.02.html") ) { return "lob_im.31.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Inland Marine Screens") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.03.html") ) { return "lob_im.31.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Info Screen for Inland Marine") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.04.html") ) { return "lob_im.31.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Coverage Part Selection Screen for Inland Marine") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.05.html") ) { return "lob_im.31.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Buildings and Locations Screen for Inland Marine") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.06.html") ) { return "lob_im.31.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Accounts Receivable Screen for Inland Marine") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.07.html") ) { return "lob_im.31.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Contractors Equipment Screen for Inland Marine") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.08.html") ) { return "lob_im.31.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Signs Screen for Inland Marine") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.09.html") ) { return "lob_im.31.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Risk Analysis Screen for Inland Marine") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.10.html") ) { return "lob_im.31.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Review Screen for Inland Marine") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.11.html") ) { return "lob_im.31.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Quote Screen for Inland Marine") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.12.html") ) { return "lob_im.31.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Forms Screen for Inland Marine") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.13.html") ) { return "lob_im.31.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Screen for Inland Marine") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.14.html") ) { return "lob_im.31.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Inland Marine Object Model") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.15.html") ) { return "lob_im.31.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Inland Marine Product Model") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_im.31.16.html") ) { return "lob_im.31.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Personal Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_pa.32.01.html") ) { return "lob_pa.32.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Personal Auto Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_pa.32.02.html") ) { return "lob_pa.32.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Personal Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_pa.32.03.html") ) { return "lob_pa.32.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Personal Auto Screens") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_pa.32.04.html") ) { return "lob_pa.32.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Info Screen for Personal Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_pa.32.05.html") ) { return "lob_pa.32.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Drivers Screen for Personal Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_pa.32.06.html") ) { return "lob_pa.32.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Vehicles Screen for Personal Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_pa.32.07.html") ) { return "lob_pa.32.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"PA Coverages Screen for Personal Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_pa.32.08.html") ) { return "lob_pa.32.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Risk Analysis Screen for Personal Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_pa.32.09.html") ) { return "lob_pa.32.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Review Screen for Personal Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_pa.32.10.html") ) { return "lob_pa.32.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Quote Screen for Personal Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_pa.32.11.html") ) { return "lob_pa.32.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Forms Screen for Personal Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_pa.32.12.html") ) { return "lob_pa.32.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Screen for Personal Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_pa.32.13.html") ) { return "lob_pa.32.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Personal Auto Object Model") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_pa.32.14.html") ) { return "lob_pa.32.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Personal Auto") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_pa.32.15.html") ) { return "lob_pa.32.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workers\u2019 Compensation") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_wc.33.01.html") ) { return "lob_wc.33.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Key Features of Workers\u2019 Compensation") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_wc.33.02.html") ) { return "lob_wc.33.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workers\u2019 Compensation Screens") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_wc.33.03.html") ) { return "lob_wc.33.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Qualification Screen for Workers\u2019 Compensation") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_wc.33.04.html") ) { return "lob_wc.33.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Info Screen for Workers\u2019 Compensation") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_wc.33.05.html") ) { return "lob_wc.33.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Locations Screen for Workers\u2019 Compensation") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_wc.33.06.html") ) { return "lob_wc.33.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"WC Coverages Screen for Workers\u2019 Compensation") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_wc.33.07.html") ) { return "lob_wc.33.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Supplemental Screen for Workers\u2019 Compensation") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_wc.33.08.html") ) { return "lob_wc.33.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"WC Options Screen for Worker\u2019s Compensation") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_wc.33.09.html") ) { return "lob_wc.33.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Risk Analysis Screen for Workers\u2019 Compensation") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_wc.33.10.html") ) { return "lob_wc.33.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Review Screen for Workers\u2019 Compensation") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_wc.33.11.html") ) { return "lob_wc.33.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Quote Screen for Workers\u2019 Compensation") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_wc.33.12.html") ) { return "lob_wc.33.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Forms Screen for Workers\u2019 Compensation") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_wc.33.13.html") ) { return "lob_wc.33.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Payment Screen for Workers\u2019 Compensation") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_wc.33.14.html") ) { return "lob_wc.33.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Workers\u2019 Compensation Object Models") && Guidewire_FMSourceFileMatch(SRCFILE,"lob_wc.33.15.html") ) { return "lob_wc.33.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Additional Features of PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"p-components.html") ) { return "p-components.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy File") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_job_file.35.1.html") ) { return "pc_job_file.35.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy File Screens, Menus, and Actions") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_job_file.35.2.html") ) { return "pc_job_file.35.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Policies") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_job_file.35.3.html") ) { return "pc_job_file.35.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Policies") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_job_file.35.4.html") ) { return "pc_job_file.35.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Copy Data for a Line of Business") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_job_file.35.5.html") ) { return "pc_job_file.35.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Split and Spin-off Policies") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_job_file.35.6.html") ) { return "pc_job_file.35.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Archiving in PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"archiving-pc.36.1.html") ) { return "archiving-pc.36.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Archiving Policy Terms") && Guidewire_FMSourceFileMatch(SRCFILE,"archiving-pc.36.2.html") ) { return "archiving-pc.36.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Searching for Archived Policy Periods") && Guidewire_FMSourceFileMatch(SRCFILE,"archiving-pc.36.3.html") ) { return "archiving-pc.36.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Retrieving Archived Policies") && Guidewire_FMSourceFileMatch(SRCFILE,"archiving-pc.36.4.html") ) { return "archiving-pc.36.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Policy Archiving") && Guidewire_FMSourceFileMatch(SRCFILE,"archiving-pc.36.5.html") ) { return "archiving-pc.36.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"More Information on Archiving") && Guidewire_FMSourceFileMatch(SRCFILE,"archiving-pc.36.6.html") ) { return "archiving-pc.36.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account File") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.01.html") ) { return "account_management.37.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.02.html") ) { return "account_management.37.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Screens") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.03.html") ) { return "account_management.37.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account File Summary Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.04.html") ) { return "account_management.37.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account File Contacts Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.05.html") ) { return "account_management.37.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account File Locations Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.06.html") ) { return "account_management.37.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Submission Manager Screen for Accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.07.html") ) { return "account_management.37.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account File Documents Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.08.html") ) { return "account_management.37.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing Screen for Accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.09.html") ) { return "account_management.37.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account File History Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.10.html") ) { return "account_management.37.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Actions") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.11.html") ) { return "account_management.37.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.12.html") ) { return "account_management.37.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Searching for an Account") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.13.html") ) { return "account_management.37.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating an Account") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.14.html") ) { return "account_management.37.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Tracking Your Accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.15.html") ) { return "account_management.37.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Moving a Policy From One Account to Another") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.16.html") ) { return "account_management.37.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rewriting Policies From One Account to Another") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.17.html") ) { return "account_management.37.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Merging Accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.18.html") ) { return "account_management.37.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding an Account Relationship") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.19.html") ) { return "account_management.37.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"Modifying an Account Relationship") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.20.html") ) { return "account_management.37.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"Removing an Account Relationship") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.21.html") ) { return "account_management.37.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"Searching for Accounts with a Shared Contact") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.22.html") ) { return "account_management.37.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.23.html") ) { return "account_management.37.23.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Rule Sets") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.24.html") ) { return "account_management.37.24.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Moving Policies Between Accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.25.html") ) { return "account_management.37.25.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Account Relationships") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.26.html") ) { return "account_management.37.26.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Relationship Rule Sets") && Guidewire_FMSourceFileMatch(SRCFILE,"account_management.37.27.html") ) { return "account_management.37.27.html";}
else if (Guidewire_TopicMatch(TOPIC,"Locations") && Guidewire_FMSourceFileMatch(SRCFILE,"locations.38.1.html") ) { return "locations.38.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Location Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"locations.38.2.html") ) { return "locations.38.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Location Object Model") && Guidewire_FMSourceFileMatch(SRCFILE,"locations.38.3.html") ) { return "locations.38.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Synchronization Classes for Locations") && Guidewire_FMSourceFileMatch(SRCFILE,"locations.38.4.html") ) { return "locations.38.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Account Locations") && Guidewire_FMSourceFileMatch(SRCFILE,"locations.38.5.html") ) { return "locations.38.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Policy Locations") && Guidewire_FMSourceFileMatch(SRCFILE,"locations.38.6.html") ) { return "locations.38.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Locations") && Guidewire_FMSourceFileMatch(SRCFILE,"locations.38.7.html") ) { return "locations.38.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Generic Schedules") && Guidewire_FMSourceFileMatch(SRCFILE,"schedules.39.1.html") ) { return "schedules.39.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Generic Schedule Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"schedules.39.2.html") ) { return "schedules.39.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Types of Schedules") && Guidewire_FMSourceFileMatch(SRCFILE,"schedules.39.3.html") ) { return "schedules.39.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Activities") && Guidewire_FMSourceFileMatch(SRCFILE,"activities.40.1.html") ) { return "activities.40.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Activities Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"activities.40.2.html") ) { return "activities.40.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Activities") && Guidewire_FMSourceFileMatch(SRCFILE,"activities.40.3.html") ) { return "activities.40.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Activity Patterns") && Guidewire_FMSourceFileMatch(SRCFILE,"activities.40.4.html") ) { return "activities.40.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Activity Object Model") && Guidewire_FMSourceFileMatch(SRCFILE,"activities.40.5.html") ) { return "activities.40.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Activity Batch Process") && Guidewire_FMSourceFileMatch(SRCFILE,"activities.40.6.html") ) { return "activities.40.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"PolicyCenter Contacts") && Guidewire_FMSourceFileMatch(SRCFILE,"contacts.41.1.html") ) { return "contacts.41.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Contact Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"contacts.41.2.html") ) { return "contacts.41.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with the Contact Tab") && Guidewire_FMSourceFileMatch(SRCFILE,"contacts.41.3.html") ) { return "contacts.41.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Contacts in Policies and Accounts") && Guidewire_FMSourceFileMatch(SRCFILE,"contacts.41.4.html") ) { return "contacts.41.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Contact Object Model") && Guidewire_FMSourceFileMatch(SRCFILE,"contacts.41.5.html") ) { return "contacts.41.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Account Synchronization Classes for Contacts") && Guidewire_FMSourceFileMatch(SRCFILE,"contacts.41.6.html") ) { return "contacts.41.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Contacts") && Guidewire_FMSourceFileMatch(SRCFILE,"contacts.41.7.html") ) { return "contacts.41.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Underwriting Authority") && Guidewire_FMSourceFileMatch(SRCFILE,"uw_issues.42.1.html") ) { return "uw_issues.42.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Underwriting Authority Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"uw_issues.42.2.html") ) { return "uw_issues.42.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Underwriting Issues") && Guidewire_FMSourceFileMatch(SRCFILE,"uw_issues.42.3.html") ) { return "uw_issues.42.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Underwriting Referral Reasons") && Guidewire_FMSourceFileMatch(SRCFILE,"uw_issues.42.4.html") ) { return "uw_issues.42.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Quoting and Rating") && Guidewire_FMSourceFileMatch(SRCFILE,"rating.43.01.html") ) { return "rating.43.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Quotes") && Guidewire_FMSourceFileMatch(SRCFILE,"rating.43.02.html") ) { return "rating.43.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Entities Associated with Costs and Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"rating.43.03.html") ) { return "rating.43.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cost Delegate") && Guidewire_FMSourceFileMatch(SRCFILE,"rating.43.04.html") ) { return "rating.43.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Transaction Delegate") && Guidewire_FMSourceFileMatch(SRCFILE,"rating.43.05.html") ) { return "rating.43.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Period Fields for Costs and Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"rating.43.06.html") ) { return "rating.43.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cost and Transaction Model for Businessowners Line") && Guidewire_FMSourceFileMatch(SRCFILE,"rating.43.07.html") ) { return "rating.43.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cost and Transaction Model for Commercial Auto Line") && Guidewire_FMSourceFileMatch(SRCFILE,"rating.43.08.html") ) { return "rating.43.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cost and Transaction Model for Commercial Property Line") && Guidewire_FMSourceFileMatch(SRCFILE,"rating.43.09.html") ) { return "rating.43.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cost and Transaction Model for General Liability Line") && Guidewire_FMSourceFileMatch(SRCFILE,"rating.43.10.html") ) { return "rating.43.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cost and Transaction Model for Inland Marine Line") && Guidewire_FMSourceFileMatch(SRCFILE,"rating.43.11.html") ) { return "rating.43.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cost and Transaction Model for Personal Auto Line") && Guidewire_FMSourceFileMatch(SRCFILE,"rating.43.12.html") ) { return "rating.43.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cost and Transaction Model for Workers\u2019 Compensation Line") && Guidewire_FMSourceFileMatch(SRCFILE,"rating.43.13.html") ) { return "rating.43.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Calculating Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"rating.43.14.html") ) { return "rating.43.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Internal Tools for Rating: Financial Transactions Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"rating.43.15.html") ) { return "rating.43.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Quote Purging") && Guidewire_FMSourceFileMatch(SRCFILE,"quotepurging.44.1.html") ) { return "quotepurging.44.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Quote Purging Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"quotepurging.44.2.html") ) { return "quotepurging.44.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rating Overrides") && Guidewire_FMSourceFileMatch(SRCFILE,"rating_manualoverrides.45.1.html") ) { return "rating_manualoverrides.45.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rating Overrides Permissions") && Guidewire_FMSourceFileMatch(SRCFILE,"rating_manualoverrides.45.2.html") ) { return "rating_manualoverrides.45.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Underwriting Issues for Rating Overrides") && Guidewire_FMSourceFileMatch(SRCFILE,"rating_manualoverrides.45.3.html") ) { return "rating_manualoverrides.45.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Processing Overrides Across Policy Transactions") && Guidewire_FMSourceFileMatch(SRCFILE,"rating_manualoverrides.45.4.html") ) { return "rating_manualoverrides.45.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rating Overrides in the User Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"rating_manualoverrides.45.5.html") ) { return "rating_manualoverrides.45.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Rating Overrides") && Guidewire_FMSourceFileMatch(SRCFILE,"rating_manualoverrides.45.6.html") ) { return "rating_manualoverrides.45.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding Rating Overrides to a Line of Business") && Guidewire_FMSourceFileMatch(SRCFILE,"rating_manualoverrides.45.7.html") ) { return "rating_manualoverrides.45.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Management") && Guidewire_FMSourceFileMatch(SRCFILE,"documents.46.1.html") ) { return "documents.46.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Security") && Guidewire_FMSourceFileMatch(SRCFILE,"documents.46.2.html") ) { return "documents.46.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Documents") && Guidewire_FMSourceFileMatch(SRCFILE,"documents.46.3.html") ) { return "documents.46.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Document Management") && Guidewire_FMSourceFileMatch(SRCFILE,"documents.46.4.html") ) { return "documents.46.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Document Management Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"documents.46.5.html") ) { return "documents.46.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Forms") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_handling.47.1.html") ) { return "forms_handling.47.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Forms Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_handling.47.2.html") ) { return "forms_handling.47.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Data Spreadsheet ImportExport") && Guidewire_FMSourceFileMatch(SRCFILE,"spreadsheet.48.1.html") ) { return "spreadsheet.48.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Large Policy Workflow Using Policy Data Spreadsheet ImportExport") && Guidewire_FMSourceFileMatch(SRCFILE,"spreadsheet.48.2.html") ) { return "spreadsheet.48.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Data Spreadsheet ImportExport in Commercial Property") && Guidewire_FMSourceFileMatch(SRCFILE,"spreadsheet.48.3.html") ) { return "spreadsheet.48.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Spreadsheets Generated by Policy Data Spreadsheet ImportExport") && Guidewire_FMSourceFileMatch(SRCFILE,"spreadsheet.48.4.html") ) { return "spreadsheet.48.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Product Model Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"product_model.49.01.html") ) { return "product_model.49.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Product Model Representation") && Guidewire_FMSourceFileMatch(SRCFILE,"product_model.49.02.html") ) { return "product_model.49.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Products Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"product_model.49.03.html") ) { return "product_model.49.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"PolicyLine Pattern Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"product_model.49.04.html") ) { return "product_model.49.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Coverage Pattern Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"product_model.49.05.html") ) { return "product_model.49.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding Categories") && Guidewire_FMSourceFileMatch(SRCFILE,"product_model.49.06.html") ) { return "product_model.49.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Coverages, Exclusions, Conditions, and Coverables Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"product_model.49.07.html") ) { return "product_model.49.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Existence") && Guidewire_FMSourceFileMatch(SRCFILE,"product_model.49.08.html") ) { return "product_model.49.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Coverage Term Pattern Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"product_model.49.09.html") ) { return "product_model.49.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Availability Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"product_model.49.10.html") ) { return "product_model.49.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Understanding Offerings") && Guidewire_FMSourceFileMatch(SRCFILE,"product_model.49.11.html") ) { return "product_model.49.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Revisioning") && Guidewire_FMSourceFileMatch(SRCFILE,"policyrevisions.50.01.html") ) { return "policyrevisions.50.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"What Is a Policy Revision") && Guidewire_FMSourceFileMatch(SRCFILE,"policyrevisions.50.02.html") ) { return "policyrevisions.50.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Structure of Revisioning Across Effective Time") && Guidewire_FMSourceFileMatch(SRCFILE,"policyrevisions.50.03.html") ) { return "policyrevisions.50.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Out-of-sequence Jobs") && Guidewire_FMSourceFileMatch(SRCFILE,"policyrevisions.50.04.html") ) { return "policyrevisions.50.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Preempted Jobs") && Guidewire_FMSourceFileMatch(SRCFILE,"policyrevisions.50.05.html") ) { return "policyrevisions.50.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Applying Changes to Future Renewals") && Guidewire_FMSourceFileMatch(SRCFILE,"policyrevisions.50.06.html") ) { return "policyrevisions.50.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Revisioning Rewrite Jobs") && Guidewire_FMSourceFileMatch(SRCFILE,"policyrevisions.50.07.html") ) { return "policyrevisions.50.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Summary of Revisioning Terminology") && Guidewire_FMSourceFileMatch(SRCFILE,"policyrevisions.50.08.html") ) { return "policyrevisions.50.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Revisioning Properties Reference") && Guidewire_FMSourceFileMatch(SRCFILE,"policyrevisions.50.09.html") ) { return "policyrevisions.50.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Details of Merging and Applying Changes") && Guidewire_FMSourceFileMatch(SRCFILE,"policyrevisions.50.10.html") ) { return "policyrevisions.50.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Differences Between Revisions") && Guidewire_FMSourceFileMatch(SRCFILE,"policyrevisions.50.11.html") ) { return "policyrevisions.50.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multicurrency Features") && Guidewire_FMSourceFileMatch(SRCFILE,"multicurrency_pc.51.1.html") ) { return "multicurrency_pc.51.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multicurrency Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"multicurrency_pc.51.2.html") ) { return "multicurrency_pc.51.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multicurrency Object Model") && Guidewire_FMSourceFileMatch(SRCFILE,"multicurrency_pc.51.3.html") ) { return "multicurrency_pc.51.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multicurrency User Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"multicurrency_pc.51.4.html") ) { return "multicurrency_pc.51.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rating Management") && Guidewire_FMSourceFileMatch(SRCFILE,"p-rate_table.html") ) { return "p-rate_table.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rating Management Concepts") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table.53.1.html") ) { return "rate_table.53.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rating Management Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table.53.2.html") ) { return "rate_table.53.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rate Tables") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table.53.3.html") ) { return "rate_table.53.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Matching a Factor in the Rate Table") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table.53.4.html") ) { return "rate_table.53.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rate Routines") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table.53.5.html") ) { return "rate_table.53.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Parameter Sets") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table.53.6.html") ) { return "rate_table.53.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rate Books") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table.53.7.html") ) { return "rate_table.53.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rating Worksheets") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table.53.8.html") ) { return "rate_table.53.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Impact Testing") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table.53.9.html") ) { return "rate_table.53.9.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rating Management User Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.01.html") ) { return "rate_table_ui.54.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Preparing to Use Rating Management") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.02.html") ) { return "rate_table_ui.54.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Rate Books") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.03.html") ) { return "rate_table_ui.54.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Searching for a Rate Book") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.04.html") ) { return "rate_table_ui.54.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding a New Rate Book") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.05.html") ) { return "rate_table_ui.54.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Deleting a Rate Book") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.06.html") ) { return "rate_table_ui.54.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rate Book Details Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.07.html") ) { return "rate_table_ui.54.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rate Book Status and Available Actions") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.08.html") ) { return "rate_table_ui.54.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rate Book Actions and Permissions") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.09.html") ) { return "rate_table_ui.54.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing and Exporting Rate Books to XML") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.10.html") ) { return "rate_table_ui.54.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Rate Table Definitions") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.11.html") ) { return "rate_table_ui.54.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rate Table Definition Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.12.html") ) { return "rate_table_ui.54.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with the Rate Table Editor") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.13.html") ) { return "rate_table_ui.54.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Selecting a Rate Table") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.14.html") ) { return "rate_table_ui.54.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rate Table Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.15.html") ) { return "rate_table_ui.54.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Editing Rate Table Content in PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.16.html") ) { return "rate_table_ui.54.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Editing Rate Table Content in Excel") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.17.html") ) { return "rate_table_ui.54.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Rate Table Update Validations") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.18.html") ) { return "rate_table_ui.54.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Excel Rate Table Import Validations") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.19.html") ) { return "rate_table_ui.54.19.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Rate Routines") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.20.html") ) { return "rate_table_ui.54.20.html";}
else if (Guidewire_TopicMatch(TOPIC,"Accessing Rate Routines") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.21.html") ) { return "rate_table_ui.54.21.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding a New Rate Routine") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.22.html") ) { return "rate_table_ui.54.22.html";}
else if (Guidewire_TopicMatch(TOPIC,"Deleting a Rate Routine") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.23.html") ) { return "rate_table_ui.54.23.html";}
else if (Guidewire_TopicMatch(TOPIC,"Actions on Rate Routines") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.24.html") ) { return "rate_table_ui.54.24.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding Steps to a Rate Routine") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.25.html") ) { return "rate_table_ui.54.25.html";}
else if (Guidewire_TopicMatch(TOPIC,"Instruction and Operand Types") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.26.html") ) { return "rate_table_ui.54.26.html";}
else if (Guidewire_TopicMatch(TOPIC,"Specifying a Function as the Operand in a Rate Routine Step") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.27.html") ) { return "rate_table_ui.54.27.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating a Rate Routine for Another Jurisdiction") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.28.html") ) { return "rate_table_ui.54.28.html";}
else if (Guidewire_TopicMatch(TOPIC,"Specifying a Flat-rated Coverage in a Rate Routine") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.29.html") ) { return "rate_table_ui.54.29.html";}
else if (Guidewire_TopicMatch(TOPIC,"Editing Long Rate Routines") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.30.html") ) { return "rate_table_ui.54.30.html";}
else if (Guidewire_TopicMatch(TOPIC,"Viewing Rating Worksheets") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.31.html") ) { return "rate_table_ui.54.31.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Parameter Sets") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.32.html") ) { return "rate_table_ui.54.32.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Impact Testing") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.33.html") ) { return "rate_table_ui.54.33.html";}
else if (Guidewire_TopicMatch(TOPIC,"Examples of Working with Rating Management") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.34.html") ) { return "rate_table_ui.54.34.html";}
else if (Guidewire_TopicMatch(TOPIC,"Creating and Using a Rate Table with a Multiple Factors") && Guidewire_FMSourceFileMatch(SRCFILE,"rate_table_ui.54.35.html") ) { return "rate_table_ui.54.35.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reinsurance Management") && Guidewire_FMSourceFileMatch(SRCFILE,"p-reinsurance.html") ) { return "p-reinsurance.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reinsurance Management Concepts") && Guidewire_FMSourceFileMatch(SRCFILE,"reinsurance.56.1.html") ) { return "reinsurance.56.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reinsurance Program Basics") && Guidewire_FMSourceFileMatch(SRCFILE,"reinsurance.56.2.html") ) { return "reinsurance.56.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"How PolicyCenter Links Reinsurance to Policies") && Guidewire_FMSourceFileMatch(SRCFILE,"reinsurance.56.3.html") ) { return "reinsurance.56.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"How PolicyCenter Calculates Ceded Premiums") && Guidewire_FMSourceFileMatch(SRCFILE,"reinsurance.56.4.html") ) { return "reinsurance.56.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Shared Reinsurance Agreements") && Guidewire_FMSourceFileMatch(SRCFILE,"reinsurance.56.5.html") ) { return "reinsurance.56.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Location Groups") && Guidewire_FMSourceFileMatch(SRCFILE,"reinsurance.56.6.html") ) { return "reinsurance.56.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reinsurance Management User Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"reinsurance_ui.57.1.html") ) { return "reinsurance_ui.57.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with the Reinsurance Tab") && Guidewire_FMSourceFileMatch(SRCFILE,"reinsurance_ui.57.2.html") ) { return "reinsurance_ui.57.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Reinsurance Management in Policies") && Guidewire_FMSourceFileMatch(SRCFILE,"reinsurance_ui.57.3.html") ) { return "reinsurance_ui.57.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reinsurance Management Screens") && Guidewire_FMSourceFileMatch(SRCFILE,"reinsurance_ui.57.4.html") ) { return "reinsurance_ui.57.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Treaty or Facultative Agreement Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"reinsurance_ui.57.5.html") ) { return "reinsurance_ui.57.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reinsurance Program Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"reinsurance_ui.57.6.html") ) { return "reinsurance_ui.57.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Search Agreements Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"reinsurance_ui.57.7.html") ) { return "reinsurance_ui.57.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Search Programs Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"reinsurance_ui.57.8.html") ) { return "reinsurance_ui.57.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reinsurance Screen in the Policy File") && Guidewire_FMSourceFileMatch(SRCFILE,"reinsurance_ui.57.9.html") ) { return "reinsurance_ui.57.9.html";}
else if (Guidewire_TopicMatch(TOPIC,"PolicyCenter Administration") && Guidewire_FMSourceFileMatch(SRCFILE,"p-administering.html") ) { return "p-administering.html";}
else if (Guidewire_TopicMatch(TOPIC,"Security: Roles, Permissions, and the Community Model") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_security.59.01.html") ) { return "pc_security.59.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Community Model Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_security.59.02.html") ) { return "pc_security.59.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Security Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_security.59.03.html") ) { return "pc_security.59.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Role-based Security") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_security.59.04.html") ) { return "pc_security.59.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data-based Security for Accounts and Policies") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_security.59.05.html") ) { return "pc_security.59.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Data-based Security for the Community Model") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_security.59.06.html") ) { return "pc_security.59.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"System and Application Permissions") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_security.59.07.html") ) { return "pc_security.59.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Security Restrictions Using the Status Field") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_security.59.08.html") ) { return "pc_security.59.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Producer of Record and Producer of Service") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_security.59.09.html") ) { return "pc_security.59.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Managing the PolicyCenter Community") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_security.59.10.html") ) { return "pc_security.59.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Security Object Models") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_security.59.11.html") ) { return "pc_security.59.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Users and Security") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_security.59.12.html") ) { return "pc_security.59.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Security and Configuration Scenarios Related to Producer Codes") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_security.59.13.html") ) { return "pc_security.59.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Security Dictionary") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_security.59.14.html") ) { return "pc_security.59.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Access Control for Documents and Notes") && Guidewire_FMSourceFileMatch(SRCFILE,"pc_security.59.15.html") ) { return "pc_security.59.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Authority Profiles") && Guidewire_FMSourceFileMatch(SRCFILE,"authority_profiles.60.1.html") ) { return "authority_profiles.60.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Authority Profile Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"authority_profiles.60.2.html") ) { return "authority_profiles.60.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Authority Profiles") && Guidewire_FMSourceFileMatch(SRCFILE,"authority_profiles.60.3.html") ) { return "authority_profiles.60.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Team Management") && Guidewire_FMSourceFileMatch(SRCFILE,"team_views.61.1.html") ) { return "team_views.61.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Team Management Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"team_views.61.2.html") ) { return "team_views.61.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Team Tab User Categories") && Guidewire_FMSourceFileMatch(SRCFILE,"team_views.61.3.html") ) { return "team_views.61.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with the Team Tab") && Guidewire_FMSourceFileMatch(SRCFILE,"team_views.61.4.html") ) { return "team_views.61.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Holds Administration") && Guidewire_FMSourceFileMatch(SRCFILE,"admin_policyholds.62.1.html") ) { return "admin_policyholds.62.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Holds Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"admin_policyholds.62.2.html") ) { return "admin_policyholds.62.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Policy Holds") && Guidewire_FMSourceFileMatch(SRCFILE,"admin_policyholds.62.3.html") ) { return "admin_policyholds.62.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Hold Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"admin_policyholds.62.4.html") ) { return "admin_policyholds.62.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Hold Object Model") && Guidewire_FMSourceFileMatch(SRCFILE,"admin_policyholds.62.5.html") ) { return "admin_policyholds.62.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Policy Holds") && Guidewire_FMSourceFileMatch(SRCFILE,"admin_policyholds.62.6.html") ) { return "admin_policyholds.62.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing and Exporting Policy Holds") && Guidewire_FMSourceFileMatch(SRCFILE,"admin_policyholds.62.7.html") ) { return "admin_policyholds.62.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Holidays and Business Weeks") && Guidewire_FMSourceFileMatch(SRCFILE,"holidays.63.1.html") ) { return "holidays.63.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Specifying Holiday Dates") && Guidewire_FMSourceFileMatch(SRCFILE,"holidays.63.2.html") ) { return "holidays.63.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Holidays, Weekends, and Business Weeks") && Guidewire_FMSourceFileMatch(SRCFILE,"holidays.63.3.html") ) { return "holidays.63.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Using Gosu Methods to Work with Holidays") && Guidewire_FMSourceFileMatch(SRCFILE,"holidays.63.4.html") ) { return "holidays.63.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Business Weeks and Business Hours") && Guidewire_FMSourceFileMatch(SRCFILE,"holidays.63.5.html") ) { return "holidays.63.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Holiday Permissions") && Guidewire_FMSourceFileMatch(SRCFILE,"holidays.63.6.html") ) { return "holidays.63.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Form Pattern Administration") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.01.html") ) { return "forms_admin.64.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"About Forms") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.02.html") ) { return "forms_admin.64.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Form Patterns") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.03.html") ) { return "forms_admin.64.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Searching for a Form Pattern") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.04.html") ) { return "forms_admin.64.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding a Form Pattern") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.05.html") ) { return "forms_admin.64.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Specifying Removal or Replacement Forms for Policy Changes") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.06.html") ) { return "forms_admin.64.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Importing and Exporting Policy Form Patterns") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.07.html") ) { return "forms_admin.64.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Form Pattern or New Policy Form Screen") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.08.html") ) { return "forms_admin.64.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Basics Tab for Form Patterns") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.09.html") ) { return "forms_admin.64.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Products Tab for Form Patterns") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.10.html") ) { return "forms_admin.64.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Jurisdictions Tab for Form Patterns") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.11.html") ) { return "forms_admin.64.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Change Tab for Form Patterns") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.12.html") ) { return "forms_admin.64.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Inference Tab for Form Patterns") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.13.html") ) { return "forms_admin.64.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Form Configuration") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.14.html") ) { return "forms_admin.64.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Form Pattern Validation") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.15.html") ) { return "forms_admin.64.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Generic Form Inference") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.16.html") ) { return "forms_admin.64.16.html";}
else if (Guidewire_TopicMatch(TOPIC,"Configuring Custom Form Inference") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.17.html") ) { return "forms_admin.64.17.html";}
else if (Guidewire_TopicMatch(TOPIC,"Adding a Custom Inference Class") && Guidewire_FMSourceFileMatch(SRCFILE,"forms_admin.64.18.html") ) { return "forms_admin.64.18.html";}
else if (Guidewire_TopicMatch(TOPIC,"Administering Policy Data Spreadsheet ImportExport") && Guidewire_FMSourceFileMatch(SRCFILE,"admin_location_spreadsheet.65.1.html") ) { return "admin_location_spreadsheet.65.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Spreadsheet Export Formats User Interface") && Guidewire_FMSourceFileMatch(SRCFILE,"admin_location_spreadsheet.65.2.html") ) { return "admin_location_spreadsheet.65.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Defining Export Formats") && Guidewire_FMSourceFileMatch(SRCFILE,"admin_location_spreadsheet.65.3.html") ) { return "admin_location_spreadsheet.65.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"External System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"p-integrations.html") ) { return "p-integrations.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-bc-integration.67.01.html") ) { return "pc-bc-integration.67.01.html";}
else if (Guidewire_TopicMatch(TOPIC,"Billing System Integration Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-bc-integration.67.02.html") ) { return "pc-bc-integration.67.02.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Transactions That Create a New Policy Period") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-bc-integration.67.03.html") ) { return "pc-bc-integration.67.03.html";}
else if (Guidewire_TopicMatch(TOPIC,"Policy Transactions That Create Midterm Changes") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-bc-integration.67.04.html") ) { return "pc-bc-integration.67.04.html";}
else if (Guidewire_TopicMatch(TOPIC,"Cancellations in the Billing System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-bc-integration.67.05.html") ) { return "pc-bc-integration.67.05.html";}
else if (Guidewire_TopicMatch(TOPIC,"Reinstatements in the Billing System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-bc-integration.67.06.html") ) { return "pc-bc-integration.67.06.html";}
else if (Guidewire_TopicMatch(TOPIC,"Renewals or Rewrites in the Billing System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-bc-integration.67.07.html") ) { return "pc-bc-integration.67.07.html";}
else if (Guidewire_TopicMatch(TOPIC,"Final Audits in the Billing System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-bc-integration.67.08.html") ) { return "pc-bc-integration.67.08.html";}
else if (Guidewire_TopicMatch(TOPIC,"Premium Reporting in the Billing System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-bc-integration.67.09.html") ) { return "pc-bc-integration.67.09.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with the Billing System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-bc-integration.67.10.html") ) { return "pc-bc-integration.67.10.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with the Payment Screen in the Billing System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-bc-integration.67.11.html") ) { return "pc-bc-integration.67.11.html";}
else if (Guidewire_TopicMatch(TOPIC,"Viewing the Policy Period in BillingCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-bc-integration.67.12.html") ) { return "pc-bc-integration.67.12.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Accounts from the Billing System") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-bc-integration.67.13.html") ) { return "pc-bc-integration.67.13.html";}
else if (Guidewire_TopicMatch(TOPIC,"Working with Policies in the Billing System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-bc-integration.67.14.html") ) { return "pc-bc-integration.67.14.html";}
else if (Guidewire_TopicMatch(TOPIC,"Multicurrency Integration Between BillingCenter and PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-bc-integration.67.15.html") ) { return "pc-bc-integration.67.15.html";}
else if (Guidewire_TopicMatch(TOPIC,"Claim System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-cc-integration.68.1.html") ) { return "pc-cc-integration.68.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Claim System Integration Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-cc-integration.68.2.html") ) { return "pc-cc-integration.68.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Accessing Summary Loss Information from the Claim System") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-cc-integration.68.3.html") ) { return "pc-cc-integration.68.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"Viewing Loss Claims for Policies") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-cc-integration.68.4.html") ) { return "pc-cc-integration.68.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Viewing Loss Claims from an Account") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-cc-integration.68.5.html") ) { return "pc-cc-integration.68.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Loss Claims Notification at Renewal") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-cc-integration.68.6.html") ) { return "pc-cc-integration.68.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Large Loss Notification") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-cc-integration.68.7.html") ) { return "pc-cc-integration.68.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Permissions for Working with Claims") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-cc-integration.68.8.html") ) { return "pc-cc-integration.68.8.html";}
else if (Guidewire_TopicMatch(TOPIC,"Claim Search Plugin") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-cc-integration.68.9.html") ) { return "pc-cc-integration.68.9.html";}
else if (Guidewire_TopicMatch(TOPIC,"Contact Management System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-ab-integration.69.1.html") ) { return "pc-ab-integration.69.1.html";}
else if (Guidewire_TopicMatch(TOPIC,"Contact Management System Integration Overview") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-ab-integration.69.2.html") ) { return "pc-ab-integration.69.2.html";}
else if (Guidewire_TopicMatch(TOPIC,"Searching for Contacts Within a Contact Management System") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-ab-integration.69.3.html") ) { return "pc-ab-integration.69.3.html";}
else if (Guidewire_TopicMatch(TOPIC,"New and Updated Contacts") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-ab-integration.69.4.html") ) { return "pc-ab-integration.69.4.html";}
else if (Guidewire_TopicMatch(TOPIC,"Detecting Duplicates in the Contact Management System") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-ab-integration.69.5.html") ) { return "pc-ab-integration.69.5.html";}
else if (Guidewire_TopicMatch(TOPIC,"Duplicate Contacts in PolicyCenter") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-ab-integration.69.6.html") ) { return "pc-ab-integration.69.6.html";}
else if (Guidewire_TopicMatch(TOPIC,"Deleting, Removing, and Inactivating a Contact") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-ab-integration.69.7.html") ) { return "pc-ab-integration.69.7.html";}
else if (Guidewire_TopicMatch(TOPIC,"Customizing the Contact Management System Integration") && Guidewire_FMSourceFileMatch(SRCFILE,"pc-ab-integration.69.8.html") ) { return "pc-ab-integration.69.8.html";}
else { return("../wwhelp/topic_cannot_be_found.html"); } }

function  WWHBookData_MatchTopic(P)
{
var C=null;P=decodeURIComponent(decodeURIComponent(escape(P)));//workaround epub bug with UTF8 processing!
if(P=="Documents_and_Their_Management")C="documents.46.1.html";
if(P=="Forms_Handling")C="forms_handling.47.1.html";
if (C) { return C } else { return GUIDEWIRE_TOPIC_TO_FILE(P,Guidewire_ExtractSrcFromURL());}
}
