package gw.api.domain

uses gw.pl.persistence.core.effdate.EffDatedVersionList
uses java.util.Map

enhancement GWEffDatedVersionListArrayEnhancement<T extends EffDatedVersionList> : T[] {
  function allVersions<V extends EffDated>(filterZeroWidth : boolean) : Map<T, List<V>> {
    return this.toList().allVersions<V>(filterZeroWidth)
  }

  function allVersionsFlat<V extends EffDated>() : List<V> {
    return this.toList().allVersionsFlat<V>()
  }

  function arrays<C extends EffDatedVersionList>(arrayProp : String) : List<C> {
    return this.toList().arrays<C>(arrayProp)
  }
}
