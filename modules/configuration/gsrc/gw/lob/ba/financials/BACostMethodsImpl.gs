package gw.lob.ba.financials

@Export
class BACostMethodsImpl extends GenericBACostMethodsImpl<BACost>
{
  
  construct( owner : BACost )
  {
    super( owner )
  }

  override property get State() : Jurisdiction
  {
    return Cost.Jurisdiction.State
  }
}
