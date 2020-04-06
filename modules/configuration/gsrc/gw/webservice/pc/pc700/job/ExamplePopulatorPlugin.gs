package gw.webservice.pc.pc700.job
uses gw.plugin.job.PopulatorPlugin

/**
 * This is an example implementation of the populator plugin when the data comming in 
 * is gx model data, using PolicyPeriodModel. Actual implementation may want to add logic
 * to the gx model and this plugin to handle line specific data.
 */
@Export
@Deprecated("Deprecated in PolicyCenter 8.0.  There is no good reason for this plugin to exist since it backs API code which is written in Gosu and customer-modifiable.  Additionally, the XML that this String data represents is created by a GX model used in the API, which is version-dependent, while the plugin is not.  If you need the same behavior as what existed in the plugin, you can inline the code from the #populatePolicyPeriod() method.")
class ExamplePopulatorPlugin implements PopulatorPlugin{

  construct() {
  }

  override function populatePolicyPeriod(period : PolicyPeriod, data : String, options : String) {
    var model = gw.webservice.pc.pc700.gxmodel.policyperiodmodel.PolicyPeriod.parse(data)
    model.$TypeInstance.populatePolicyPeriod(period)
  }

}
