package gw.plugin.webconfig.impl
uses gw.plugin.webconfig.IPolicyCenterWebConfigPlugin

/**
 * This plugin implements a simple hard-coded version of the various Web Config properties needed by PolicyCenter.
 */

@Export
class PolicyCenterWebConfigPlugin implements IPolicyCenterWebConfigPlugin {

  var _host = "localhost"
  var _port = "8180"
  var _path = "pc/"

  /**
   * Creates the PolicyCenter URL from hard-coded host, port and path variables.  Actual implemenations may look up the
   * entire URL from a system parameter, a jvm property, a LDAP host or any other method.  This URL is used as the link-back
   * URL for PolicyCenter used in sending out external links (say to another application, or a hard link in an email).
   */
  override property get PolicyCenterURL() : String {
    return "http://${_host}:${_port}/${_path}"
  }

}
