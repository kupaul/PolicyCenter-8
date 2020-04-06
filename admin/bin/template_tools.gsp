uses com.guidewire.commons.docmgmt.template.*
uses gw.pl.logging.LoggerFactory
uses gw.pl.util.csv.CSVParser
uses gw.pl.util.DateConverterUtil
uses gw.pl.util.FileUtil
uses gw.pl.util.xml.DOMWriter
uses gw.pl.util.xml.XMLCodec
uses gw.api.document.*
uses gw.cmdline.util.TemplateToolsArgs
uses gw.lang.cli.CommandLineAccess
uses java.io.*
uses java.lang.Integer
uses java.lang.System
uses java.util.*
uses org.w3c.dom.Text
uses java.net.URL
uses gw.webservice.pc.pc800.templatetoolsapi.TemplateToolsAPI

function die(msg : String) {
    print("Operation failed!")
    print("A problem was found with one or more of the arguments you supplied:")
    print("  ${msg}")
    print("Please correct the problem and try your command again.")
    System.exit(-1)
}

function verifyFile(filename : String, argName : String) {
  var file = new File(filename)
  if(!file.exists()) {
    die("File does not exist: ${filename}")
  }
  if(file.isDirectory()) {
    die("Argument for ${argName} must be a file")
  }
}

function verifyDir(filename : String, argName : String) {
  var file = new File(filename)
  if(!file.exists()) {
    die("Directory does not exist: ${filename}")
  }
  if(!file.isDirectory()) {
    die("Argument for ${argName} must be a directory")
  }
}

function convertOneFile(oldFilename : String) {
  print("About to convert descriptor file: ${oldFilename}")
  print("  Looking for descriptor file with filename: ${oldFilename}")
  if(!oldFilename.endsWith( ".descriptor" )) {
    print("  Filenames must end in '.descriptor'; illegal filename: ${oldFilename}")
    return
  }
  doConversionForFile(oldFilename)
}

function convertDirectory(dirname : String) {
  var dir = new File(dirname)
  print("Looking for descriptor files...")
  var files = dir.list( \ d, name -> name.endsWith( ".descriptor" ) )
  print("Found ${files.length} files; starting conversions...")
  for(filename in files) {
    var absFilename = dirname + File.separator + filename
    print("Processing file: ${absFilename}")
    doConversionForFile(absFilename)
  }
}

function doConversionForFile(filename : String) {
  var toConvert = new File(filename)
  var csvFilename = filename.substring(0, filename.length - "descriptor".length) + "csv"
  var newFilename = filename + ".new"
  var newFile = new File(newFilename)
  var backupFilename = filename + ".old"
  var backupFile = new File(backupFilename)
  if(backupFile.exists()) {
    print("NOTE: Found existing backup file: ${backupFilename}, skipping conversion for template: ${filename}")
    return
  }
  var reader : Reader
  var csvReader : Reader
  var writer : Writer
  try {
    print("Checking version of source descriptor file: ${filename}")
    if(descriptorIsPre30(filename)) {
      var backup2XFilename = "${filename}.2x_old"
      print("Version is pre-3.0; preliminary conversion needed")
      print("Opening source descriptor file: ${filename}")
      reader = FileUtil.getFileReader( filename )
      print("Opening source csv file: ${csvFilename}")
      csvReader = FileUtil.getFileReader(csvFilename)
      writer = FileUtil.getFileWriter( newFilename )
      print("About to attempt conversion from 2.X format to 3.X format")
      print("FormField information will be looked for in file: ${csvFilename}")
      print("3.0 descriptor will be temporarily written to file: ${newFilename}")
      var conversionWorked = convertTemplateFrom2Xto30(reader, csvReader, writer)
      writer.flush()
      writer.close()
      if(conversionWorked) {
        print("Conversion from 2.X to 3.X format successful!")
        print("Attempting to move existing descriptor file to 2.X version backup filename: ${backup2XFilename}")
        var success = toConvert.renameTo( new File(backup2XFilename) )
        if(!success) {
          print("Rename failed! Check for directory permissions.")
          return
        }
        print("Attempting to move new descriptor file to original filename: ${filename}")
        success = newFile.renameTo( new File(filename) )
        if(!success) {
          print("Rename failed! Check for directory permissions.")
          return
        }
      } else {
        print("Could not convert descriptor: ${filename}! Source file may not be in 2.X XML format.")
        return
      }
    } else {
      print("The existing template descriptor format is backwards-compatible with descriptors from 3.0 and later, so there is no work to be done for template: ${filename}")

    }
  } catch (e : FileNotFoundException) {
    print("FileNotFoundException encountered: ${e.Message}")
    e.printStackTrace()
  } catch (e : IOException) {
    var errorString = "IOException encountered: ${e.Message}"
    if(e.Message.startsWith( "Content is not allowed in prolog" )) {
      errorString += " (A \"Content is not allowed in prolog\" error usually means that the file contains some characters before the \"<?xml\" at the beginning of the file. This is not allowed. To fix the problem, remove the extra characters, so that the file begins with \"<?xml\".)"
    }
    print(errorString)
    e.printStackTrace()
  } finally {
    if(reader != null) {
      try {
        reader.close()
      } catch (e) {}
    }
    if(csvReader != null) {
      try {
        csvReader.close()
      } catch (e) {}
    }
    if(writer != null) {
      try {
        writer.close()
        if(newFile.exists()) {
          newFile.delete()
        }
      } catch (e) {}
    }
  }
}

