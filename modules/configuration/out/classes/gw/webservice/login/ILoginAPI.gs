package gw.webservice.login

uses gw.api.webservice.exception.LoginException
uses gw.api.webservice.exception.PermissionException
uses gw.api.webservice.exception.SOAPException
uses gw.api.webservice.WSRunlevel;
uses gw.api.webservice.login.LoginAPIHelper;
uses java.lang.Throwable
uses java.lang.SuppressWarnings

/**
* <p>
* A remote interface that allows a user to log in and out of a system. The system uses conversations to implement SOAP
* authentication in a Guidewire application  (e.g. BillingCenter, ClaimCenter, PolicyCenter). When connecting to Guidewire
* applications the caller must first authenticate using the <code>ILoginAPI.login()</code> method.  This method returns the
* the session ID of the server session.
* </p>
* <p>
* On each successive call in the conversation, pass the session ID in the SOAP header
* {@link gw.pl.util.webservices.Globals#GW_AUTHENTICATION_SECURITY_TOKEN_CONTEXT_PROPERTY}. You must call
* <code>logout()</code> when you are done with the conversation.
*</p>
*<p><b>NOTE:</b> This API is intended for users who are using Guidewire's web services from languages other
* than Java.   If you are using Java, you should use the <code>APILocator</code> instead.
* </p>
*/
@RpcWebService(WSRunlevel.SHUTDOWN, {})
@Deprecated("Use WS-I webservice gw.wsi.pl.LoginAPI instead.")
@SuppressWarnings("deprecation")
@Export
class ILoginAPI {
  
  /**
   * Logs the user into a Guidewire application (e.g. ClaimCenter, PolicyCenter, BillingCenter). Returns the session ID
   * of the server session.
   *
   * @param userName The user name to authenticate.
   * @param password The password to authenticate with.
   * @return A valid session ID.
   */
  @Throws(LoginException, "if the user cannot be authenticated.")
  @Throws(SOAPException, "")
  public function login(userName : String, password : String) : String{
    return LoginAPIHelper.login( userName, password)
  }

  /**
   * Logs the user out of the session.  The session will timeout if this method is not called.
   *
   * @param sessionID the session ID of the server session.
   */
  @Throws(SOAPException, "")
  public function logout(sessionID : String){
    LoginAPIHelper.logout( sessionID )
  }

  /**
   *<p>
   * Logs the user in preparation for a Web Service Security (WSS) conversation. A WSS conversation is one in which
   * user credentials are passed using the WSS <code>UsernameToken</code> profile.
   * </p><p>
   * <b>NOTE:</b> The Guidewire Toolkit does not currently support this method. This method is available
   * for access by all other SOAP clients.
   * </p>
   */
  @Throws(LoginException, "if the user cannot be authenticated or was denied access for some reason.") 
  @Throws(SOAPException, "")
  public function WSSLogin(userName : String, password : String): String {
      return LoginAPIHelper.WSSLogin( userName, password )
  }              

  /**
   * Terminates a WSS conversation. Attempts to log out a user not logged in are siltently ignored.
   * <p/>
   * NOTE: Usage of this method by the Guidewire Toolkit is not currently supported. This is available
   * for access by all other SOAP clients.
   */   
  @RpcWebServiceMethod({SystemPermissionType.TC_SOAPADMIN})
  @Throws(SOAPException, "")
  @Throws(PermissionException, "If the user does not have sufficient permissions")
  public function WSSLogout(userName : String){
    try {
      LoginAPIHelper.WSSLogout( userName ) 
    } catch (e : Throwable){
      //Catch and wrap a InsufficientPermissionException with a PermissionException
      if (typeof e.Cause == com.guidewire.pl.system.exception.InsufficientPermissionException){
        throw new PermissionException(e.Message) 
      } else {
        throw e
      }
    }
  }
}
