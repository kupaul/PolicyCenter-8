package gw.api.heatmap
uses java.util.HashMap

@Export
class BingMap implements IHeatMapTemplate {

  var bingLocaleMap : HashMap = new HashMap<String, String>() {
    "en_AU" -> "en-AU",
    "en_CA" -> "en-CA",
    "en_GB" -> "en-GB",
    // en_NZ not available
    "en_US" -> "en-US",
    "fr_FR" -> "fr-FR",
    "ja_JP" -> "ja-JP"
  }

  /**
   * Translate the current CC locale string to a Bing Maps locale string.
   * The list of Bing supported languages is here: http://msdn.microsoft.com/en-us/library/cc469974.aspx
   *
   * @return the closest equivalent Bing locale string, or US English if no close equivalent
   */
  function getBingMapsLocale() : String {
    var locale = bingLocaleMap.get(User.util.CurrentLocale.Code) as String
    return locale != null ? locale : "en-US"
  }  

  override property get MapScriptHTML() : String {
    return "<script type=\"text/javascript\" src=\"http://ecn.dev.virtualearth.net/mapcontrol/mapcontrol.ashx?v=6.3&mkt=" + getBingMapsLocale() + "\"></script>"
  }

  override property get LoadingMessage() : String {
    return displaykey.Web.HeatMap.LoadingBingMaps
  }

  override public function renderJavaScriptTemplate(heatMap : HeatMapGenerator, mapOption : String) : String {
    return BingMapJavaScript.renderToString(heatMap, this, mapOption)
  }

  override function javaScriptFileNames() : String[] {
    return { "./resources/javascript/heatmap/BingMap.js" }
  }

}