function descriptorIsPre30(filename : String) : boolean {
  var inXML = new XMLCodec(FileUtil.getFileReader(filename))
  return inXML.getChildElement("template-descriptor") != null
}

function convertTemplateFrom2Xto30(reader : Reader, csvReader : Reader, writer : Writer) : boolean {
  var inXML = new XMLCodec(reader)
  var descriptor = new DocumentTemplateDescriptor()
  var rootElement = inXML.getChildElement("template-descriptor")
  if(rootElement == null) {
    return false;
  }

  print("Copying top-level attributes...")
  descriptor.Templateid = rootElement.getAttribute("id")
  descriptor.registerOriginalAttributeName( "templateid", "id" )
  descriptor.Name = rootElement.getAttribute("name")
  descriptor.Description = rootElement.getAttribute("description")
  descriptor.Password = rootElement.getAttribute("password")
  descriptor.Type = rootElement.getAttribute("type")
  descriptor.setAttribute( "lob", rootElement.getAttribute("lob") )
  descriptor.setAttribute( "state", rootElement.getAttribute("state") )
  descriptor.Mimetype = rootElement.getAttribute("mime-type")
  descriptor.registerOriginalAttributeName( "mimetype", "mime-type" )
  print("Converting modified, effective, and expiration dates...")
  var dateUtil = DateConverterUtil.getSharedInstance()
  var dateModString = rootElement.getAttribute("date-modified")
  descriptor.registerOriginalAttributeName( "datemodified", "date-modified" )
  if(dateModString.HasContent) {
    print("Found modification date: ${dateModString}")
    descriptor.setDatemodified( dateUtil.convertStringToDate(dateModString) )
  } else {
    descriptor.setDatemodified(null)
  }
  var dateEffString = rootElement.getAttribute("date-effective")
  descriptor.registerOriginalAttributeName( "dateeffective", "date-effective" )
  if(dateEffString.HasContent) {
    print("Found effective date: ${dateEffString}")
    descriptor.setDateeffective( dateUtil.convertStringToDate(dateEffString) )
  } else {
    descriptor.setDateeffective(null)
  }
  var dateExpString = rootElement.getAttribute("date-expires")
  descriptor.registerOriginalAttributeName( "dateexpires", "date-expires" )
  if(dateExpString.HasContent) {
    print("Found expiration date: ${dateExpString}")
    descriptor.setDateexpires( dateUtil.convertStringToDate(dateExpString) )
  } else {
    descriptor.setDateexpires(null)
  }
  descriptor.Keywords = rootElement.getAttribute("keywords")
  print("Converting From, To, and CC expressions to ContextObjects...")
  var defaultFromExpression = rootElement.getAttribute("def-from-expr")
  var fromObj = new ContextObject()
  fromObj.Name = "From"
  fromObj.Type = "Contact"
  var fromDefault = new DefaultObjectValue()
  if(defaultFromExpression.HasContent) {
    print("Found value for From: ${defaultFromExpression}")
    fromDefault.addText(defaultFromExpression)
  }
  fromObj.addChild(fromDefault)
  var possibleFromValues = new PossibleObjectValues()
  possibleFromValues.addText("Claim.getRelatedUserContacts()")
  fromObj.addChild(possibleFromValues)
  descriptor.addChild(fromObj)

  var defaultToExpression = rootElement.getAttribute("def-to-expr")
  var toObj = new ContextObject()
  toObj.Name = "To"
  toObj.Type = "Contact"
  var toDefault = new DefaultObjectValue()
  if(defaultToExpression.HasContent) {
    print("Found value for To: ${defaultToExpression}")
    toDefault.addText(defaultToExpression)
  }
  toObj.addChild(toDefault)
  var possibleToValues = new PossibleObjectValues()
  possibleToValues.addText("Claim.getRelatedContacts()")
  toObj.addChild(possibleToValues)
  descriptor.addChild(toObj)

  var ccList = rootElement.getElementsByTagName("cc")
  if(ccList.Length > 0) {
    for(i in 0..|ccList.Length) {
      var node = ccList.item(i)
      var ccObj = new ContextObject()
      ccObj.Name = "CC${i == 0 ? "" : i}"
      ccObj.Type = "Contact"
      var ccDefault = new DefaultObjectValue()
      var ccValue = (node.getChildNodes().item(0) as Text).getData()
      print("Found value for CC: ${ccValue}")
      ccDefault.addText(ccValue)
      ccObj.addChild(ccDefault)
      var possibleValues = new PossibleObjectValues()
      possibleValues.addText("Claim.getRelatedContacts()")
      ccObj.addChild(possibleValues)
      descriptor.addChild(ccObj)
    }
  } else {
    var ccObj = new ContextObject()
    ccObj.Name = "CC"
    ccObj.Type = "Contact"
    var ccDefault = new DefaultObjectValue()
    ccObj.addChild(ccDefault)
    var possibleValues = new PossibleObjectValues()
    possibleValues.addText("Claim.getRelatedContacts()")
    ccObj.addChild(possibleValues)
    descriptor.addChild(ccObj)
  }
  print("Creating default FormFieldGroup...")
  var formFields = new FormFieldGroup()
  formFields.Name = "default"
  var csvParser = new CSVParser(csvReader)
  try {
    addFieldsFromCSVLines(csvParser, Collections.singletonMap<String, FormFieldGroup>("default", formFields))
  } catch (e) {
    print("Error encountered reading the csv file for this template. The form fields could not be imported. A common cause of this error is Gosu values in the csv file which span multiple lines.")
    return false
  }
  descriptor.addChild(formFields)

  print("Writing new descriptor out...")
  var doc = DOMWriter.create()
  var rootNode = descriptor.createNode(doc)
  doc.appendChild(rootNode)
  DOMWriter.write(doc, writer, true)
  print("Done with conversion")

  return true;
}

