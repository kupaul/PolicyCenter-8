package gw.datatype.persistence

uses com.guidewire.pl.metadata.datatype2.persistence.FieldValidatorBasedVarcharPersistenceHandler
uses gw.entity.IEntityPropertyInfo
uses gw.api.util.PhoneUtil

@Export
class PhoneDataTypePersistenceHandler extends FieldValidatorBasedVarcharPersistenceHandler {

  construct(dataTypeName: String, encrypt: Boolean, trimWhitespace: Boolean, lingustic: Boolean){
    super(dataTypeName,encrypt,trimWhitespace, lingustic)


  }

  override function applicationToBean(ctx: gw.pl.persistence.core.Bean, prop : IEntityPropertyInfo, applicationValue: Object) : Object{

    //generate a stack trace if an un-normalized value is committed
    return PhoneUtil.normalize(applicationValue as String, true)
  }


}