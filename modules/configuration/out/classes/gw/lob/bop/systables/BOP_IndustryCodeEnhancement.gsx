package gw.lob.bop.systables
uses gw.api.database.Query

enhancement BOP_IndustryCodeEnhancement : IndustryCode
{
   property get BOPClassCodes() : List<BOPClassCode>{
     var retVal = Query.make(IndustryCodeClassCode).compare(IndustryCodeClassCode#IndustryCode.PropertyInfo.Name, Equals, this).select()
     return retVal.map(\ i -> i.ClassCode)     
   }
}
