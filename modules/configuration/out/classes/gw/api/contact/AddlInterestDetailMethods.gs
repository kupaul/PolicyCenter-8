package gw.api.contact

uses gw.api.domain.Clause
uses gw.policy.PolicyLineValidation
uses gw.validation.PCValidationContext
uses java.util.Date

/**
 * This interface defines all the methods that can be overridden by subtypes of the AddlInterestDetail class.  All
 * subtypes must define a delegate using this interface and some detail-specific implementation class,
 * probably one that extends the AddlInterestDetailMethodsDefaultImpl class.
 */
@Export
interface AddlInterestDetailMethods extends gw.api.contact.AddlInterestDetailJavaMethods {
  override function addlInterestDetailRemoved()
}