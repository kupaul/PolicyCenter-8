package gw.util

uses gw.lang.reflect.IType

enhancement GWBaseObjectEnhancement : Object {

  /**
   * @deprecated use the 'typeof' operator instead
   */
  property get itype() : IType {
    return typeof this
  }

}