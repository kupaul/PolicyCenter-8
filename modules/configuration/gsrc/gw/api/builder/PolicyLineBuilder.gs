package gw.api.builder

uses gw.api.databuilder.contact.PolicyAddlInsuredBuilder
uses gw.api.productmodel.IProductModelType
uses gw.entity.IArrayPropertyInfo
uses gw.entity.IEntityType

@Export
class PolicyLineBuilder<T extends PolicyLine, B extends PolicyLineBuilder<T, B>> extends PolicyLineBuilderBase<T, B> {
  construct(IEntityType : IEntityType) {
    super(IEntityType)
  }

  construct(IProductModelType : IProductModelType) {
    super(IProductModelType)
  }

  function withAdditionalInsured(addlInsuredBuilder : PolicyAddlInsuredBuilder) : B {
    addPopulator(new BuilderArrayPopulator(PolicyLine.Type.TypeInfo.getProperty("AdditionalInsureds") as IArrayPropertyInfo, addlInsuredBuilder))
    return this as B
  }
}
