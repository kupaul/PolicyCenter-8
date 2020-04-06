package gw.rating.worksheet
uses gw.pl.persistence.core.Bundle

enhancement DiagRatingWorksheetRefEnhancement : entity.DiagRatingWorksheetRef {
  function getReferencedBeanInBundle(bundle : Bundle) : EffDated {
    return bundle.add(this.Reference)
  }
}
