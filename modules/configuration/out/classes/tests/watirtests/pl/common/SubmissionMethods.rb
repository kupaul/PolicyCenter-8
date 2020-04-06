# Created by IntelliJ IDEA.
# User: sshi
# Date: Oct 23, 2007
# Time: 9:34:30 AM
# To change this template use File | Settings | File Templates.
#

require 'common/RandUtil'


class SubmissionMethods

  $desktopSubmissions = "Desktop:MenuLinks:Desktop_DesktopSubmissions"
  $desktopSubmissionsLV = "DesktopSubmissions:DesktopSubmissionsScreen:DesktopSubmissionsLV"
  $printQuote = "SubmissionWizard:InternalSubmissionWizardStepSet:PostPreQualWizardStepSet:SubmissionWizard_QuoteScreen:CreateSubmissionQuote"

  #This Method will select an existing submission from desktop and click Print Quote to open up the "File Download" popup
  #One parameter is needed for this methos: submissionFilter - "All open", "Created in past 7 days" and  "Completed in last 30 days"
  def SubmissionMethods.selectMySubmission(submissionsFilter)
     # Go to My submission
     wait_until {$ie.frame(:name, "top_frame").link(:id, $desktopSubmissions).exists?}

     $ie.frame(:name, "top_frame").link(:id,$desktopSubmissions).click

     $ie.frame(:name, "top_frame").select_list(:id, $desktopSubmissionsLV + ":SubmissionsFilter").select(submissionsFilter)
     $ie.frame(:name, "top_frame").link(:id,$desktopSubmissionsLV + ":0:SubmissionNumber").click
     $ie.frame(:name, "top_frame").button(:id, $printQuote).click 
   end
end


