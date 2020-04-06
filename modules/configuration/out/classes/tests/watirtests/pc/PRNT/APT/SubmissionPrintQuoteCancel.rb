# Created by IntelliJ IDEA.
# User: sshi
# Date: Oct 23, 2007
# Time: 11:40:08 AM
# Configuration:  PC OOTB
# Description: Verify Link an existing document to the account
# Required input: sample submission exists in "Created in past 7 days" filter
# Expected result: Able to print the Quote for the submission and open up the printing file
## Test steps:
#   *Go to My Submission in desktop
#   *Search for the submission in "Created in past 7 days"
#   *Open up the first search results
#   *Print Quote
#   *Cancel the file
# Modified by:
# Date modified:

require 'Setup'#There is a problem with this. Can't Cancel the File download window

require 'Setup'
require 'common/LoginLogoutMethods'
require 'common/SubmissionMethods'


class SubmissionPrintQuoteCancel < Test::Unit::TestCase

  $currentDir = ""
  $fileDirectory = ""

  def test_SubmissionPrintQuoteCancel

    #
    $currentDir = File.expand_path(File.dirname(__FILE__))
    $fileDirectory =  $currentDir.gsub(/\//, '\\')
    LoginLogoutMethods.login('aapplegate')
    SubmissionMethods.selectMySubmission("Created in past 7 days")

   autoit = WIN32OLE.new('AutoItX3.Control')

    $title="File Download"
    $FileName_id = 2

    #Select file directory
    autoit.WinWait( $title, nil, 5)
    autoit.WinActive( $title)

    autoit.ControlFocus( $title, "", $FileName_id)
    autoit.sleep(4000)
    autoit.ControlClick( $title, "", $FileName_id, 1)
  end
end