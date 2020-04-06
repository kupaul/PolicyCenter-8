package gw.sampledata.forms
uses gw.api.system.PCLoggerCategory
uses gw.sampledata.forms.AbstractSampleFormData
uses gw.sampledata.forms.BASampleFormData
uses gw.sampledata.forms.BOPSampleFormData
uses gw.sampledata.forms.CPSampleFormData
uses gw.sampledata.forms.GLSampleFormData
uses gw.sampledata.forms.IMSampleFormData
uses gw.sampledata.forms.MultiLineSampleFormData
uses gw.sampledata.forms.PASampleFormData
uses gw.sampledata.forms.WCSampleFormData

/**
 * A set of form patterns for PolicyCenter's out-of-the-box product model.
 */
@Export
class AllSampleFormData extends AbstractSampleFormData {

  var _formDataCollections : AbstractSampleFormData[]

  construct() { }

  property get FormDataCollections() : AbstractSampleFormData[] {
    if (_formDataCollections == null) {
      _formDataCollections = {
        new BASampleFormData(),
        new BOPSampleFormData(),
        new CPSampleFormData(),
        new GLSampleFormData(),
        new IMSampleFormData(),
        new MultiLineSampleFormData(),
        new PASampleFormData(),
        new WCSampleFormData()
      }
    }
    return _formDataCollections
  }

  /**
   * The name of this sample data collection, for logging and debugging
   */
  override property get CollectionName() : String {
    return "All Sample Forms"
  }

  /**
   * Checks the database, returning true if this set is already loaded (and thus doesn't need reloading)
   */
  override property get AlreadyLoaded() : boolean {
    return FormDataCollections.firstWhere(\ a -> a.AlreadyLoaded) != null
  }

  /**
   * Loads the contents of this sample data set into the DB
   */
  override function load() {
    for (var formDataCollection in FormDataCollections) {
      if (formDataCollection.AlreadyLoaded) {
        PCLoggerCategory.SAMPLE_DATA.info("  - already loaded " + formDataCollection.CollectionName)
      } else {
        PCLoggerCategory.SAMPLE_DATA.info("  - loading " + formDataCollection.CollectionName + "...")
        formDataCollection.load()
      }
    }
  }

}
