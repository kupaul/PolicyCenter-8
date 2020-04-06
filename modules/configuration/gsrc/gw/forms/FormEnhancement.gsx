package gw.forms

uses gw.api.xml.XMLNode
uses java.lang.IllegalStateException
uses java.lang.Integer
uses java.util.Date
uses gw.admin.FormPatternEnhancement

enhancement FormEnhancement : entity.Form {

  /**
   * Returns the Pattern associated with this form, if any.  In the case of forms
   * inferred by the system, this will always return a non-null value.  It may, however,
   * return a null value if forms have been added outside of form inference, for example
   * as part of a callback from an issuance or rating system.
   */ 
  property get Pattern() : FormPattern {
    return FormPatternEnhancement.getByCode(this.FormPatternCode)
  }
  
  /**
   * Gets the actual text data for this form.  For performance reasons, the form data is stored
   * on a separate table, so this method does the work of loading that extra element, if it
   * exists, and then extracting out the text data.
   */
  property get FormData() : String {
    return this.FormTextData.TextData
  }
  
  /**
   * Sets the data on this form, creating the FormTextData sub-object if necessary.
   */
  property set FormData(data : String) {
    if (this.FormTextData != null) {
      throw new IllegalStateException("The data associated with a form can only be set once.  The FormTextData object is shared between all branched versions of a Form and cannot be updated.")  
    }
    
    // Do nothing if the data is null
    if (data == null) {
      return  
    }
    
    this.FormTextData = new FormTextData(this) {
      :TextData = data
    }
  }

  /**
   * Returns a parsed XMLNode for the contents of this particular form.  If this form
   * has no data associated with it or the data is XML but has no FormContent node, this
   * method will return null.  Otherwise, this method will return the FormContent node, which
   * is the node that forms generally attach their child nodes to at creation time.
   */
  property get ParsedFormContent() : XMLNode {
    var data = FormData
    if (data == null) {
      return null  
    } else {
      return XMLNode.parse(data).findFirst( \ n -> n.ElementName == "FormContent")
    }
  }

  /**
   * Returns the date on which this form became effective.
   */
  property get FormEffDate() : Date {
    if (this.InternalFormEffDate != null) {
      return this.InternalFormEffDate
    } else {
      return this.Branch.PeriodStart  
    }
  }
  
  /**
   * Returns the date on which this form stopped being effective, either because it was labeled as such
   * explicitly or because it was superseded or removed at that date.
   */
  property get FormExpDate() : Date {
    if (this.RemovedOrSuperseded) {
      return this.FormRemovalDate  
    } else if (this.InternalFormExpDate != null) {
      return this.InternalFormExpDate
    } else {
      return this.Branch.PeriodEnd
    }
  }

  /**
   * Returns the date on which this form was removed or superseded, or null if this form has never
   * been removed or superseded.  In general you won't want to call this directly; you'll either want
   * to check the RemovedOrSuperseded property or the FormExpDate property.
   */
  property get FormRemovalDate() : Date {
    if (this.RemovedOrSuperseded) {
      if (this.InternalFormRemovalDate == null) {
        return this.Branch.PeriodStart
      } else {
        return this.InternalFormRemovalDate  
      }
    } else {
      return null  
    }
  }
  
  /**
   * Returns true if this Form was ended in effective time on or prior to the given date (i.e.
   * it treats the actual expiration date as exclusive).
   */
  function isEndedBefore(date : Date) : boolean {
    return this.FormExpDate <= date
  }
  
  /**
   * Returns true if this Form's eff and exp dates overlap such that it no longer has any
   * valid range of effective time.
   */
  function isCompletelyRemoved() : boolean {
    return this.FormEffDate >= this.FormExpDate
  }

  /**
   * Returns the endorsement number of the form that this form supersedes, if any.
   */
  property get ReplacingEndorsementNumber() : Integer {
    var supersededForms = this.SupersededForms
    if (supersededForms.Count == 0) {
      return null
    } else if (supersededForms.Count == 1) {
      return supersededForms[0].TargetForm.EndorsementNumber  
    } else {
      throw new IllegalStateException("The SupersededForms array on a Form should always be of size zero or one but was of size " + supersededForms.Count)  
    }
  }

  /**
   * If this form is a removal endorsement, this will return a string of the values of all EndorsementNumber elements in the node
   * content.  If this form was produced using the GenericRemovalEndorsementForm class, the resulting string will contain all the
   * endorsement numbers of the forms to remove.  If this form is not a removal endorsement, this will give the String value of
   * the ReplacingEndorsementNumber property.
   */
  property get ReplacingEndorsementNumbersString() : String {
    if (Pattern.RemovalEndorsement) {
      var content = ParsedFormContent
      if (content == null) {
        return ""
      } else {
        return content
          .findAll( \ i -> i.ElementName == "EndorsementNumber" and i.Text != null )
          .map( \ i -> i.Text )
          .sortBy( \ s -> s as Integer )
          .join( ", " )
      }
    } else {
      return ReplacingEndorsementNumber != null ? ReplacingEndorsementNumber as String : ""
    }
  }

  function resetExistingFormIfNecessary() {
    if (this.ChangeType != null) {
      var basedOnForm = this.BasedOn
      if (basedOnForm != null) {
        this.InternalFormRemovalDate = basedOnForm.InternalFormRemovalDate
        this.RemovedOrSuperseded = basedOnForm.RemovedOrSuperseded  
      }
    }
  }

}
