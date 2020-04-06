package gw.losshistory

uses com.guidewire.pl.system.integration.plugins.PluginException
uses gw.api.system.PLDependenciesGateway
uses gw.api.util.DisplayableException
uses gw.pl.util.webservices.RemoteLoginException
uses gw.plugin.claimsearch.ClaimSearchSpec
uses gw.plugin.claimsearch.IClaimSearchCriteria
uses gw.plugin.claimsearch.IClaimSearchPlugin
uses org.apache.axis.AxisFault

uses java.io.Serializable
uses java.lang.RuntimeException
uses java.net.ConnectException
uses java.rmi.RemoteException
uses java.util.List

@Export
class ClaimSearchCriteria implements IClaimSearchCriteria, Serializable {

  private var plugin : IClaimSearchPlugin
  var _policyNumbers : String[] as PolicyNumbers
  var _policy : Policy as Policy
  var _account : Account as Account
  var _contact : Contact as Contact
  var _dateCriteria : DateCriteria as DateCriteria

  construct() {
    _dateCriteria = new DateCriteria()
    plugin = PLDependenciesGateway.getPluginConfig().getPlugin(IClaimSearchPlugin)
  }

  property get PolicyNumber() : String {
    return ( _policyNumbers == null ) || ( _policyNumbers.Count > 1 )
        || ( _policyNumbers.Count == 0 )
      ? null : _policyNumbers[0]
  }

  property set PolicyNumber(newPolicyNumber : String) {
    _policyNumbers = {newPolicyNumber}
  }

  override function performSearch() : ClaimSet {
    try {
      return plugin.searchForClaims(this)
    } catch(e: PluginException ) {
      throw new DisplayableException(displaykey.Java.Policy.Claims.NoPluginConfigured, e)
    }  catch(e: RemoteLoginException  ) {
      throw new DisplayableException(displaykey.Java.Policy.Claims.RemoteLoginFailed, e)
    } catch ( e : AxisFault) {  // not sure if we still need this
      var cause = e.getCause()
      if (cause typeis  PluginException){
        throw new DisplayableException(displaykey.Java.Policy.Claims.NoPluginConfigured, e)
      } else if (cause typeis RemoteLoginException){
        throw new DisplayableException(displaykey.Java.Policy.Claims.RemoteLoginFailed, e)
      } else if (cause typeis ConnectException){
        throw new DisplayableException(displaykey.Java.Policy.Claims.NoConnection, e)
      }
      throw new RuntimeException(e)
    }
    catch ( e : RemoteException) {
      throw new RuntimeException(e)
    }
  }

  /**
   * Returns a list of specs to pass to the remote claim system.  The main information required
   * for the specs is a set of policy numbers for the relevant date range to search.
   * Examines the possible inputs to determine what policy numbers are relevant.  For any given
   * policy, there may be multiple numbers to search on.  For example, if a suffix is added on
   * each renewal (e.g. policy # HO-12345 becomes HO-12345R1 on first renewal), we would want to
   * search on both policy numbers to find matching claims.  So this method generally first
   * attempts to find relevant policies, based on the entered search criteria, and then finds
   * relevant policy numbers for those policies based on the date range.
   */
  override property get SearchSpecs() : List<ClaimSearchSpec> {
    var spec = new ClaimSearchSpec()
    spec.PolicyNumbers = {}
    spec.DateRange = this.DateCriteria.DateRangeToSearch
    
    if (this.PolicyNumber != null) {
      this.Policy = entity.Policy.finder.findPolicyByPolicyNumber(this.PolicyNumber)
      if (this.Policy == null) {
        // Not found.  Return the policy number
        spec.PolicyNumbers = {this.PolicyNumber}
        return {spec}
      }
    }

    if ( ( this.PolicyNumbers != null ) && ( this.PolicyNumbers.Count > 1 ) ) {
      spec.PolicyNumbers = this.PolicyNumbers
    } else if (this.Policy != null) {
      spec.PolicyNumbers = this.Policy.findUniquePolicyNumbers(spec.DateRange) as java.lang.String[]
    } else if (this.Account != null) {
      spec.PolicyNumbers = this.Account.Policies.flatMap(\ p -> p.findUniquePolicyNumbers(spec.DateRange)).toSet().toTypedArray()      
    } else if (this.Contact != null) {
      spec.PolicyNumbers = this.Contact.PolicyPeriods*.PolicyNumber.toSet().toTypedArray()
    }

    return {spec}
  }
}