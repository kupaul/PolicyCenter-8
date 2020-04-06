package gw.api.heatmap
uses java.lang.Exception

uses gw.lang.reflect.ReflectUtil
uses java.lang.ClassNotFoundException

/**
 * Extend from this class to create heat maps, rather than from HeatMapGeneratorBase.
 * This is in Gosu to make it easier to pass values to Javascript.
 */
@Export
class HeatMapGenerator extends HeatMapGeneratorBase {

  construct(aMapName : String) {
    super(aMapName)
  }

  // values passed directly to JavaScript
  public var popupMapElementName : String = "PopupMapButton"
  public var popupMapHeight : int = 675
  public var popupMapWidth : int = 975
  public var useKilometers : boolean = not (User.util.CurrentLocale.Code == "en_US" || User.util.CurrentLocale.Code == "en_GB")


  /**
   * Generates the HTML that appears inside the map frame by expanding the heat map template
   * with values from the HeatMapGenerator.
   *
   * @param mapOption option value parameter passed to the template
   * @return
   */
  override function renderMapTemplate(mapOption : String) : String {
    return HeatMapHTML.renderToString(this, HeatMapTemplate, mapOption)
  }
  
   
  // -----customers should not need to modify or ovveride code below this line-----
  private var _heatMapTemplate : IHeatMapTemplate as HeatMapTemplate

  /**
   * Sets the heat map template as specified by the 'HeatMapServiceTemplate'
   * configuration parameter in config.xml.
   * @return True if the setup succeeded (the template class exists), otherwise false
   */
  public function setupTemplate() : boolean {
    try {
      if (HeatMapTemplate == null) {
        HeatMapTemplate = ReflectUtil.constructGosuClassInstance(HeatMapServiceTemplateName, new Object[0]) as IHeatMapTemplate
      }
    } catch (cnfe : Exception) {
      if (cnfe typeis ClassNotFoundException)
        return false
      else
        throw cnfe
    }
    return true
  }

  /**
   * todo: move some classes out of gw.api.heatmap (those specific to cat map)
   */

}
