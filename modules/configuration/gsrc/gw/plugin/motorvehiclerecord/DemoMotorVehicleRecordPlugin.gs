package gw.plugin.motorvehiclerecord
uses java.util.Date
uses java.util.HashMap
uses java.lang.Integer
uses gw.api.motorvehiclerecord.IMVRData
uses gw.api.motorvehiclerecord.IMVRSubject
uses gw.lob.pa.mvr.crossboundary.SimpleMVRData
uses gw.lob.pa.mvr.crossboundary.SimpleMVRIncident
uses gw.api.motorvehiclerecord.IMVRSearchCriteria
uses gw.lob.pa.mvr.SubjectWithProviderID
uses gw.lob.pa.mvr.crossboundary.SimpleMVRLicense


@Export
class DemoMotorVehicleRecordPlugin implements IMotorVehicleRecordPlugin{
  var stageMap = new HashMap<String, Integer>() //to allow some MVRs to be sent back and then others when queried again
  //var mvrSearchCriteria = new HashMap<String, IMVRSearchCriteria>()
  var mvr : SimpleMVRData
  var mvrRecordNumber = 0

  construct() {
  }
  
  override function orderMVR( mvrSubjects : IMVRSubject[] ) : HashMap<IMVRSubject, String> {
    var responseHash = new HashMap<IMVRSubject, String>()
    for(subject in mvrSubjects index i){
      var requestID = subject.SearchCriteria.LicenseNumber + "_" + i
      responseHash.put(subject, requestID)
      //mvrSearchCriteria.put(requestID , subject.SearchCriteria)
    }
    //demo plugin tracking, only useful for mock implementations
    var stageID = getStageID(mvrSubjects.first())
    if(not stageMap.containsKey(stageID)){
      stageMap.put(stageID, 0)
    }
    mvrRecordNumber = 0
    
    return responseHash
  }
  
  private function getStageID(subject: IMVRSubject): String{
    var policyDriverMVR: PolicyDriverMVR
    if(subject typeis SubjectWithProviderID){
      policyDriverMVR = subject.InternalSubject as PolicyDriverMVR
    }else{
      policyDriverMVR = subject as PolicyDriverMVR
    }
    var jobNumber = policyDriverMVR.Branch.Job.JobNumber
    return jobNumber
  }

