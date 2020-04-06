package gw.sampledata

uses gw.api.system.PCLoggerCategory
uses java.lang.RuntimeException
uses gw.sampledata.forms.AllSampleFormData
uses gw.sampledata.tiny.TinySampleContactData
uses gw.sampledata.tiny.TinySampleCommunityData
uses gw.sampledata.tiny.TinySampleRegionData
uses gw.sampledata.tiny.TinyZoneData
uses gw.sampledata.large.LargeSamplePolicyData
uses gw.sampledata.large.LargeSampleAccountData
uses gw.sampledata.small.SmallSampleAccountData
uses gw.sampledata.small.SmallSamplePolicyData
uses gw.sampledata.small.SmallSampleContactData
uses gw.sampledata.small.SmallSampleCommunityData
uses gw.sampledata.small.SmallSampleRegionData
uses gw.sampledata.small.SmallSampleReinsuranceData
uses gw.sampledata.small.SmallSampleRatingData
uses java.lang.Throwable
uses gw.sampledata.tiny.TinySampleRatingData
uses gw.sampledata.monolinejobstatus.ProductXJobStatusPolicyData
uses gw.sampledata.search.SearchSampleContactData
uses gw.sampledata.search.SearchSampleAccountData
uses gw.sampledata.search.SearchSamplePolicyData
uses gw.api.system.PLDependenciesGateway
uses gw.sampledata.large.LargeSampleArchivedPoilcyData
uses gw.api.system.PLConfigParameters
uses com.guidewire.pl.system.integration.messaging.dispatch.QPlexorForwardingProxy
uses java.lang.Exception
uses java.lang.NullPointerException

/**
 * Main static helper for loading sample data.  This should
 * NEVER be invoked in production.
 *
 * See the PolicyCenter Sample Data functional spec for further information.
 */
@Export
class SampleData
{
  private construct() { }
  
  /**
   * Loads in the given data set.  Nothing bad happens if you load the same set in twice.
   * If you load in multiple sets, the result will be the union of the sets.
   */
  public static function loadSampleDataSet(dataSet : SampleDataSet) {
    PCLoggerCategory.SAMPLE_DATA.info("Generating " + dataSet.DisplayName + " Sample Data Set...")
    if (dataSet.hasCategory(SampleDataSetCategory.TC_ADDITIVE)) {
      loadAdditiveSampleData(dataSet)
    } else {
      loadStandaloneSampleData(dataSet)
    }
    PCLoggerCategory.SAMPLE_DATA.info("Done generating " + dataSet.DisplayName + " Sample Data Set.")
  }
  
  // load the data sets that build ontop of each other (e.g. Tiny->Small->Large)
  private static function loadAdditiveSampleData(dataSet : SampleDataSet) {
    // "Tiny" set
    if (dataSet.Priority >= SampleDataSet.TC_TINY.Priority) {
      loadCollection(new TinySampleRegionData())
      loadCollection(new TinySampleCommunityData())
      loadCollection(new TinySampleContactData())
      loadCollection(new TinyZoneData())
      loadCollection(new AllSampleFormData())
      if(gw.api.system.PCConfigParameters.RatingModuleOn()) {
        loadCollection(new TinySampleRatingData())
      }
    }

    // Send Producer Codes, etc. from "Tiny" sample data to billing system
    flushMessageQueues()

    // "Small" set
    if (dataSet.Priority >= SampleDataSet.TC_SMALL.Priority) {
      loadCollection(new SmallSampleRegionData())
      loadCollection(new SmallSampleCommunityData())
      loadCollection(new SmallSampleReinsuranceData())
      loadCollection(new SmallSampleContactData())
      loadCollection(new SmallSampleAccountData())
      if(gw.api.system.PCConfigParameters.RatingModuleOn()) {
        loadCollection(new SmallSampleRatingData())
      }
      loadCollection(new SmallSamplePolicyData())
    }
    
    // "Large" set
    if (dataSet.Priority >= SampleDataSet.TC_LARGE.Priority) {
      loadCollection(new LargeSampleAccountData())
      loadCollection(new LargeSamplePolicyData())
      if (PLConfigParameters.ArchiveEnabled.getValue()) {
        loadCollection(new LargeSampleArchivedPoilcyData())
      } else {
        PCLoggerCategory.SAMPLE_DATA.info("Archiving is not enabled.  Skipping loading of Large Archived Policies Sample Data Set.")
      }
    }
    
    // "Product x Job Status" set
    if (dataSet.Priority >= SampleDataSet.TC_PRODUCTXJOBSTATUS.Priority) {
      loadCollection(new ProductXJobStatusPolicyData())
    }
  }
  
  private static function loadStandaloneSampleData(dataSet : SampleDataSet) {
    if (dataSet == SampleDataSet.TC_SEARCH) {
      loadAdditiveSampleData(TC_TINY) // we do depend on this one!
      flushMessageQueues() // send required data to billing system
      loadCollection(new SearchSampleContactData())
      loadCollection(new SearchSampleAccountData())
      loadCollection(new SearchSamplePolicyData())
    }
  }
  
  /**
   * Loads a given collection, using a service token to set the user as needed
   */
  internal static function loadCollection(dataCollection : AbstractSampleDataCollection) {
    var oldToken = PLDependenciesGateway.getCommonDependencies().getServiceToken()
    try {
      var user = PLDependenciesGateway.getUserFinder().findByCredentialName(dataCollection.RunAsUser)
      var token = PLDependenciesGateway.getServiceTokenManager().createAuthenticatedToken(user as Key)
      PLDependenciesGateway.getCommonDependencies().setServiceToken(token)
      if (dataCollection.AlreadyLoaded) {
        PCLoggerCategory.SAMPLE_DATA.info("  - already loaded " + dataCollection.CollectionName)
      } else {
        PCLoggerCategory.SAMPLE_DATA.info("  - loading " + dataCollection.CollectionName + "...")
        dataCollection.load()
      }
    } catch (e : Throwable) {
      throw new RuntimeException("Failed to load " + dataCollection.CollectionName + " sample data", e)  
    } finally {
      PLDependenciesGateway.getCommonDependencies().setServiceToken(oldToken)
    }
  }

  public static function flushMessageQueues() {
    try {
      new QPlexorForwardingProxy().flushQPlexor() // send to billing system if necessary
    } catch(npe: NullPointerException) {
      // expected
    } catch(e: Exception) {
      PCLoggerCategory.SAMPLE_DATA.info("Exception occurred when trying to flush message queue after loading sample data: " + e.toString())
    }
  }
}

