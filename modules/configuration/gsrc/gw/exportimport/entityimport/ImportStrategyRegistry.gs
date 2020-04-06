package gw.exportimport.entityimport

uses entity.KeyableBean

uses java.lang.IllegalArgumentException
uses java.lang.IllegalStateException
uses java.util.Map

/**
 * The {@linkplain EntityImportStrategy Entity Import Strategy} registry. To
 * extend the registry, add a strategy to the {@link TYPE_STRATEGY_MAP}
 * initialization keyed by the entity <code>Type</code>.
 */
@Export
class ImportStrategyRegistry {

  private construct() {
  }

  /**
   * Map of {@link EntityImportStrategy}'s by Entity <code>Type</code>.
   */
  static final var TYPE_STRATEGY_MAP : Map<Type, EntityImportStrategy> = {
    CPBuilding -> new CPBuildingImportStrategy(),
    CPLocation -> new CPLocationImportStrategy()
  }

  /**
   * Finds the {@link EntityImportStrategy} associated with given entity type.
   *
   * @param entityType The type of the entity to find a suitable strategy for
   * @return The found {@link EntityImportStrategy} if one exists. Will throw {@link IllegalStateException} if not found.
   */
  static function getStrategy(entityType : Type<KeyableBean>) : EntityImportStrategy {
    if (not EffDated.Type.isAssignableFrom(entityType)) {
      throw new IllegalArgumentException("Can only instantiate new EffDated beans.")
    }
    var strategy = TYPE_STRATEGY_MAP.get(entityType)
    if ( strategy == null ) {
      throw new IllegalStateException(
          "Missing Strategy for entity <" + entityType + ">")
    }
    return strategy
  }
}