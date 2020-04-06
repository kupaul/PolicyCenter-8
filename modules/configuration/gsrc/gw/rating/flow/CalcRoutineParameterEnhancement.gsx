package gw.rating.flow
uses gw.lang.reflect.TypeSystem
uses gw.lang.reflect.IType

enhancement CalcRoutineParameterEnhancement : entity.CalcRoutineParameter {

  property get isCoverageParam() : boolean {
    return entity.Coverage.Type.isAssignableFrom(TypeSystem.getByFullName(this.ParamType))
  }

  property get IType() : IType {
    if (this.ParamType.HasContent) {
      return TypeSystem.getByRelativeName(this.ParamType)
    } else {
      return Object
    }
  }
  
  property get isModifier() : boolean {
    return this.IType.Interfaces.contains(Modifiable)
  }
}
