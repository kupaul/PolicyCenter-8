package gw.contact

uses gw.api.name.PersonNameFieldsImpl
uses gw.api.name.NameFormatter
uses gw.api.name.ContactNameFieldsImpl
uses gw.api.util.LocaleUtil
uses gw.api.name.ContactNameFields

enhancement ContactKanjiEnhancement : entity.Contact {

  /**
   * Returns the account kanji name that should be used for all the accounts where this contact is the the account holder.
   */
  property get AccountNameKanji() : String {
    var formattedName : String
    var contactNameFields : ContactNameFields
    if (this typeis Person) {
      contactNameFields = new PersonNameFieldsImpl() {
        :LastNameKanji = this.LastNameKanji,
        :FirstNameKanji = this.FirstNameKanji
      }
    } else {
      contactNameFields = new ContactNameFieldsImpl() {
        :NameKanji = this.NameKanji
      }
    }
    LocaleUtil.runAsCurrentLocale(LocaleUtil.toLocale(LocaleType.TC_JA_JP) , \ ->  {
      formattedName = new NameFormatter().format(contactNameFields, "")
    })
    return formattedName.HasContent ? formattedName : null
  }
}
