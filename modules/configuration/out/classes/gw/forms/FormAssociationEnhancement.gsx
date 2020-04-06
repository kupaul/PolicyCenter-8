package gw.forms

uses gw.entity.ILinkPropertyInfo
uses java.lang.Long

enhancement FormAssociationEnhancement : entity.FormAssociation {
  
  /**
   * Given a string property that's the name of a link column on the FormAssociation subtype
   * this object is an instance of, this method will return the value of that column as a long
   * which represents the FixedId of the entity being pointed to.  This is a shortcut for using
   * getFixedIdValue(IPropertyInfo) and should always be used for seeing what a FormAssociation points
   * to, rather than actually traversing the link.
   */
  function fixedIdValue(propName : String) : Long {
    return extractIntegerID(this.getLinkVersionList( getLinkProperty(propName)).Key.FixedId)
  }
  
  function getLinkProperty(propName : String) : ILinkPropertyInfo {
    return (typeof this).TypeInfo.getProperty( propName ) as ILinkPropertyInfo  
  }
  
  function extractIntegerID(key : gw.pl.persistence.core.Key) : Long {
    return (key == null ? null : key.Value)
  }
}