  override function getMVROrderResponse( mvrSubjects : IMVRSubject[] ) : HashMap<IMVRSubject, MVRResponse> {
    var sortedSubjects = mvrSubjects.sortBy(\ mvrS -> mvrS.SearchCriteria.LastName)
    var responseHash = new HashMap<IMVRSubject, MVRResponse>() 
    var stageID = getStageID(mvrSubjects.first())
    var stage = stageMap.get(stageID)
    
    if(stage <> null){
      for(subject in sortedSubjects index i){    
        switch(stage){
        //first very quick call from workflow
        case 0:    
             if(subject.SearchCriteria.LastName.contains("Misano") or subject.SearchCriteria.LastName.containsIgnoreCase("delay")){
              responseHash.put(subject, MVRResponse.TC_DELAY)
              break            
            }
            responseHash.put(subject, MVRResponse.TC_PEND)

          break
        //call after 3 second delay
        case 1: 
            //testing for names section
            if(subject.SearchCriteria.LastName.contains("Misano") or subject.SearchCriteria.LastName.containsIgnoreCase("clear")){
              responseHash.put( subject, MVRResponse.TC_CLEAR )
              break            
            }
            else if(subject.SearchCriteria.LastName.contains("Mosport") or subject.SearchCriteria.LastName.containsIgnoreCase("notfound")){
              responseHash.put( subject, MVRResponse.TC_NOTFOUND )
              break            
            }
            else if(subject.SearchCriteria.LastName.containsIgnoreCase("pending")){
              responseHash.put( subject, MVRResponse.TC_PEND )
              break            
            }
            else if(subject.SearchCriteria.LastName.containsIgnoreCase("delay")){
              responseHash.put(subject, MVRResponse.TC_DELAY)
              break            
            }
            else if(subject.SearchCriteria.LastName.contains("Mostro") or (subject.SearchCriteria.LastName.containsIgnoreCase("hit") and i < 2)){
              responseHash.put(subject, MVRResponse.TC_HIT)
              break            
            }
           
            //else if(aDriverMvr.SearchCriteria.LastName == "Mr. Mostro") not necessary because first driver will be set to hit like Mostro needs      
            //if no specific name found then set based on position
            else if(i == 0){
              responseHash.put( subject, MVRResponse.TC_CLEAR )
            }    
            else if(i == 1){
              responseHash.put( subject, MVRResponse.TC_CLEAR )
            }
            else if(i == 2){
              responseHash.put( subject, MVRResponse.TC_PEND)
            } 
            else if(i == 3){
              responseHash.put( subject, MVRResponse.TC_PEND )
            }     
            else {
              responseHash.put( subject, MVRResponse.TC_DELAY)
            }  
          break
        //call after longer wait (2hours)
        case 2:
            if(subject.SearchCriteria.LastName.containsIgnoreCase("delay")){
              responseHash.put(subject, MVRResponse.TC_DELAY)
              break            
            }
            else if(subject.SearchCriteria.LastName.contains("Mostro") or (subject.SearchCriteria.LastName.containsIgnoreCase("hit") and i < 2)){
              responseHash.put(subject, MVRResponse.TC_HIT)
              break            
            }
            else if(i == 0){
              responseHash.put( subject, MVRResponse.TC_CLEAR)
            }     
            else if(i == 1){
              responseHash.put( subject, MVRResponse.TC_NOTFOUND)
            }            
            else if(i >= 2) {
              responseHash.put( subject, MVRResponse.TC_PEND)
            }
          break
        default:
            if(subject.SearchCriteria.LastName.containsIgnoreCase("hit")){
              responseHash.put(subject, MVRResponse.TC_HIT)
              break            
            }
            responseHash.put( subject, MVRResponse.TC_CLEAR )

        }
      }
      stage++ //increment the stage
    }
    stageMap.put(stageID, stage) //after getMVROrderStatus has been called once, move the stage to 1 so that the next time it is called the other MVRs can be returned
    return responseHash
  }
  
  
  override function getMVRDetails(mvrSubjects : IMVRSubject[]) : HashMap<IMVRSubject, IMVRData[]> {
    var sortedSubjects = mvrSubjects.sortBy(\ mvrS -> mvrS.SearchCriteria.LastName)
    var responseHash = new HashMap<IMVRSubject, IMVRData[]>()
    sortedSubjects.eachWithIndex(\ rID, counter -> {responseHash.put(sortedSubjects[counter], {samplePolicyMVR(sortedSubjects[counter].SearchCriteria)})
    })
    return responseHash
  }
      
  private function samplePolicyMVR(driverSc: IMVRSearchCriteria) : SimpleMVRData {
    mvr = new SimpleMVRData()
    mvr.ReportDate = Date.CurrentDate
    //set personal information and search criteria
    mvr.setDataBasedOnSearchCriteria(driverSc)

    var primaryLicense = new SimpleMVRLicense()
    primaryLicense.PrimaryLicense = true
    primaryLicense.LicenseNumber = driverSc.LicenseNumber
    primaryLicense.LicenseState = driverSc.LicenseState
    primaryLicense.LicenseClass = "C"
    primaryLicense.LicenseStatus = "LIC CDL:ELG"
    primaryLicense.OriginallyIssued = new Date("1/1/1970")
    primaryLicense.IssuedDate = new Date("1/1/2009")    
    primaryLicense.ReinstateDate = new Date("1/1/2005")        
    primaryLicense.ExpireDate = new Date("1/1/2014")     
    mvr.addLicense(primaryLicense)
    
    if(driverSc.LastName.contains("Mosport") or driverSc.LastName.containsIgnoreCase("notfound")){
      mvr.ReportNumber = 1
    }

//    if(requestID.startsWith("A123459")){
//      mvr = multiMVRPage1()
//      mvrReturnList.add(mvr)
//    
//      mvr = new entity.MVR()
//      mvr.ReportDate = Date.Today
//      //set personal information
//      mvr.setDataBasedOnSearchCriteria(policyDriverSC)
//      mvr = multiMVRPage2()
//      mvrReturnList.add(mvr) 
//    }     
    else if (driverSc.LastName.containsIgnoreCase("hit")){
      switch(mvrRecordNumber){
      case 0:
           mvr = singleMVRViolRein()
           break;
      case 1:
           mvr = singleMVRConSus()  
           break;
      case 2:
           mvr = singleMVRViol()
           break;
      case 3:
           mvr = multiMVRPage1()
           break
      default:
           mvr = singleMVRViolRein()
           break;
      }
    }
    else { //if(driverSc.LastName.contains("Misano") or driverSc.LastName.equalsIgnoreCase("clear"))
      mvr = clearMVR()  
    }
//      mvrReturnList.add(mvr)
//    }
//        mvrReturnList.add(mvr)
//    }
   
    // multiMVRPage1() : entity.MVR
    // multiMVRPage2() : entity.MVR
    
    // singleMVRConSus() : entity.MVR
    
    // singleMVRViol() : entity.MVR
    
    // clearMVR() : entity.MVR
    mvrRecordNumber++
    
    return mvr
  }

