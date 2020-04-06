package gw.api.domain

uses java.lang.Iterable

enhancement GWBeanIterableEnhancement<T extends KeyableBean> : Iterable<T> {
  function arrays<C extends KeyableBean>(arrayProp : String) : List<C> {
    return BeanLoader.arrays<T, C>(this.toList(), arrayProp)
  }
}
