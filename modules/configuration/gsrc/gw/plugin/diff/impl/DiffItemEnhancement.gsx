package gw.plugin.diff.impl

enhancement DiffItemEnhancement : gw.api.diff.DiffItem
{
  // ------------------------------------------------------------- OOS Handling
  
  property get ShouldOverride() : Boolean { 
    return this.ValueMap.get("ShouldOverride") as Boolean
  }
  
  property set ShouldOverride(value : Boolean) { 
    this.ValueMap.put("ShouldOverride", value)
  }
}