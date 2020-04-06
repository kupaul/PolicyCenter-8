# Created by IntelliJ IDEA.
# User: sshi
# Date: Oct 19, 2007
# Time: 9:07:24 AM
# Description: Verify  an existing document to the account
# Required input: Creat a new account
# Expected result: a new document is added to the account
# Test steps:
#   *Create a new  account
#   *Create a new doc for this account by template
#   *Verify the new file is added on the document page
# Modified by:
# Date modified:

require 'Setup'
require 'common/LoginLogoutMethods'
require 'common/AccountMethods'

class AccountCreateNewDocByTemp < Test::Unit::TestCase

  $accountAction = "AccountFile:AccountFileMenuActions"
  $documentMenuItemSet = "AccountFile:AccountFileMenuActions:AccountFileMenuActions_NewDocument:AccountNewDocumentMenuItemSet:AccountNewDocumentMenuItemSet"
  $select = "DocumentTemplateSearchPopup:DocumentTemplateSearchScreen:DocumentTemplateSearchResultsLV"
  $createDocument = "AccountNewDocumentFromTemplateWorksheet:NewDocumentFromTemplateScreen:NewTemplateDocumentDV:CreateDocument"
  $customUpdate = "AccountNewDocumentFromTemplateWorksheet:NewDocumentFromTemplateScreen:NewDocumentFromTemplate_CustomUpdate"

  $currentDir = ""
  $fileDirectory = ""

  def test_AccountCreateNewDocByLink

     #Select file to link using
    $currentDir = File.expand_path(File.dirname(__FILE__))
    $fileDirectory =  $currentDir.gsub(/\//, '\\')

    LoginLogoutMethods.login('aapplegate')
    AccountMethods.createNewPersonAccount("Pending","Billing")

    $ie.frame(:name, "top_frame").span(:id, $accountAction).click
    $ie.frame(:name, "top_frame").span(:id, $documentMenuItemSet+"_Template").click

    $ie.frame(:name, "top_frame").image(:alt, "Search...").click

    $ie.frame(:name, "top_frame").button(:id, $select+":0:Select").click
    $ie.frame(:name, "top_frame").button(:id, $createDocument).click
    sleep(3)

     # Acrobat Reader window is open
     autoit = WIN32OLE.new('AutoItX3.Control')
     oldvalue = autoit.Opt("WinTitleMatchMode", 2)    #match any substrig in the title

     $title = "AccountEmailSent.gscript.htm"
     autoit.WinWait($title, nil, 5)
     autoit.WinActive($title)
     assert_equal(1, autoit.WinExists($title))
     autoit.WinKill($title)

     $ie.frame(:name, "top_frame").button(:id, $customUpdate).click

     #Verify new document is created on the claim
     assert($ie.frame(:name, "top_frame").contains_text("AccountEmailSent"))

     LoginLogoutMethods.logout()

  end
end