 private function singleMVRViolRein() : SimpleMVRData {
    var mvrIncident = new SimpleMVRIncident()
    
    // Report Data    
    //mvr.ReportDate = Date.Today
    //mvr.ReportRequestedDate = Date.Today
    mvr.YearsRequested = 7
    mvr.AdditionalDrivers = " "
    mvr.Miscellaneous = "CLASS: D=ANY SINGLE VEH UNDER 26001 GVWR LBS, TOWED UNIT UNDER 10001 GVWR LBS STATUS: CDL=ELG-ELIGIBLE STATUS: DL=LIC-LICENSED RESTR: B=CORRECTIVE LENSES"
    mvr.ReportNumber = 1

    mvr.Address = "123 First St, Virginia Beach, VA 08943"
    
    mvr.Donor = true
    mvr.Eyes = "Brown"
    mvr.Gender = "M"
    mvr.Hair = "Brunet"
    mvr.Height = "5' 11"
    mvr.Race = "W"
    mvr.SSN = "111-11-1111"
    mvr.Weight = "80 Kg"
    
    //Incidents
    mvrIncident.IncidentNumber = 1
    mvrIncident.IncidentType = MVRIncidentType.TC_VIOL
    mvrIncident.CarrierViolationCode = "E01"
    mvrIncident.ViolationDate = new Date("04/11/1998")
    mvrIncident.ConvictionDate = new Date("05/18/1998")
    mvrIncident.Description = "OPERATING WITHOUT REQUIRED EQUIPMENT"
    mvrIncident.Points = 1
    mvrIncident.Location = "MA"
    mvrIncident.Accident = ""
    mvrIncident.Court = "UNKNOWN"
    mvrIncident.Disposition = ""
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = "STATE NATIVE OFF - CODE:9020IS NO INSPECTION STICKER"
    mvrIncident.Speed = ""
    mvrIncident.SpeedZone = ""
    mvrIncident.State = ""
    mvrIncident.ViolationCode = "9020IS"
    mvrIncident.OrderNumber = ""
    mvr.addIncident(mvrIncident)
    
    mvrIncident = new SimpleMVRIncident()
    mvrIncident.IncidentNumber = 2
    mvrIncident.IncidentType = MVRIncidentType.TC_REIN
    mvrIncident.CarrierViolationCode = "D53"
    mvrIncident.ViolationDate = new Date("09/25/1995")
    mvrIncident.ConvictionDate = new Date("09/25/1995")
    mvrIncident.Description = "FAIL TO PAY - FINE AND COSTS"
    mvrIncident.Points = 3
    mvrIncident.Location = "MA"
    mvrIncident.Accident = ""
    mvrIncident.Court = ""
    mvrIncident.Disposition = ""
    mvrIncident.EligibleDate = new Date("09/25/1995")
    mvrIncident.Misc = "WITHDRAWA EXTENT:ALL - PRIVILEGES WITHDRAWAL -LOC REFN:PENDING REIN - FEE WITHDRAWAL STATE - NATIVE REASON:RDF - PAYMENT DEFAULT"
    mvrIncident.Speed = ""
    mvrIncident.SpeedZone = ""
    mvrIncident.State = ""
    mvrIncident.ViolationCode = ""
    mvrIncident.OrderNumber = ""
    mvr.addIncident(mvrIncident)
   
    mvrIncident = new SimpleMVRIncident()
    mvrIncident.IncidentNumber = 3    
    mvrIncident.IncidentType = MVRIncidentType.TC_VIOL
    mvrIncident.CarrierViolationCode = "S92"
    mvrIncident.ViolationDate = new Date("09/23/1995")
    mvrIncident.ConvictionDate = new Date("11/20/1995")
    mvrIncident.Description = "SPEEDING - LIMIT & ACTUAL REPORTED"
    mvrIncident.Points = 5
    mvrIncident.Location = "MA"
    mvrIncident.Accident = ""
    mvrIncident.Court = "DISTRICT COURT"
    mvrIncident.Disposition = ""
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = "STATE NATIVE OFF CODE:9017 SPEEDING"
    mvrIncident.Speed = "40"
    mvrIncident.SpeedZone = "SPEED LIMIT:25 "
    mvrIncident.State = ""
    mvrIncident.ViolationCode = "9017"
    mvrIncident.OrderNumber = ""
    mvr.addIncident(mvrIncident)
    
    mvrIncident = new SimpleMVRIncident()
    mvrIncident.IncidentNumber = 4    
    mvrIncident.IncidentType = MVRIncidentType.TC_ACCI
    mvrIncident.CarrierViolationCode = ""
    mvrIncident.ViolationDate = new Date("06/26/1987")
    mvrIncident.ConvictionDate = null
    mvrIncident.Description = "ACCIDENT - PERSONAL INJURY"
    mvrIncident.Points = 4
    mvrIncident.Location = "BARRIE"
    mvrIncident.Accident = " "
    mvrIncident.Court = ""
    mvrIncident.Disposition = ""
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = ""
    mvrIncident.Speed = ""
    mvrIncident.SpeedZone = ""
    mvrIncident.State = ""
    mvrIncident.ViolationCode = ""
    mvrIncident.OrderNumber = "2416163"
    mvr.addIncident(mvrIncident)
    
    return mvr
  }
 
