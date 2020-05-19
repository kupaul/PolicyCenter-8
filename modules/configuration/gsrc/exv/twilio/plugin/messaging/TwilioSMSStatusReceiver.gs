package exv.twilio.plugin.messaging

uses javax.servlet.http.HttpServlet
uses javax.servlet.http.HttpServletResponse
uses javax.servlet.http.HttpServletRequest
uses gw.servlet.Servlet

/**s
 * User: Kuntal Paul Exavalu
 * Date: 15/5/20
 * Time: 11:57 PM
 */
@Servlet("/sms/statuscallback")
class TwilioSMSStatusReceiver extends HttpServlet{
  override function doPost(req: HttpServletRequest, resp: HttpServletResponse) {
    resp.setContentType("application/json")
    handleRequest(req, resp)
  }

  function handleRequest(req: HttpServletRequest, resp: HttpServletResponse) {
     var messageSid = req.getParameter("MessageSid")
     var messageStatus = req.getParameter("SmsStatus")
     MessageUtil.updateMessageStatus(messageSid, messageStatus)
  }


}