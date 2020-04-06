package gw.account
uses gw.plugin.Plugins
uses gw.plugin.account.IAccountPlugin

/**
 * An AccountAccount entity represents a bidirectional relationship between a SourceAccount and a 
 * TargetAccount. The AccountRelationship subclasses permit an AccountAccount to be easily viewed 
 * and manipulated by either the source or target account. AccountRelationships are typically
 * created by the {@link AccountAccountEnhancement#getRelationship(Account)} method.
 */
@Export
interface AccountRelationship {
  /**
   * Returns the other account involved in the relationship. When the relationship is viewed from
   * the perspective of the SourceAccount in an AccountAccount this will return the TargetAccount, 
   * and vice versa.
   * 
   * @return the other acccount involved in the relationship.
   */
  property get OtherAccount() : Account
  /**
   * Sets the other account involved in the relationship. When the relationship is viewed from the
   * perspective of the SourceAccount in an AccountAccount this will set the TargetAccount, and 
   * vice versa.
   * 
   * @param relatedAccount the other account in the relationship to set.
   */
  property set OtherAccount(relatedAccount : Account)
  /**
   * Returns the type of relationship. This will return the RelationshipType of an AccountAccount
   * when the relationship is viewed from the perspective of the SourceAccount, and it will return
   * the inverse of the RelationshipType when the relationship is viewed from the perspective of
   * the TargetAccount. The inverse relationship type is calculated using the plugin method
   * {@link IAccountPlugin#getInverseRelationshipType(AccountRelationshipType)}.
   * 
   * @return the type of the relationship.
   */
  property get RelationshipType() : AccountRelationshipType
  /**
   * Sets the type of relationship. This will set the RelationshipType of an AccountAccount to 
   * either "type" when the relationship is viewed from the perspective of the SourceAccount, or
   * the inverse of "type" when the relationship is viewed from the perspective of the 
   * TargetAccount. The inverse relationship type is calculated using the plugin method
   * {@link IAccountPlugin#getInverseRelationshipType(AccountRelationshipType)}.
   * 
   * @param type the type of the relationship to set.
   */
  property set RelationshipType(type : AccountRelationshipType)
}
