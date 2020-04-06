package gw.api.heatmap

/**
 * Defines methods provided by a heat map template.
 */

@Export
interface IHeatMapTemplate {

  /**
   * HTML code for loading the map control
   */
  public property get MapScriptHTML() : String

  /**
   * Message to show while loading the map control
   */
  public property get LoadingMessage() : String

  /**
   * Renders the JavaScript template for substitution into the map template.  Override this method to
   * provide different or additional JavaScript code.
   * @param heatMap the HeatMapGenerator object
   * @param mapOption option value parameter passed to the template
   * @return the rendered JavaScript code
   */
  public function renderJavaScriptTemplate(heatMap : HeatMapGenerator , mapOption : String ) : String

  /**
   * A list of JavaScript files to include with the map
   */
  public function javaScriptFileNames() : String[]
}
