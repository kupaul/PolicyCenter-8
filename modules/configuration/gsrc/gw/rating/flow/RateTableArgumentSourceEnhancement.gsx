package gw.rating.flow

uses gw.rating.rtm.util.AvailableAttributePresenter
uses gw.rating.rtm.valueprovider.RateTableCellValueProviderFactory

enhancement RateTableArgumentSourceEnhancement : entity.RateTableArgumentSource {

  property get ArgumentSourceWrapper() : AvailableAttributePresenter {
    if (this.Root == null && this.ArgumentSource == null) {
      return null
    }
    var param = this.Parameter.Params.first()
    if (param.ValueProvider != null) {
      var valueProvider = RateTableCellValueProviderFactory.getValueProvider(param)      
      var availAttributes = valueProvider.availableAttributes(this.Parameter.LineOfBusiness, this.ArgumentSourceSet.CalcRoutineParameterSet)
      var availAttributePresenter = availAttributes.firstWhere(\ a -> a.Root == this.Root and a.Path == this.ArgumentSource)
      if (availAttributePresenter != null) {
        return availAttributePresenter  
      }
    }
    var label = this.Root.DisplayName + ((this.ArgumentSource.HasContent) ? "." + this.ArgumentSource : "")
    return new AvailableAttributePresenter(this.Root,
                                     this.ArgumentSource,
                                     this.IsModifier,
                                     label)
  }

  property set ArgumentSourceWrapper(attribute : AvailableAttributePresenter) {
    if (attribute != null) {
      this.Root = attribute.Root
      this.ArgumentSource = attribute.Path
      this.IsModifier = attribute.IsModifier
    } else {
      this.Root = null
      this.ArgumentSource = null
      this.IsModifier = false
    }
  }

}
