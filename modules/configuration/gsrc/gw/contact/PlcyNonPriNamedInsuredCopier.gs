package gw.contact

@Export
class PlcyNonPriNamedInsuredCopier extends AbstractPolicyContactRoleCopier<PlcyNonPriNamedInsured> {

  construct(role : PlcyNonPriNamedInsured) {
    super(role)
  }
  
  override function copyRoleSpecificFields(namedInsured : PlcyNonPriNamedInsured) {
    _bean.Relationship = namedInsured.Relationship
  }

}
