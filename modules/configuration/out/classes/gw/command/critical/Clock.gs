package gw.command.critical
uses gw.command.PCBaseCommand
uses com.guidewire.pl.quickjump.Argument
uses java.util.Date
uses com.guidewire.pl.quickjump.DefaultMethod
uses gw.date.GosuDateUtil
uses java.text.SimpleDateFormat

@Export
@DefaultMethod("today")
class Clock extends PCBaseCommand
{
  @Argument("date", "")
  function wDate() : String{
    var dateFormat = new SimpleDateFormat("MM/dd/yyyy")
    var date = dateFormat.parse(getArgumentAsString("date"))
    setDate(date)
    return "Today is: " + currentDate()
  }

  private function currentDate() : String{
    return Date.CurrentDate.ShortFormat
  }

  function addDays(numberOfDays : int){
    setDate(Date.CurrentDate.addDays( numberOfDays ))
  }

  function addMonths(numberOfMonths : int){
    setDate(Date.CurrentDate.addMonths( numberOfMonths ))
  }

  @Argument("Number of Days", "1")
  function addDays() : String
  {
    addDays( getArgumentAsInt("Number of Days") )
    return "Today is: " + currentDate()
  }

  @Argument("Number of Weeks", "1")
  function addWeeks() : String
  {
    addDays( getArgumentAsInt("Number of Weeks"))
    return "Today is: " + currentDate()
  }

  @Argument("Number of Months", "1")
  function addMonths() : String
  {
    addMonths( getArgumentAsInt("Number of Months"))
    return "Today is: " + currentDate()
  }

  function today() : String
  {
    return "Today is: " + currentDate()
  }

  function withBeginOfMonth() : String
  {
    var newDate = Date.CurrentDate.addMonths( 1 ).FirstDayOfMonth
    setDate( newDate )
    return "Today is: " + currentDate()
  }

  function withOneMoreMonth(): String
  {
    addMonths( 1 )
    return "Today is: " + currentDate()
  }

  function withOneMoreDay(): String
  {
    addDays( 1 )
    return "Today is: " + currentDate()
  }

  function withOneMoreWeek(): String
  {
    addDays( 7 )
    return "Today is: " + currentDate()
  }

  @Argument("dayOfMonth", "1")
  function withDayIs() : String
  {
    var dayOfMonth = getArgumentAsInt("dayOfMonth")
    var dayOffset = dayOfMonth - GosuDateUtil.getDayOfMonth(Date.CurrentDate)
    var newDate = Date.CurrentDate.addMonths( 1 ).addDays(dayOffset)
    setDate( newDate )
    return "Today is: " + currentDate()
  }
}
