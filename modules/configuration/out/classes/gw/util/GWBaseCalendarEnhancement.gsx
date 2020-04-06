package gw.util
uses java.util.Calendar
uses gw.api.util.DateUtil

enhancement GWBaseCalendarEnhancement : java.util.Calendar
{
 static function isLeapYear(yearToCheck : int) : boolean {
   var firstDate = "01/01/" + yearToCheck
   var secondDate = "01/01/" +(yearToCheck +1)
   var daysBetween = DateUtil.daysBetween(firstDate as java.util.Date, secondDate as java.util.Date)
   return daysBetween == 366
 }
}


