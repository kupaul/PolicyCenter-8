package gw.lob.ba
uses gw.api.domain.CoverageSymbolGroupAdapter
uses gw.api.productmodel.CoverageSymbolGroupPattern
uses entity.BusinessAutoLine

@Export
class BALineCoverageSymbolGroupAdapter implements CoverageSymbolGroupAdapter
{
  var _owner : BusinessAutoLine
  
  construct(owner : BusinessAutoLine)
  {
    _owner = owner
  }

  override function getCoverageSymbolGroup(pattern : CoverageSymbolGroupPattern) : CoverageSymbolGroup
  {
    return _owner.CoverageSymbolGroups.firstWhere(\csg -> csg.Pattern == pattern)
  }

  override property get CoverageSymbolGroups() : CoverageSymbolGroup[]
  {
    return _owner.CoverageSymbolGroups
  }

  override function addCoverageSymbolGroup(group : CoverageSymbolGroup) : void
  {
    _owner.addToCoverageSymbolGroups(group)
  }

  override property get PolicyLine() : PolicyLine{
    return _owner
  }
}
