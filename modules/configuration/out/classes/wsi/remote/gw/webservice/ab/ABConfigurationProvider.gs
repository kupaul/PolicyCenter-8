package wsi.remote.gw.webservice.ab

uses javax.xml.namespace.QName
uses gw.xml.ws.WsdlConfig
uses gw.xml.ws.IWsiWebserviceConfigurationProvider

@Export
class ABConfigurationProvider implements IWsiWebserviceConfigurationProvider {

  override function configure( serviceName : QName, portName : QName, config : WsdlConfig )  {
    config.Guidewire.Authentication.Username = "ClientAppPC"
    config.Guidewire.Authentication.Password = "gw"
  }

}
