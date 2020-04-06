package gw.api.web.security

uses com.guidewire.pl.system.filters.BeanBasedQueryFilter
uses gw.api.database.IQuery
uses gw.api.database.IQueryBuilder
uses gw.api.database.Query
uses gw.api.web.filter.NewQueryBasedQueryFilter
uses gw.exportimport.EntityInfo
uses gw.exportimport.EntityFlowMask
uses gw.exportimport.ExportLocaleUtil

@Export
class DataFlowMasksFilters {

  private construct() { }

  /**
   * All (null) Filter
   */
  public final static var ALL_FILTER : DataFlowMaskFilter = new All()

  public final static var TYPE_FILTER_SET : TypeFilterSet = new TypeFilterSet()

  public static final class TypeFilterSet {
    property get FilterOptions() : DataFlowMaskFilter[] {
      // get filters for entity type's sorted by name...
      var filters = EntityInfo.Registry.getRegisteredEntityTypes()
          .map(\ t -> new MaskTypeFilter(t) as DataFlowMaskFilter)
          .sortBy(\ mFilter -> mFilter as String)
      // insert All filter as first...
      filters.add(0, ALL_FILTER)

      return filters as DataFlowMaskFilter[]
    }
  }

  public static interface DataFlowMaskFilter extends BeanBasedQueryFilter {
    property get EntityType() : Type
    //necessary because unable to access selected value in toolbarfilter widget
    function filterFlowMasks() : List<EntityFlowMaskData>
  }

  /**
   * Mask filter that always returns true.
   */
  private static class All extends NewQueryBasedQueryFilter implements DataFlowMaskFilter {
    override property get EntityType() : Type {
      return null
    }

    override function applyTypedFilter(obj : KeyableBean) : boolean {
      return true
    }

    override function filterNewQuery(query : IQuery<KeyableBean>) : IQuery<EntityFlowMaskData> {
      return query as IQuery<EntityFlowMaskData>
    }

    override function filterFlowMasks() : List<EntityFlowMaskData> {
      var query = Query.make(EntityFlowMaskData)
      return query.select().toList()
    }

    override function toString() : String {
      return displaykey.Admin.DataFlowMasks.Filters.All
    }
  }

  /**
   * Mask filter restricts on EntityType.
   */
  public static class MaskTypeFilter extends NewQueryBasedQueryFilter
      implements DataFlowMaskFilter {
    var _entityType : Type as readonly EntityType

    construct(maskEntityType : Type) {
      _entityType = maskEntityType
    }

    override function applyTypedFilter(mask : KeyableBean) : boolean {
      return ( mask typeis EntityFlowMaskData ) and ( mask.EntityType == _entityType )
    }

    override function filterNewQuery(query : IQuery<KeyableBean>) : IQuery<EntityFlowMaskData> {
      var builder = query as IQueryBuilder<EntityFlowMaskData>
      builder.compare("EntityTypeName", Equals, _entityType.Name)
      return query as IQuery<EntityFlowMaskData>
    }

    override function filterFlowMasks() : List<EntityFlowMaskData> {
      var flowMasks = EntityFlowMask.getEntityFlowMaskData(_entityType)
      return flowMasks
    }

    override function toString() : String {
      return displaykey.Admin.DataFlowMasks.Filters.EntityTypeFilter(
        ExportLocaleUtil.lookupEntityTypeDisplayName(_entityType))
    }
  }
}