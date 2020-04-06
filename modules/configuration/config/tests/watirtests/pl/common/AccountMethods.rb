# Created by IntelliJ IDEA.
# User: sshi
# Date: Oct 17, 2007
# Time: 1:44:39 PM
# To change this template use File | Settings | File Templates.

require 'common/RandUtil'


class AccountMethods

  $name = RandUtil. randAlphanumericCharacters(10)
  $createAccountDV = "CreateAccount:CreateAccountScreen:CreateAccountDV"
  $createAccountContactInputSet =  $createAccountDV +":CreateAccountContactInputSet"
  $addressInputSet = $createAccountContactInputSet + ":ContactPrimaryAddressInputSet:AddressInputSet"

  $createAccountIndustryCodeSelect = "IndustryCodeSearchPopup:IndustryCodeSearchScreen:IndustryCodeSearchResultsLV"
  $createAccountUpdate = "CreateAccount:CreateAccountScreen:Update"

  $newAccount =  "TabBar:AccountTab:AccountTab_NewAccount"
  $newAccountButton = "NewAccount:NewAccountScreen:NewAccountSearchResultsLV_tb:NewAccountButton"
  $newAccountSearchDV = "NewAccount:NewAccountScreen:NewAccountSearchDV"

  $organizationSearchDV = "OrganizationSearchPopup:OrganizationSearchPopupScreen:OrganizationSearchDV"
  $organizationSearchResultsLV = "OrganizationSearchPopup:OrganizationSearchPopupScreen:OrganizationSearchResultsLV"

  #This Method will create a new Company account. It needs 2 parameters: accountType can pass "Active", "Pending" or "Withdrawn"
  # addressType can pass  "Billing", "Business", "Home" and "Other"
  def AccountMethods.createNewCompanyAccount(accountStatus,addressType)
     # Search account
     wait_until {$ie.frame(:name, "top_frame").span(:id, $newAccount).exists?}

     $ie.frame(:name, "top_frame").span(:id,$newAccount).click

     $ie.frame(:name, "top_frame").select_list(:id, $newAccountSearchDV + ":AccountStatus").select(accountStatus)
     $ie.frame(:name, "top_frame").button(:id, $newAccountSearchDV+":SearchAndResetInputSet:SearchLinksInputSet:Search").click
     $ie.frame(:name, "top_frame").span(:id, $newAccountButton+":NewAccount_Company").click

     # Create a new account
     $ie.frame(:name, "top_frame").text_field(:id, $createAccountContactInputSet+":Name").set($name)
     $ie.frame(:name, "top_frame").text_field(:id, $addressInputSet+":AddressLine1").set("2211 Bridgepointe Parkway")
     $ie.frame(:name, "top_frame").text_field(:id, $addressInputSet+":City").set("San Mateo")
     $ie.frame(:name, "top_frame").select_list(:id,  $addressInputSet+":State").select("California")
     $ie.frame(:name, "top_frame").text_field(:id, $addressInputSet+":PostalCode").set("94404")
     $ie.frame(:name, "top_frame").select_list(:id, $addressInputSet+":AddressType").select(addressType)

    # search SIC Code
     $ie.frame(:name, "top_frame").image(:alt, "Search...").click
     $ie.frame(:name, "top_frame").button(:id, $createAccountIndustryCodeSelect+":0:Select").click

    #select Producer
     $ie.frame(:name, "top_frame").image(:alt, "Select Organization...").click
     $ie.frame(:name, "top_frame").select_list(:id, $organizationSearchDV+":Type").select("Agency")
     $ie.frame(:name, "top_frame").button(:id, $organizationSearchDV+":SearchAndResetInputSet:SearchLinksInputSet:Search").click
     $ie.frame(:name, "top_frame").button(:id, $organizationSearchResultsLV +":0:Select").click
     $ie.frame(:name, "top_frame").select_list(:id, $createAccountDV+":ProducerSelectionInputSet:ProducerCode").select("301-008578 ACV Property Insurance")

     $ie.frame(:name, "top_frame").button(:id, $createAccountUpdate).click
   end

   #This Method will create a new Person account. It needs 2 parameters: accountType can pass "Active", "Pending" or "Withdrawn"
  # addressType can pass  "Billing", "Business", "Home" and "Other"
   def AccountMethods.createNewPersonAccount(accountStatus,addressType)

     # Search account
     wait_until {$ie.frame(:name, "top_frame").span(:id, $newAccount).exists?}

     $ie.frame(:name, "top_frame").span(:id,$newAccount).click

     $ie.frame(:name, "top_frame").select_list(:id, $newAccountSearchDV + ":AccountStatus").select(accountStatus)
     $ie.frame(:name, "top_frame").button(:id, $newAccountSearchDV+":SearchAndResetInputSet:SearchLinksInputSet:Search").click
     $ie.frame(:name, "top_frame").span(:id, $newAccountButton+":NewAccount_Person").click

     # Create a new account
     $ie.frame(:name, "top_frame").text_field(:id, $createAccountContactInputSet+":FirstName").set($name)
     $ie.frame(:name, "top_frame").text_field(:id, $createAccountContactInputSet+":LastName").set($name)
     $ie.frame(:name, "top_frame").text_field(:id, $addressInputSet+":AddressLine1").set("2211 Bridgepointe Parkway")
     $ie.frame(:name, "top_frame").text_field(:id, $addressInputSet+":City").set("San Mateo")
     $ie.frame(:name, "top_frame").select_list(:id,  $addressInputSet+":State").select("California")
     $ie.frame(:name, "top_frame").text_field(:id, $addressInputSet+":PostalCode").set("94404")
     $ie.frame(:name, "top_frame").select_list(:id, $addressInputSet+":AddressType").select(addressType)

    # search SIC Code
     $ie.frame(:name, "top_frame").image(:alt, "Search...").click
     $ie.frame(:name, "top_frame").button(:id, $createAccountIndustryCodeSelect+":0:Select").click

    #select Producer
     $ie.frame(:name, "top_frame").image(:alt, "Select Organization...").click
     $ie.frame(:name, "top_frame").select_list(:id, $organizationSearchDV+":Type").select("Agency")
     $ie.frame(:name, "top_frame").button(:id, $organizationSearchDV+":SearchAndResetInputSet:SearchLinksInputSet:Search").click
     $ie.frame(:name, "top_frame").button(:id, $organizationSearchResultsLV +":0:Select").click
     $ie.frame(:name, "top_frame").select_list(:id, $createAccountDV+":ProducerSelectionInputSet:ProducerCode").select("301-008578 ACV Property Insurance")

     $ie.frame(:name, "top_frame").button(:id, $createAccountUpdate).click
   end
end