function addFieldsFromCSVLines(csvParser : CSVParser, formFieldGroupsMap : Map<String, FormFieldGroup>) {
  var fieldList = new ArrayList<FormField>()
  print("Reading FormFields...")
  if(formFieldGroupsMap.size() == 0) {
    throw "No FormFieldGroups found! At least one FormFieldGroup must exist."
  }
  csvParser.nextLine()
  while(csvParser.hasMoreValues()) {
    var name = csvParser.nextString()
    if(name.HasContent) {
      var field = new FormField()
      field.Name = name
      fieldList.add(field)
    }
  }
  var fieldIterator = fieldList.iterator()
  if(csvParser.hasMoreLines()) {
    csvParser.nextLine()
    while(csvParser.hasMoreValues() && fieldIterator.hasNext()) {
      var field = fieldIterator.next()
      field.addText(csvParser.nextString())
    }
  } else {
    print("Could not find field values! Original CSV seems to be incorrectly formatted.")
  }

  var defaultGroup = formFieldGroupsMap.values().first()
  if(csvParser.hasMoreLines()) {
    csvParser.nextLine()
    fieldIterator = fieldList.iterator()
    while(csvParser.hasMoreValues() && fieldIterator.hasNext()) {
      var field = fieldIterator.next()
      var groupName = csvParser.nextString()
      if(!groupName.HasContent) {
        print("No group name found for field: ${field.Name}; adding to the default group.")
        defaultGroup.addChild(field)
      } else {
        var fieldGroup = formFieldGroupsMap[groupName]
        if(fieldGroup == null) {
          print("Field ${field.Name} referenced non-existent group: ${groupName}; adding to the default group.")
          defaultGroup.addChild(field)
        } else {
          print("Adding field ${field.Name} to group ${groupName}")
          fieldGroup.addChild(field)
        }
      }
    }
  } else {
    print("No field to fieldGroup mapping found, adding all fields to the default group.")
    fieldList.each(\field -> defaultGroup.addChild(field))
  }

  if(csvParser.hasMoreLines()) {
    csvParser.nextLine()
    fieldIterator = fieldList.iterator()
    while(csvParser.hasMoreValues() && fieldIterator.hasNext()) {
      var field = fieldIterator.next()
      var prefix = csvParser.nextString()
      if(prefix.HasContent) {
        field.setPrefix( prefix )
      }
    }
  }

  if(csvParser.hasMoreLines()) {
    csvParser.nextLine()
    fieldIterator = fieldList.iterator()
    while(csvParser.hasMoreValues() && fieldIterator.hasNext()) {
      var field = fieldIterator.next()
      var suffix = csvParser.nextString()
      if(suffix.HasContent) {
        field.setSuffix( suffix )
      }
    }
  }
}

