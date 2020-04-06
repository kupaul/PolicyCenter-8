package gw.assignment

uses java.util.Set

enhancement ProducerCodeAssignmentEnhancement : ProducerCode
{
  
   /** This method will return the default group for this producer code.
  * There are a couple of strategies that the could be used:
  * Implemented the root group if no other, but others are available
  * always the root group,  never the root group (you have to throw),
  * etc.  Or this can be avoided entirely.
  */
  property get DefaultAssignmentGroup() : Group {
    var groups = (this.AllGroups as Set<Group>).where( \ g -> g.GroupType == "Producer" ).toSet()
    filterParents(groups)
    return groups.size() == 0 ? this.Organization.RootGroup : groups.iterator().next()
  }

   /** This method will return the default group for this producer code and user.
  * There are a couple of strategies that the could be used:
  * Implemented the root group if no other, but others are available
  * always the root group,  never the root group (you have to throw),
  * etc.  Or this can be avoided entirely.
  */
  function getAssignmentGroupFor(user : User) : Group {
    var groups = (this.AllGroups as Set<Group>).where( \ g -> g.GroupType == "Producer" ).toSet()
    var intersect = groups.intersect( user.AllGroups as Set<Group>)
    filterParents(intersect)
    if (intersect.size() > 0) {
      return intersect.iterator().next()
    }
    filterParents(groups)
    if (groups.size() > 0) {
      return groups.iterator().next()
    }
    return this.Organization.RootGroup
  }


  function filterParents(groups : Set<Group>) {
    var parents = groups.map( \ g -> g.Parent )
    groups.removeAll( parents ) // get the leaf groups will also remove the root group
  }
  

}
