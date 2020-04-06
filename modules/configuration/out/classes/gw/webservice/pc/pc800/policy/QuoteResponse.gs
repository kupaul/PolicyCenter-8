package gw.webservice.pc.pc800.policy
uses gw.xml.ws.annotation.WsiExportable

@Export
@WsiExportable("http://guidewire.com/pc/ws/gw/webservice/pc/pc800/policy/QuoteResponse")
final class QuoteResponse {
  public var JobNumber : String
  public var Errors : String[]
  
  construct(){
  }

  construct(_jobNumber : String, _errors : String[]) {
    this()
    JobNumber = _jobNumber
    Errors = _errors
  }

}