LoggerFactory.configureDefault()

print( "Running ${CommandLineAccess.getCurrentProgram().Name}" )

//Initialize the args class for this program
CommandLineAccess.initialize( TemplateToolsArgs )

//New up a maintenance soap service
var config = new gw.xml.ws.WsdlConfig()
config.ServerOverrideUrl = new URL(TemplateToolsArgs.Server + "/ws/gw/webservice/pc/pc800/TemplateToolsAPI").toURI()
config.Guidewire.Authentication.Username = TemplateToolsArgs.User
config.Guidewire.Authentication.Password = TemplateToolsArgs.Password
var api = new TemplateToolsAPI( config );
print( "Connecting as ${config.Guidewire.Authentication.Username} to URL ${config.ServerOverrideUrl}" )

var workingDir = ""
if(TemplateToolsArgs.WorkingDir != null) {
  var dirname = TemplateToolsArgs.WorkingDir.trim()
  var dir = new File(dirname)
  if(!dir.exists()) {
    throw "Directory does not exist: ${dirname}"
  }
  if(!dirname.endsWith( File.separator )) {
    dirname += File.separator
  }
  workingDir = dirname
}

if(TemplateToolsArgs.ConvertFile != null) {
  var filename = workingDir + TemplateToolsArgs.ConvertFile.trim()
  verifyFile(filename, "filename")
  convertOneFile(filename)
} else if(TemplateToolsArgs.ConvertDir != null) {
  var dirname = TemplateToolsArgs.ConvertDir.trim()
  verifyDir(dirname, "dirname")
  convertDirectory(dirname)
} else if(TemplateToolsArgs.ImportFiles != null) {
  print("${TemplateToolsArgs.ImportFiles[0]} ${TemplateToolsArgs.ImportFiles[1]} ${TemplateToolsArgs.ImportFiles[2]}")
  var objFilename = workingDir + TemplateToolsArgs.ImportFiles[0]
  verifyFile(objFilename, "ctxObjsFilename")
  var groupsFilename = workingDir + TemplateToolsArgs.ImportFiles[1]
  verifyFile(groupsFilename, "fieldGroupsFilename")
  var fieldFilename = workingDir + TemplateToolsArgs.ImportFiles[2]
  verifyFile(fieldFilename, "fieldFilename")
  var descriptorFilename = fieldFilename.substring(0, fieldFilename.length - ".csv".length) + ".descriptor"
  verifyFile(descriptorFilename, "fieldFilename")
  var descriptor = new File(descriptorFilename)
  var results = api.importFormFields(new File(objFilename).read(), new File(groupsFilename).read(), new File(fieldFilename).read(), descriptor.read())
  if(results.FileContents != null) {
    descriptor.write(results.FileContents)
  }
  print(results.Output)
} else if(TemplateToolsArgs.ImportDir != null) {
  var objFilename = workingDir + TemplateToolsArgs.ImportDir[0]
  verifyFile(objFilename, "ctxObjsFilename")
  var groupsFilename = workingDir + TemplateToolsArgs.ImportDir[1]
  verifyFile(groupsFilename, "fieldGroupsFilename")
  var fieldDirname = TemplateToolsArgs.ImportDir[2]
  verifyDir(fieldDirname, "dirname")
  for(fieldFilename in new File(fieldDirname).list(\ f, n -> n.endsWith(".csv"))) {
    var descriptorFilename = fieldFilename.substring(0, fieldFilename.length - ".csv".length) + ".descriptor"
    verifyFile(descriptorFilename, "fieldFilename")
    var descriptor = new File(descriptorFilename)
    var results = api.importFormFields(new File(objFilename).read(), new File(groupsFilename).read(), new File(fieldFilename).read(), descriptor.read())
    if(results.FileContents != null) {
      descriptor.write(results.FileContents)
    }
    print(results.Output)
  }
} else if(TemplateToolsArgs.ValidateTemplate != null) {
  var result = api.validateDocumentTemplate( TemplateToolsArgs.ValidateTemplate )
  if(result != null) {
    print(result)
  }
} else if(TemplateToolsArgs.ValidateAll) {
  var result = api.validateAllDocumentTemplates()
  if(result != null) {
    print(result)
  }
} else if(TemplateToolsArgs.ListTemplates) {
  print(api.listDocumentTemplates())
} else {
  CommandLineAccess.showHelp(TemplateToolsArgs)
}