 private function multiMVRPage1() : SimpleMVRData {
    var mvrIncident = new SimpleMVRIncident()
    
    // Report Data    
    //mvr.ReportDate = Date.Today
    //mvr.ReportRequestedDate = Date.Today
    mvr.YearsRequested = 7
    mvr.AdditionalDrivers = ""
    mvr.Miscellaneous = ""
    mvr.ReportNumber = 1
    
    var address = "123 Main St, San Diego, CA 92101"
    mvr.Address = address
    
    mvr.Donor = true
    mvr.Eyes = "Green"
    mvr.Gender = "M"
    mvr.Hair = "Brunet"
    mvr.Height = "6'02"
    mvr.Race = "White"
    mvr.SSN = "222-22-2222"
    mvr.Weight = "180"
    
    //Incidents
    mvrIncident.IncidentType = MVRIncidentType.TC_VIOL
    mvrIncident.IncidentNumber = 1
    mvrIncident.CarrierViolationCode = "063"
    mvrIncident.ViolationDate = new Date("01/15/1998")
    mvrIncident.ConvictionDate = new Date("01/15/1998")
    mvrIncident.Description = "HAS LICENSE IN ANOTHER STATE"
    mvrIncident.Points = 7
    mvrIncident.Location = "FL"
    mvrIncident.Accident = ""
    mvrIncident.Court = ""
    mvrIncident.Disposition = ""
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = ""
    mvrIncident.Speed = ""
    mvrIncident.SpeedZone = ""
    mvrIncident.State = ""
    mvrIncident.ViolationCode = ""
    mvrIncident.OrderNumber = ""
    mvr.addIncident(mvrIncident)
    
    mvrIncident = new SimpleMVRIncident()
    mvrIncident.IncidentNumber = 2    
    mvrIncident.IncidentType = MVRIncidentType.TC_REIN
    mvrIncident.CarrierViolationCode = "082"
    mvrIncident.ViolationDate = new Date("12/04/1997")
    mvrIncident.ConvictionDate = new Date("06/04/1998")
    mvrIncident.Description = "FAIL TO FILE INS AFTER CONVCTN/SUSP/NOTICE"
    mvrIncident.Points = 1
    mvrIncident.Location = "GA"
    mvrIncident.Accident = ""
    mvrIncident.Court = ""
    mvrIncident.Disposition = ""
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = ""
    mvrIncident.Speed = ""
    mvrIncident.SpeedZone = ""
    mvrIncident.State = ""
    mvrIncident.ViolationCode = ""
    mvrIncident.OrderNumber = "0420497"
    mvr.addIncident(mvrIncident)
   
    mvrIncident = new SimpleMVRIncident()
    mvrIncident.IncidentNumber = 3    
    mvrIncident.IncidentType = MVRIncidentType.TC_VIOL
    mvrIncident.CarrierViolationCode = "001"
    mvrIncident.ViolationDate = new Date("12/04/1997")
    mvrIncident.ConvictionDate = null
    mvrIncident.Description = "SPEEDING"
    mvrIncident.Points = 6
    mvrIncident.Location = "GA"
    mvrIncident.Accident = " "
    mvrIncident.Court = ""
    mvrIncident.Disposition = ""
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = ""
    mvrIncident.Speed = "82"
    mvrIncident.SpeedZone = "70"
    mvrIncident.State = ""
    mvrIncident.ViolationCode = ""
    mvrIncident.OrderNumber = "0011297"
    mvr.addIncident(mvrIncident)
    
    return mvr
  }
  
