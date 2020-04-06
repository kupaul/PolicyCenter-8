package gw.lob.pa
/**
 * User: Kuntal Paul Exavalu
 * Date: 30/9/19
 * Time: 5:06 PM
 */
class VehicleUtil {
   static function copyVehicle(vehicle : PersonalVehicle) {
     if(vehicle != null){
       var newVehicle = vehicle.copy() as PersonalVehicle
       vehicle.PALine.addToVehicles(newVehicle)
     }
   }
}

