package gw.rating.worksheet.domain
uses java.util.ArrayList

enhancement WorksheetOperandContainerEnhancement : gw.rating.worksheet.domain.WorksheetOperandContainer {

  /** 
   * Add a child operand to an operand container.  Properly sets the child
   * operand's parent pointer
   * 
   * @param operand The worksheet oeprand
   */
  function addWorksheetOperand(operand : WorksheetOperand){
    this.WorksheetOperands.add(operand)
    operand.Parent = this
  }


  /**
   * Add a list of child operands to a container
   * 
   * @param operands the list of operands
   * 
   */
  function addWorksheetOperands(operands : List<WorksheetOperand>){
    operands.each(\ o -> {
      addWorksheetOperand(o)        
    })
  }
  
}