 private function multiMVRPage2() : SimpleMVRData {
    var mvrIncident = new SimpleMVRIncident()

    mvr.YearsRequested = 7
    mvr.AdditionalDrivers = ""
    mvr.Miscellaneous = ""
    mvr.ReportNumber = 2
    
    mvr.Address = "123 Main St, San Diego, CA 11111"

    mvr.Donor = true
    mvr.Eyes = "Green"
    mvr.Gender = "M"
    mvr.Hair = "Brunet"
    mvr.Height = "6'02"
    mvr.Race = "White"
    mvr.SSN = "333-33-3333"
    mvr.Weight = "180"
    
    //Incidents
    mvrIncident.IncidentNumber = 1    
    mvrIncident.IncidentType = MVRIncidentType.TC_REIN
    mvrIncident.CarrierViolationCode = "690"
    mvrIncident.ViolationDate = new Date("06/24/1996")
    mvrIncident.ConvictionDate = new Date("01/12/1996")
    mvrIncident.Description = "REINSTATEMENT - TEST REQUIRED"
    mvrIncident.Points = 0
    mvrIncident.Location = ""
    mvrIncident.Accident = ""
    mvrIncident.Court = ""
    mvrIncident.Disposition = ""
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = ""
    mvrIncident.Speed = ""
    mvrIncident.SpeedZone = ""
    mvrIncident.State = ""
    mvrIncident.ViolationCode = ""
    mvrIncident.OrderNumber = "143926R"
    mvr.addIncident(mvrIncident)
    
    mvrIncident = new SimpleMVRIncident()
    mvrIncident.IncidentNumber = 2    
    mvrIncident.IncidentType = MVRIncidentType.TC_VIOL
    mvrIncident.CarrierViolationCode = "052"
    mvrIncident.ViolationDate = new Date("05/30/1996")
    mvrIncident.ConvictionDate = new Date("10/06/1996")
    mvrIncident.Description = "FAIL TO SATISFY CITATION/SUSP/NOTICE SENT"
    mvrIncident.Points = 1
    mvrIncident.Location = "BRADLEY"
    mvrIncident.Accident = ""
    mvrIncident.Court = ""
    mvrIncident.Disposition = ""
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = ""
    mvrIncident.Speed = ""
    mvrIncident.SpeedZone = ""
    mvrIncident.State = ""
    mvrIncident.ViolationCode = ""
    mvrIncident.OrderNumber = "X057245"
    mvr.addIncident(mvrIncident)
   
    mvrIncident = new SimpleMVRIncident()
    mvrIncident.IncidentNumber = 3    
    mvrIncident.IncidentType = MVRIncidentType.TC_ACCI
    mvrIncident.CarrierViolationCode = ""
    mvrIncident.ViolationDate = new Date("06/26/1995")
    mvrIncident.ConvictionDate = null
    mvrIncident.Description = "ACCIDENT - PERSONAL INJURY"
    mvrIncident.Points = 8
    mvrIncident.Location = "HAMILTON"
    mvrIncident.Accident = " "
    mvrIncident.Court = ""
    mvrIncident.Disposition = ""
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = ""
    mvrIncident.Speed = ""
    mvrIncident.SpeedZone = ""
    mvrIncident.State = ""
    mvrIncident.ViolationCode = ""
    mvrIncident.OrderNumber = "2416163"
    mvr.addIncident(mvrIncident)
    
    return mvr
  }
  
private function singleMVRConSus() : SimpleMVRData {
    var mvrIncident = new SimpleMVRIncident()
    
    mvr.YearsRequested = 7
    mvr.AdditionalDrivers = ""
    mvr.Miscellaneous = ""
    mvr.ReportNumber = 1
    
    mvr.Address = "10 Queen St, San Diego, CA 11111"

    mvr.Donor = true
    mvr.Eyes = "Blue"
    mvr.Gender = "M"
    mvr.Hair = "Blond"
    mvr.Height = "6' 11"
    mvr.Race = "white"
    mvr.SSN = "444-44-4444"
    mvr.Weight = "160"
    
    //Incidents
    mvrIncident.IncidentNumber = 1    
    mvrIncident.IncidentType = MVRIncidentType.TC_CONV
    mvrIncident.CarrierViolationCode = ""
    mvrIncident.ViolationDate = new Date("07/17/2001")
    mvrIncident.ConvictionDate = new Date("08/23/2001")
    mvrIncident.Description = "DRIVING WHILE LICENSE WITHDRAWN"
    mvrIncident.Points = 5
    mvrIncident.Location = "GA"
    mvrIncident.Accident = "No"
    mvrIncident.Court = "GA057011J - Municipal Court - Rome"
    mvrIncident.Disposition = "Convicted"
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = ""
    mvrIncident.Speed = ""
    mvrIncident.SpeedZone = ""
    mvrIncident.State = ""
    mvrIncident.ViolationCode = ""
    mvrIncident.OrderNumber = ""
    mvr.addIncident(mvrIncident)
    
    mvrIncident = new SimpleMVRIncident()
    mvrIncident.IncidentNumber = 2    
    mvrIncident.IncidentType = MVRIncidentType.TC_CONV
    mvrIncident.CarrierViolationCode = ""
    mvrIncident.ViolationDate = new Date("02/22/2001")
    mvrIncident.ConvictionDate = new Date("03/26/2001")
    mvrIncident.Description = "Speeding (070/055)"
    mvrIncident.Points = 02
    mvrIncident.Location = "GA"
    mvrIncident.Accident = "No"
    mvrIncident.Court = "GA064013Z - Gordon County Probate Court"
    mvrIncident.Disposition = "Convicted"
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = ""
    mvrIncident.Speed = ""
    mvrIncident.SpeedZone = ""
    mvrIncident.State = ""
    mvrIncident.ViolationCode = ""
    mvrIncident.OrderNumber = ""
    mvr.addIncident(mvrIncident)
   
    mvrIncident = new SimpleMVRIncident()
    mvrIncident.IncidentNumber = 3    
    mvrIncident.IncidentType = MVRIncidentType.TC_SUSP
    mvrIncident.CarrierViolationCode = ""
    mvrIncident.ViolationDate = new Date("07/17/2001")
    mvrIncident.ConvictionDate = null
    mvrIncident.Description = "Driving with suspended or revoked license"
    mvrIncident.Points = 6
    mvrIncident.Location = "GA"
    mvrIncident.Accident = ""
    mvrIncident.Court = ""
    mvrIncident.Disposition = ""
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = "Withdrawal Extent: ALL Effective:08/23/2001 Expire:02/23/2002 Served:08/23/2001 Type:Court"
    mvrIncident.Speed = ""
    mvrIncident.SpeedZone = ""
    mvrIncident.State = ""
    mvrIncident.ViolationCode = ""
    mvrIncident.OrderNumber = ""
    mvr.addIncident(mvrIncident)
    
    mvrIncident = new SimpleMVRIncident()
    mvrIncident.IncidentNumber = 4    
    mvrIncident.IncidentType = MVRIncidentType.TC_SUSP
    mvrIncident.CarrierViolationCode = ""
    mvrIncident.ViolationDate = new Date("02/22/2001")
    mvrIncident.ConvictionDate = null
    mvrIncident.Description = "Points Suspension, First"
    mvrIncident.Points = 3
    mvrIncident.Location = "GA"
    mvrIncident.Accident = ""
    mvrIncident.Court = ""
    mvrIncident.Disposition = ""
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = "Withdrawal Extent: ALL Effective:07/07/2001 Expire:07/07/2001 Served:07/17/2001 Type:Court"
    mvrIncident.Speed = ""
    mvrIncident.SpeedZone = ""
    mvrIncident.State = ""
    mvrIncident.ViolationCode = ""
    mvrIncident.OrderNumber = ""
    mvr.addIncident(mvrIncident)
    
    mvrIncident = new SimpleMVRIncident()
    mvrIncident.IncidentNumber = 5    
    mvrIncident.IncidentType = MVRIncidentType.TC_ACCI
    mvrIncident.CarrierViolationCode = ""
    mvrIncident.ViolationDate = new Date("06/26/1989")
    mvrIncident.ConvictionDate = null
    mvrIncident.Description = "ACCIDENT - PERSONAL INJURY"
    mvrIncident.Points = 4
    mvrIncident.Location = "SUDBURY"
    mvrIncident.Accident = " "
    mvrIncident.Court = ""
    mvrIncident.Disposition = ""
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = ""
    mvrIncident.Speed = ""
    mvrIncident.SpeedZone = ""
    mvrIncident.State = ""
    mvrIncident.ViolationCode = ""
    mvrIncident.OrderNumber = "2416163"
    mvr.addIncident(mvrIncident)
    return mvr
  }
  
