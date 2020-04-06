# Created by IntelliJ IDEA.
# User: sshi
# Date: Oct 23, 2007
# Time: 10:41:21 AM
# Configuration:  PC OOTB
# Description: Verify Link an existing document to the account
# Required input: sample submission exists in "Created in past 7 days" filter
# Expected result: Able to print the Quote for the submission and open up the printing file
## Test steps:
#   *Go to My Submission in desktop
#   *Search for the submission in "Created in past 7 days"
#   *Open up the first search results
#   *Print Quote
#   *Save the file
# Modified by:
# Date modified:

require 'Setup'
require 'common/LoginLogoutMethods'
require 'common/SubmissionMethods'


class SubmissionPrintQuoteSave < Test::Unit::TestCase

  $currentDir = ""
  $fileDirectory = ""

  def test_SubmissionPrintQuoteSave

    #
    $currentDir = File.expand_path(File.dirname(__FILE__))
    $fileDirectory =  $currentDir.gsub(/\//, '\\')
    LoginLogoutMethods.login('aapplegate')
    SubmissionMethods.selectMySubmission('Created in past 7 days')

  autoit = WIN32OLE.new('AutoItX3.Control')

  #Select file directory
    autoit.WinWait("File Download", nil, 5)
    autoit.WinActivate("File Download")
    autoit.ControlFocus("File Download", "", 4427)
    autoit.sleep(3000)
    autoit.ControlClick("File Download", "", 4427,1)
    autoit.WinWait("Save As", nil, 5)
    autoit.WinActivate($title)
    autoit.ControlFocus($title, "", $fileName_id)
    autoit.sleep(2000)
    autoit.ControlClick("Save As", "", "&Save")
    #Add code to verify document is saved

  end
end




