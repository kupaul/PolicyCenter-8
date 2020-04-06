package gw.util
uses java.lang.StringBuilder

enhancement GWBaseStringBuilderEnhancement : StringBuilder {

  /**
   * Add the given message if the condition is true.
   */  
  function appendIf(condition : boolean, string : String) : StringBuilder {
    if (condition) {
      this.append(string)
    }
    return this
  }
  
  /**
   * Add the given message if the condition is false.
   */  
  function appendUnless(condition : boolean, string : String) : StringBuilder {
    if (not condition) {
      this.append(string)
    }
    return this
  }
  
  /**
   * Add the givien content if it is not empty, in which case, a delimiter will be appended first if the buffer is not empty
   */
   function appendIfHasContent(delimiter:String, string:String) : StringBuilder {
     if (string.HasContent) {
       if (this.length() > 0) {
         this.append(delimiter)
       }
       this.append(string)
     }
     return this
   }
  
  /**
   * Returns true if buffer is empty or contains only whitespace.
   */
  function isEmpty() : boolean {
    return this.toString().trim() == ""
  }
}
