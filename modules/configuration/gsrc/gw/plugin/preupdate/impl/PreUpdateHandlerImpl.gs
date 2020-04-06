package gw.plugin.preupdate.impl

uses gw.api.preupdate.PreUpdateContext
uses gw.plugin.preupdate.IPreUpdateHandler
uses java.util.HashSet
uses java.util.Set


@Export
class PreUpdateHandlerImpl implements IPreUpdateHandler {

  /**
   * Pre-update callback that's executed if the config parameter UseOldStylePreUpdate is set to false.
   * If so, this method should do whatever pre-updating is necessary. By default, this collects all
   * inserted and updated beans (plus Accounts and Jobs if any of their Assignments were changed),
   * then executes the pre-update logic for each one. Any exception will cause the bounding database
   * transaction to roll back, effectively vetoing the update.
   */
  override function executePreUpdate(context : PreUpdateContext) {
    var entitySet = new HashSet<KeyableBean>()

    for (bean in context.InsertedBeans) {
      addBeansToBePreUpdated(entitySet, bean)
    }

    for (bean in context.UpdatedBeans) {
      addBeansToBePreUpdated(entitySet, bean)
    }

    for (bean in entitySet) {
      DemoPreUpdateImpl.Instance.executePreUpdate(bean)
    }
  }

  protected function addBeansToBePreUpdated(entitySet : Set<KeyableBean>, bean : KeyableBean) {
    if (bean typeis EffDated) {
      // If the PreUpdateContext includes multiple slices of the same eff-dated bean, the entitySet
      // will end up with one instance of the bean sliced as of its EffectiveDate.
      entitySet.add(bean.getSliceUntyped(bean.EffectiveDate))
    } else {
      entitySet.add(bean)
    }
    if (bean typeis AccountUserRoleAssignment) {
      entitySet.add(bean.Account)
    }
    if (bean typeis JobUserRoleAssignment) {
      entitySet.add(bean.Job)
    }
  }
}
