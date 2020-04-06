package gw.plugin.policy.impl

uses gw.lang.ReadOnly

uses gw.plugin.policy.PolicyLineVerificationPlugin
uses gw.api.productmodel.ProductModelVerificationIssue
uses gw.policy.PolicyLineConfiguration
uses gw.lang.reflect.TypeSystem
uses gw.lang.reflect.IType
uses java.lang.Exception
uses gw.api.productmodel.ProductModelClassVerificationIssue
uses gw.api.productmodel.ProductModelVerificationIssue.IssueLevel
uses java.util.Collection
uses gw.rating.rtm.util.ProductModelUtils
uses java.util.Set

@Export
class PolicyLineVerificationPluginImpl implements PolicyLineVerificationPlugin {

  override function verifyPolicyLines(): Collection<ProductModelVerificationIssue> {
    var issues : List<ProductModelVerificationIssue> = {}
    verifyInstalledPolicyLineExistsForEachPattern(issues)
    for (line in InstalledPolicyLine.getTypeKeys(false)) {
      verifyConfigurationForLine(line, issues)
    }
    return issues
  }

  private function verifyInstalledPolicyLineExistsForEachPattern(issues : Collection<ProductModelVerificationIssue>) {
    var linesByName : Set<String> = InstalledPolicyLine.getTypeKeys(false).map( \ p -> p.UnlocalizedName).toSet()
    for (lineCode in ProductModelUtils.getAllPolicyLines()) {
      if (not linesByName.contains(lineCode)) {
        issues.add(new ProductModelClassVerificationIssue(IssueLevel.ERROR,
            displaykey.ValidationError.ProductModel.PolicyLine.Configuration.MissingTypeKey(lineCode), null))
      }
    }
  }

  internal function verifyConfigurationForLine(line : InstalledPolicyLine, issues : Collection<ProductModelVerificationIssue>) {
    var className = PolicyLineConfiguration.createClassName(line)
    var foundClass : IType
    try {
      foundClass = TypeSystem.getByFullName(className)
    } catch (e : Exception) {
    }
    if (foundClass == null) {
      issues.add(new ProductModelClassVerificationIssue(IssueLevel.ERROR,
          displaykey.ValidationError.ProductModel.PolicyLine.Configuration.ClassNotFound(className), className))
      return
    }
    if (not foundClass.Valid) {
      issues.add(new ProductModelClassVerificationIssue(IssueLevel.ERROR,
          displaykey.ValidationError.ProductModel.PolicyLine.Configuration.ClassInvalid(className), className))
      return
    }
    var constructor = foundClass.TypeInfo.getCallableConstructor({})
    if (constructor == null) {
      issues.add(new ProductModelClassVerificationIssue(IssueLevel.ERROR,
          displaykey.ValidationError.ProductModel.PolicyLine.Configuration.ConstructorNotFound(className), className))
    }
    if (not (PolicyLineConfiguration.Type.isAssignableFrom(foundClass))) {
      issues.add(new ProductModelClassVerificationIssue(IssueLevel.ERROR,
          displaykey.ValidationError.ProductModel.PolicyLine.Configuration.IncorrectSupertype(className), className))
    }
  }
}
