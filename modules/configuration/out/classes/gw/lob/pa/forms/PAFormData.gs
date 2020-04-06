package gw.lob.pa.forms
uses gw.forms.FormData
uses gw.forms.FormInferenceContext
uses java.util.Set

@Export
abstract class PAFormData extends FormData {
  protected static function mapVehicles<O>(context : FormInferenceContext, 
                                           pred : block(vehicle : PersonalVehicle) : boolean, 
                                           op : block(vehicle : PersonalVehicle) : O) : Set<O> {                                                  
    return mapArrayToSet(context.Period.PersonalAutoLine.Vehicles, pred, op)  
  }
}
