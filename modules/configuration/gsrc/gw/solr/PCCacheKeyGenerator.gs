package gw.solr

uses gw.solr.consistency.IKeyGenerator
uses org.json.simple.JSONObject
uses java.lang.StringBuilder


@Export
class PCCacheKeyGenerator implements IKeyGenerator {

  override function createKey( docObj : JSONObject, urnTag : String ) : String {
    var sb = new StringBuilder(64)
    sb.append(docObj.get("periodID"))
    sb.append('&')
    sb.append(docObj.get("sliceDate"))
    return sb.toString()
  }

}