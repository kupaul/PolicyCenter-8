package gw.plugin.auto.impl

uses gw.plugin.vin.IVinPlugin
uses java.util.ArrayList
uses java.util.HashMap
uses java.util.Map


@Export
class VinPlugin implements IVinPlugin {
  var COLORS = new String[] {
    "Blue", "Red", "Black", "White", "Silver", "Tan", "Dark Green", "Beige"
  }
  var makeModelsMap = new HashMap() {
    "Honda" -> new String[] { "Civic", "Accord LX", "Odyssey"},
    "Toyota" -> new String[] { "Avalon", "Camry", "Corolla", "Prius", "Sienna" },
    "Acura" -> new String[] { "RL", "RSX", "TX", "Integra" },
    "Chevrolet" -> new String[] { "Corvette", "Impala", "Malibu", "Suburban" },
    "Pontiac" -> new String[] { "Grand Prix", "GTO", "Solstice" },
    "Buick" -> new String[] { "LeSabre", "LaCrosse" },
    "Mazda" -> new String[] { "Miata", "MPV", "RX-8" }
  }
  var MAKE_MODELS: ArrayList<Map.Entry>

  public override function getVehicleInfo(vin: String): VinResult {
    if (MAKE_MODELS == null) {
      MAKE_MODELS = new ArrayList<Map.Entry>()
      MAKE_MODELS.addAll(makeModelsMap.entrySet())
    }    
    var result = new VinResult()
    var hashCode = gw.api.util.Math.and(vin.hashCode(), 2147483647/*0x7fffffff*/)
    result.Color = COLORS[hashCode % COLORS.length]
    var makeModels = MAKE_MODELS.get(hashCode % MAKE_MODELS.Count) 
    result.Make = makeModels.Key as String
    var models = makeModels.Value as String[]
    result.Model = models[hashCode % models.length]
    result.Year = 2000 + (hashCode % 6)
    return result
  }
}
