package gw.coverage
uses gw.api.copy.Copier
uses gw.api.productmodel.CovTermPattern
uses gw.lang.reflect.IType
uses gw.entity.IEntityPropertyInfo
uses gw.api.domain.Clause
uses gw.api.productmodel.ClausePattern
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.ExclusionPattern
uses gw.api.productmodel.ConditionPattern
uses gw.api.productmodel.CovTermPatternLookup
uses gw.api.productmodel.CoveragePattern
uses gw.api.productmodel.ConditionPattern
uses gw.api.productmodel.ExclusionPattern

/**
 * A copier that handles copying {@link gw.api.domain.Clause} types and their associated cov term fields and values.  
 * Clause types includes:
 * <ul>
 *    <li>{@link entity.Exclusion}</li>
 *    <li>{@link entity.PolicyCondition}</li>
 *    <li>{@link entity.Coverage}</li>
 * </ul>
 */
@Export
class ClausePatternCopier extends Copier<Coverable>{

  var _source : Clause as readonly Source

  construct(clause : Clause) {
    _source = clause
  }

  override function findMatch(target : Coverable) : Clause[] {
   var pattern = _source.Pattern
   return target.hasCoverageConditionOrExclusion(pattern) ? new Clause[]{target.getCoverageConditionOrExclusion(pattern)} : null
  }
  
  /**
   * Copies the source Clause to the "target" coverable. If "target" already has a Clause 
   * with the same pattern as the source Clause then its values will be overridden; otherwise
   * a new Clause will be created. In both cases all the covterms on the source Clause will
   * be copied to the target Clause. 
   */
  override function copy(target : Coverable) {
    var matches = findMatch(target)
    var targetClause = (matches != null) ? matches.single() : target.createCoverageConditionOrExclusion(_source.Pattern)
    initializeClauseFlag(target, _source.Pattern)
    copyCovTermFields(targetClause, _source)
  }

  private function initializeClauseFlag(coverable : Coverable, pattern : ClausePattern) {
    if (pattern typeis CoveragePattern) {
      coverable.InitialCoveragesCreated = true
    } else if (pattern typeis ConditionPattern) {
      coverable.InitialConditionsCreated = true
    } else if (pattern typeis ExclusionPattern) {
      coverable.InitialExclusionsCreated = true
    }
  }

  function getCovTermValue(covTermString : String) : String {
    var covTerm = _source.getCovTerm(CovTermPatternLookup.getByCode(covTermString))
    return covTerm != null ? covTerm.DisplayValue : ""
  }
  

  private function copyCovTermFields(targetClause : KeyableBean, theSource : KeyableBean) {
    var covTermFieldNames = getCovTermFieldNames(typeof theSource)
    for (fieldName in covTermFieldNames) {
      var availFieldName = fieldName + CovTermPattern.AVAILABILITY_COLUMN_SUFFIX
      targetClause.setFieldValue(fieldName, theSource.getFieldValue(fieldName))
      targetClause.setFieldValue(availFieldName, theSource.getFieldValue(availFieldName))
    }
  }
  
  private function getCovTermFieldNames(type : IType) : String[] {
    var allPropNames = type.TypeInfo.Properties.whereTypeIs(IEntityPropertyInfo).map(\ p -> p.Name)
    return allPropNames.where(\ n -> allPropNames.contains(n + CovTermPattern.AVAILABILITY_COLUMN_SUFFIX)).toTypedArray()
  }
  
}
