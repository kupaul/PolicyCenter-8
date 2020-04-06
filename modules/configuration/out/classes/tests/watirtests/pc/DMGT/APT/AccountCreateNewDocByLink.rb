# Created by IntelliJ IDEA.
# User: SShi
# Date: Oct 17, 2007
#Configuration:  PC OOTB
# Description: Verify Link an existing document to the account
# Required input: Creat a new account
# Expected result: an existing document is added to the account
## Test steps:
#   *Create a new  account
#   *Link a Excle file to the existing account
#   *Verify the Excle file is added on the document page
# Modified by:
# Date modified: 

require 'Setup'
require 'common/LoginLogoutMethods'
require 'common/AccountMethods'


class AccountCreateNewDocByLink < Test::Unit::TestCase
  
  $accountAction = "AccountFile:AccountFileMenuActions"
  $documentAttachmentDV = "AccountNewDocumentLinkedWorksheet:NewDocumentLinkedScreen:DocumentAttachmentDV"
  $documentDetailsInputSet = "AccountNewDocumentLinkedWorksheet:NewDocumentLinkedScreen:DocumentMetadataInputSet"
  $documentMenuItemSet = "AccountFile:AccountFileMenuActions:AccountFileMenuActions_NewDocument:AccountNewDocumentMenuItemSet:AccountNewDocumentMenuItemSet"
  $documentMenueLink = "AccountFile:MenuLinks:AccountFile_AccountFile_Documents" 
  $update = "AccountNewDocumentLinkedWorksheet:NewDocumentLinkedScreen:Update"

  $currentDir = ""
  $fileDirectory = ""

  def test_AccountCreateNewDocByLink
   
     #Select file to link using
    $currentDir = File.expand_path(File.dirname(__FILE__))
    $fileDirectory =  $currentDir.gsub(/\//, '\\')
    LoginLogoutMethods.login('aapplegate')
    AccountMethods.createNewCompanyAccount("Active","Other")
 
     $ie.frame(:name, "top_frame").span(:id, $accountAction).click
     $ie.frame(:name, "top_frame").span(:id, $documentMenuItemSet+"_Linked").click

    $ie.frame(:name, "top_frame").select_list(:id, $documentDetailsInputSet + ":Status").select("Approved")
    $ie.frame(:name, "top_frame").select_list(:id, $documentDetailsInputSet + ":Type").select("Statement")
    $ie.frame(:name, "top_frame").button(:id, $documentAttachmentDV + ":Attachment").click_no_wait

    #Select file to link using
    autoit = WIN32OLE.new('AutoItX3.Control')

    $title="Choose file"
    $lookIn_id=1137
    $fileName_id = 1148
    $open_id = 1
    $fileName = "test_XLS_data.xls"

    #Select file directory
    autoit.WinWait("Choose file", nil, 5)
    autoit.WinActive("Choose file")

    autoit.ControlFocus($title, "", $fileName_id)
    autoit.ControlClick($title, "", $fileName_id, 1)
    autoit.ControlSetText($title, "", $fileName_id, $fileDirectory)
    autoit.ControlFocus($title, "", $open_id)
    autoit.ControlClick($title, "", $open_id, 1)
    autoit.ControlSend($title, "", $open_id, "!o")

    #Set file name
    autoit.ControlFocus($title, "", $fileName_id)
    autoit.ControlClick($title, "", $fileName_id, 1)
    autoit.ControlSetText($title, "", $fileName_id, $fileName)
    autoit.ControlFocus($title, "", $open_id)
    autoit.ControlClick($title, "", $open_id, 1)
    autoit.ControlSend($title, "", $open_id, "!o")
    autoit.sleep(2000)

    #Click Update button to add linked document to account
    $ie.frame(:name, "top_frame").button(:id, $update).click 


    #Go to document page, assert the document is added
    $ie.frame(:name, "top_frame").link(:id, $documentMenueLink).click
    assert($ie.frame(:name, "top_frame").contains_text("test_XLS_data"))


  end
end