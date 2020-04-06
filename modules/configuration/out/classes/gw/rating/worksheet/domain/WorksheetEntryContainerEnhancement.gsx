package gw.rating.worksheet.domain

uses java.lang.StringBuilder
uses gw.xml.parser2.PLXMLNode
uses java.util.ArrayList
uses gw.rating.worksheet.WorksheetUtil

enhancement WorksheetEntryContainerEnhancement : WorksheetEntryContainer {
 
  /** 
   * @return Gosu-like string representation of the worksheet entries
   */
  function worksheetPseudoCode() : String{     
    var buffer = new StringBuilder()
    this.AllWorksheetEntries.each(\ w -> {
      w.pseudoCode(buffer, true)
      buffer.append("\n")
    })

    return buffer.toString()     
  }

  /**
   * @return Xml representation of the worksheet entries
   */
  function worksheetEntriesString() : String{
    var node = new PLXMLNode("WorksheetEntries")
    WorksheetUtil.writeEntriesXml(node, this.WorksheetEntries)
    return node.asUTFString()
  }

  /**
   * Add a worksheet entry child object.  Use this function instead of accessing the 
   * child worksheet entry array directly and adding to it as that will not properly
   * set the child object's parent reference
   * 
   * @param entry Worksheet entry
   * 
   */
  function addWorksheetEntry(entry : WorksheetEntry){
    this.WorksheetEntries.add(entry)
    entry.Parent = this
  }
  
  /**
   * Add a list of worksheet entries to the container
   * 
   * @param entries List of worksheet entries
   */
  function addWorksheetEntries(entries : List<WorksheetEntry>){
    entries.each(\ e -> {
      addWorksheetEntry(e)        
    })
  }

  /**
   * This returns a flattened list of all worksheet entries in the worksheet hierarchy in execution order.
   * Worksheet entries may be children of other entries, or even of operands, so...
   * IMPORTANT: don't use this function for copying worksheet entries
   * 
   * @return A flattened list of all worksheet entries and child-entries of those entries.  
   *
   */
  property get AllWorksheetEntries() : List<WorksheetEntry>{
    
    var list = new ArrayList<Object>()
    WorksheetUtil.recurseWorksheetHierarchy(this, list)
    return list.whereTypeIs(WorksheetEntry)
   
  }
 
  protected function addChildWorksheetNodes(parent : PLXMLNode){
    this.WorksheetEntries.each(\ e -> {
      parent.addChild(e.toXml())
    })
  }
  
    
}