 private function singleMVRViol() : SimpleMVRData{
    var mvrIncident = new SimpleMVRIncident()
    
    // Report Data    
    //mvr.ReportDate = Date.Today
    //mvr.ReportRequestedDate = Date.Today
    mvr.YearsRequested = 3
    mvr.AdditionalDrivers = " "
    mvr.Miscellaneous = "This Person has a digital image. Identification card issued: 02-19-98. Expires: 09-27-02"
    mvr.ReportNumber = 1
    
    mvr.Address = "123 Main St, Miami, FL 33147"

    mvr.Donor = true
    mvr.Eyes = "Gray"
    mvr.Gender = "M"
    mvr.Hair = "Brunet"
    mvr.Height = "5' 11"
    mvr.Race = "H"
    mvr.SSN = "123-45-6789"
    mvr.Weight = ""
    
    //Incidents
    mvrIncident.IncidentNumber = 1    
    mvrIncident.IncidentType = MVRIncidentType.TC_VIOL
    mvrIncident.CarrierViolationCode = "622"
    mvrIncident.ViolationDate = new Date("06/28/1995")
    mvrIncident.ConvictionDate = new Date("04/10/1996")
    mvrIncident.Description = "FAIL TO DISPLAY DL"
    mvrIncident.Points = 1
    mvrIncident.Location = "DADE"
    mvrIncident.Accident = ""
    mvrIncident.Court = "COUNTY"
    mvrIncident.Disposition = "GUILTY"
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = ""
    mvrIncident.Speed = ""
    mvrIncident.SpeedZone = ""
    mvrIncident.State = ""
    mvrIncident.ViolationCode = ""
    mvrIncident.OrderNumber = "949679I"
    mvr.addIncident(mvrIncident)
    
    mvrIncident = new SimpleMVRIncident()
    mvrIncident.IncidentNumber = 2    
    mvrIncident.IncidentType = MVRIncidentType.TC_VIOL
    mvrIncident.CarrierViolationCode = "613"
    mvrIncident.ViolationDate = new Date("05/20/1997")
    mvrIncident.ConvictionDate = new Date("05/20/1997")
    mvrIncident.Description = "DRIVE WHILE LIC-CANC/REV/SUS"
    mvrIncident.Points = 5
    mvrIncident.Location = "DADE"
    mvrIncident.Accident = ""
    mvrIncident.Court = "COUNTY"
    mvrIncident.Disposition = "GUILTY"
    mvrIncident.EligibleDate = null
    mvrIncident.Misc = ""
    mvrIncident.Speed = ""
    mvrIncident.SpeedZone = ""
    mvrIncident.State = ""
    mvrIncident.ViolationCode = ""
    mvrIncident.OrderNumber = "T03CKTO"
    mvr.addIncident(mvrIncident)
    
    return mvr
  }
  
  private function clearMVR() : SimpleMVRData {
    // Report Data    
    //mvr.ReportDate = Date.Today
    //mvr.ReportRequestedDate = Date.Today
    mvr.YearsRequested = 10
    mvr.AdditionalDrivers = " "
    mvr.Miscellaneous = "CLASS: D=ANY SINGLE VEH UNDER 26001 GVWR LBS, TOWED UNIT UNDER 10001 GVWR LBS STATUS: CDL=ELG-ELIGIBLE STATUS: DL=LIC-LICENSED RESTR: B=CORRECTIVE LENSES"
    mvr.ReportNumber = 1
  
    mvr.Address = "200 Princess St, San Diego, CA 22235"

    mvr.Donor = true
    mvr.Eyes = "Brown"
    mvr.Gender = "F"
    mvr.Hair = "Brunet"
    mvr.Height = "4' 10"
    mvr.Race = "W"
    mvr.SSN = "555-55-5555"
    mvr.Weight = "55 Kg"
  
    return mvr
  }
}
