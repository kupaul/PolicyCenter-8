package gw.api.domain

enhancement GWBeanArrayEnhancement<T extends KeyableBean> : T[] {
  function arrays<C extends KeyableBean>(arrayProp : String) : List<C> {
    return this.toList().arrays<C>(arrayProp)
  }
}
