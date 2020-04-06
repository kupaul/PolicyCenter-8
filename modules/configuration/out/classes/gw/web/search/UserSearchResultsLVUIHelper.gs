package gw.web.search

@Export
class UserSearchResultsLVUIHelper {
  function getSortedGroups(user: User): Group[] {
    var groupsSet = user.AllGroups as java.util.Set <Group>
    var groupsList = new java.util.ArrayList <Group>(groupsSet)
    java.util.Collections.sort(groupsList)
    return groupsList as Group[]
  }

  function isNotLastEntry(groups: Group[], grp: Group): Boolean {
    var lastEntry= false
    var groupsLength = groups.Count
    if (groups[groupsLength - 1] == grp) {
      lastEntry = true
    }
    return !lastEntry
  }
}