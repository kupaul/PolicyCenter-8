package gw.web.productmodel
uses gw.api.web.productmodel.*
uses java.lang.IllegalArgumentException
uses java.lang.Comparable

/**
 * Base class for wrappers around the various ProductModelSyncIssues class.  The wrappers serve to add in severity and
 * display information, as well as methods indicating whether the issues should be fixed automatically and whether
 * or not they should be displayed in the UI.
 */
@Export
abstract class ProductModelSyncIssueWrapper<T extends gw.api.web.productmodel.ProductModelSyncIssue> implements Comparable<ProductModelSyncIssueWrapper> {
  var _issue : T
  
  construct(myIssue : T) {
    _issue = myIssue
  }
  
  /**
   * The severity of the issue.  This is used by the Icon property to determine what icon to display, as well as for
   * purposes of sorting the issues.  Note that in many cases the severity of the issue will depend on factors such
   * as whether or not the issue has been automatically fixed or properties of the underlying pattern associated
   * with the issue.
   */
  abstract property get Severity() : ProductModelSyncIssueSeverity
  
  /**
   * The formatted message, with a prefix for the name of the owning entity and a suffix with the applicable
   * slice date, in the case of an OOS change.
   */
  final property get Message() : String {
    return _issue.createMessage(BaseMessage)
  }

  /**
   * The message associated with this issue, without any prefix or suffix
   */
  abstract property get BaseMessage() : String
  
  /**
   * Whether or not this issue should be fixed as part of a normal call to one of the sync methods, which are
   * generally called from the UI as part of entering a page or after making certain types of changes.
   */
  abstract property get ShouldFixDuringNormalSync() : boolean
  
  /**
   * Whether or not this issue should be displayed as part of a normal call to one of the sync methods, which are
   * generally called from the UI as part of entering a page or after making certain types of changes.
   */
  abstract property get ShouldDisplayDuringNormalSync() : boolean
  
  /**
   * Whether or not this issue should be fixed as part of a sync that takes place during the quoting process.
   */
  abstract property get ShouldFixDuringQuote() : boolean
  
  /**
   * Whether or not this issue should be displayed if it occurs during the quoting process.
   */
  abstract property get ShouldDisplayDuringQuote() : boolean
  
  /**
   * Returns the wrapped ProductModelSyncIssue object, which allows for access to the things like the
   * associated entity and pattern.
   */
  property get Issue() : T { return _issue }
  
  /**
   * Whether or not this issue should prevent the user from quoting.  By default, this is true if the
   * issue is of severity level ERROR.
   */
  property get ShouldBlockQuote() : boolean { return Severity == ERROR }
  
  /**
   * Issues are sorted first by severity, then by which entity they issue applies to, and lastly by the text of the actual error message.
   */
  override function compareTo(otherIssue : ProductModelSyncIssueWrapper) : int {
    var result = Severity.compareTo( otherIssue.Severity )
    if (result != 0) {
      return result
    }
    
    result = Issue.OwningEntityDisplayName.compareTo(otherIssue.Issue.OwningEntityDisplayName)
    if (result != 0) {
      return result  
    }
    
    return Message.compareTo(otherIssue.Message)
  }
  
  /**
   * Wraps a given ProductModelSyncIssue in the appropriate ProductModelSyncIssueWrapper class.
   */
  static function wrapIssue(issue : ProductModelSyncIssue) : ProductModelSyncIssueWrapper {
    switch(typeof issue) {
      case MissingPolicyLineIssue: 
        return new MissingPolicyLineIssueWrapper(issue)

      case UnavailablePolicyLineIssue: 
        return new UnavailablePolicyLineIssueWrapper(issue)

      case MissingRequiredCoverageIssue: 
        return new MissingRequiredCoverageIssueWrapper(issue)
      
      case MissingSuggestedCoverageIssue:
        return new MissingSuggestedCoverageIssueWrapper(issue)
      
      case UnavailableCoverageIssue:
        return new UnavailableCoverageIssueWrapper(issue)
      
      case MissingRequiredExclusionIssue:
        return new MissingRequiredExclusionIssueWrapper(issue)

      case MissingSuggestedExclusionIssue:
        return new MissingSuggestedExclusionIssueWrapper(issue)

      case UnavailableExclusionIssue:
        return new UnavailableExclusionIssueWrapper(issue)

      case MissingRequiredConditionIssue:
        return new MissingRequiredConditionIssueWrapper(issue)

      case MissingSuggestedConditionIssue:
        return new MissingSuggestedConditionIssueWrapper(issue)

      case UnavailableConditionIssue:
        return new UnavailableConditionIssueWrapper(issue)

      case MissingCovTermIssue:
        return new MissingCovTermIssueWrapper(issue)
      
      case UnavailableCovTermIssue:
        return new UnavailableCovTermIssueWrapper(issue)
      
      case UnavailableOptionValueIssue:
        return new UnavailableOptionValueIssueWrapper(issue)
      
      case UnavailablePackageValueIssue:
        return new UnavailablePackageValueIssueWrapper(issue)

      case RetiredTypekeyValueIssue:
        return new RetiredTypekeyValueIssueWrapper(issue)
      
      case MissingModifierIssue:
        return new MissingModifierIssueWrapper(issue)
      
      case UnavailableModifierIssue:
        return new UnavailableModifierIssueWrapper(issue)
      
      case MissingRateFactorIssue:
        return new MissingRateFactorIssueWrapper(issue)
      
      case UnavailableRateFactorIssue:  
        return new UnavailableRateFactorIssueWrapper(issue)
      
      case UnavailableQuestionIssue:
        return new UnavailableQuestionIssueWrapper(issue)

      case MissingQuestionIssue:
        return new MissingQuestionIssueWrapper(issue)
        
      case UnavailableOfferingIssue:
        return new UnavailableOfferingIssueWrapper(issue)
        
      case UnavailablePolicyTermIssue:
        return new UnavailablePolicyTermIssueWrapper(issue)

      default: throw new IllegalArgumentException("No wrapper class was found for issue type " + (typeof issue))
    }
  }
  
  /**
   * Given a list of ProductModelSyncIssues, maps it to a list of ProductModelSyncIssueWrappers.
   */
  static function wrapIssues(issues : List<ProductModelSyncIssue>) : List<ProductModelSyncIssueWrapper> {
    return issues.map(\i -> wrapIssue(i))  
  }
}
