package gw.exportimport.resolver

uses gw.api.domain.covterm.CovTerm
uses gw.entity.ITypeList
uses gw.exportimport.ColumnInfo

uses java.util.Map

/**
 * A factory used to determine the {@link ColumnDataResolver} needed to resolve
 * data for a given {@link ColumnInfo} (e.g. {@link CoverageColumnDataResolver}
 * for {@link Coverage}s). To add a resolver, use {@link
 * ColumnDataResolverFactory#registerTypeResolver} or add a
 * <code>ColumnDataResolver</code> to the {@link TYPE_RESOLVER_MAP}
 * initialization keyed by <code>Type</code>.
 */
@Export
class ColumnDataResolverFactory {

  static final var _instance : ColumnDataResolverFactory as readonly Instance = new ColumnDataResolverFactory()

  /**
   * Map of ColumnDataResolver Types by Type.
   */
  static final var TYPE_RESOLVER_MAP : Map<Type, Type<ColumnDataResolver>> = {
    ITypeList -> TypeKeyColumnDataResolver,
    CovTerm -> CoverageColumnDataResolver,
    TerritoryCode -> TerritoryCodeColumnDataResolver,
    TaxLocation -> TaxLocationColumnDataResolver,
    CPClassCode -> ClassCodeColumnDataResolver
  }

  /**
   * Register a ColumnDataResolver for a specified Type.
   */
  final function registerTypeResolver(
      type : Type, resolverType : Type<ColumnDataResolver>) {
    TYPE_RESOLVER_MAP.put(type, resolverType)
 }

  function createResolver(aColumnInfo : ColumnInfo) : ColumnDataResolver {
    if (aColumnInfo.FlagsAction) {
      return new NullColumnDataResolver()
    } else if (aColumnInfo.FlagsEntityId or aColumnInfo.FlagsParentEntityId) {
      return new ExportOnlyColumnDataResolver(aColumnInfo)
    }

    var type = TYPE_RESOLVER_MAP.Keys.firstWhere(\ type ->
        ( aColumnInfo.ColumnType.isAssignableFrom(type) )
            or ( type == ITypeList and aColumnInfo.ColumnType typeis ITypeList ) )
    if ( type != null ) {
      return TYPE_RESOLVER_MAP[type].TypeInfo
        .getConstructor({ColumnInfo})
          .Constructor.newInstance({aColumnInfo}) as ColumnDataResolver
    }

    return new SimpleColumnDataResolver(aColumnInfo)
  }
}