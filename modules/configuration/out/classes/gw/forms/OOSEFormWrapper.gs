package gw.forms

/**
 * Wrapper around the set of slices that represent a form.  In the normal, non-OOSE case this wrapper will always contain
 * a single slice.  In the case of an OOSE, however, this will contain the merged versions of that form, and thus
 * may contain one or more slices of the same form.
 */
@Export
class OOSEFormWrapper {

  /**
   * The set of slices
   */
  var _formSlices : List<FormData>

  construct(slices : List<FormData>) {
    _formSlices = slices
  }

  /**
   * Returns the FormPattern of the slices.  An OOSEFormWrapper is only ever created around forms that
   * have the same pattern.
   */
  property get FormPattern() : FormPattern {
    return _formSlices.get(0).Pattern
  }

  /**
   * Returns the number of slices contained by this wrapper.
   */
  property get NumSlices() : int {
    return _formSlices.Count
  }

  /**
   * Retrieves the list of slices associated with this wrapper.
   */
  property get FormSlices() : List<FormData> {
    return _formSlices
  }

}
