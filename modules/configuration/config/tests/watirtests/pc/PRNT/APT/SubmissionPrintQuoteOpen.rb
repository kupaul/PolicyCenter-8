# Created by IntelliJ IDEA.
# User: sshi
# Date: Oct 23, 2007
# Time: 10:13:21 AM
# Configuration:  PC OOTB
# Description: Verify Link an existing document to the account
# Required input: sample submission exists in "Created in past 7 days" filter
# Expected result: Able to print the Quote for the submission and open up the printing file
## Test steps:
#   *Go to My Submission in desktop
#   *Search for the submission in "Created in past 7 days"
#   *Open up the first search results
#   *Print Quote
#   *Open up the file
# Modified by:
# Date modified:

require 'Setup'
require 'common/LoginLogoutMethods'
require 'common/SubmissionMethods'


class SubmissionPrintQuoteOpen < Test::Unit::TestCase

  $currentDir = ""
  $fileDirectory = ""

  def test_SubmissionPrintQuoteOpen

     #
    $currentDir = File.expand_path(File.dirname(__FILE__))
    $fileDirectory =  $currentDir.gsub(/\//, '\\')
    LoginLogoutMethods.login('aapplegate')
    SubmissionMethods.selectMySubmission('Created in past 7 days')

  autoit = WIN32OLE.new('AutoItX3.Control')

    $title="File Download"
    $FileName_id = 4426

    #Select file directory
    autoit.WinWait( $title, nil, 5)
    autoit.WinActive( $title)

    autoit.ControlFocus( $title, "", $FileName_id)
    autoit.sleep(2000)
    autoit.ControlClick( $title, "", $FileName_id, 1)

   
  end
end
