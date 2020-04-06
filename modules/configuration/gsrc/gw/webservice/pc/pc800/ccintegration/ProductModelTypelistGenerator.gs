package gw.webservice.pc.pc800.ccintegration

uses gw.api.productmodel. *
uses gw.api.typelist.TypelistL10NPropertiesGateway
uses gw.xml.XMLNode

uses javax.xml.namespace.QName
uses java.io.File
uses java.io.FileOutputStream
uses java.io.IOException
uses gw.util.StreamUtil
uses java.lang.Double
uses java.util.*

@Export
class ProductModelTypelistGenerator {

  // config setting
  var mapNewCovToGeneralDamageExpo : boolean
  var foundGeneralDamageExpo = false

  // Location of files
  var dirPrior : String
  var dirNew : String
  static final var _fileCCLOBCode : String as FileCCLOBCode = "LOBCode.ttx"
  static final var _fileCCPolicyType : String as FileCCPolicyType = "PolicyType.ttx"
  static final var _fileCCCoverageType : String as FileCCCoverageType = "CoverageType.ttx"
  static final var _fileCCCoverageSubtype : String as FileCCCoverageSubtype = "CoverageSubtype.ttx"
  static final var _fileCCExposureType : String as FileCCExposureType = "ExposureType.ttx"
  static final var _fileCCCovTermPattern : String as FileCCCovTermPattern = "CovTermPattern.ttx"
  static final var _fileCCLossPartyType : String as FileCCLossPartyType = "LossPartyType.ttx"
  static final var _fileCCTypeListProperties : String as FileCCTypeListProperties = TypelistL10NPropertiesGateway.TYPELIST_LOCALIZATION_FILE
  
  static final var _inputFiles : String[] as InputFiles =
          { _fileCCLOBCode,
            _fileCCPolicyType,
            _fileCCCoverageType,
            _fileCCCoverageSubtype,
            _fileCCExposureType,
            _fileCCCovTermPattern,
            _fileCCLossPartyType }
  
  // Constants
  static final var _lobRootName : String as LobRootName = "LOBCodes" 
  static final var _policyRootName : String as PolicyRootName = "PolicyTypes" 
  static final var _covRootName : String as CovRootName = "CoverageTypes" 
  static final var _covSubRootName : String as CovSubRootName = "CoverageSubtypes" 
  static final var _expoRootName : String as ExpoRootName = "ExposureTypes" 
  static final var _covTermRootName : String as CovTermRootName = "CovTermPatterns" 
  static final var _lossPartyRootName : String as LossPartyRootName = "LossPartyTypes" 
  
  static final var _localizedtypeListMap : Map<LanguageType, Properties> as LanguageTypeListMap = new HashMap<LanguageType, Properties>()
  
  static final var _nodeNames : String[] as NodeNames =
          { _lobRootName,
            _policyRootName,
            _covRootName,
            _covSubRootName,
            _expoRootName,
            _covTermRootName,
            _lossPartyRootName }

  // Exception report
  var _exceptionFile : FileOutputStream
  var exceptionFileName = "productModelGenReport.txt"

  private construct() {
    
  }

  public construct(inputDir : String, outputDir : String, mapNewCoveragesToGeneralDamageExpo : boolean) {
    dirPrior = normalizeDirectory(inputDir)
    dirNew = normalizeDirectory(outputDir)
    
    mapNewCovToGeneralDamageExpo = mapNewCoveragesToGeneralDamageExpo
    
    validateDirectoriesAndFiles()

    _exceptionFile = new FileOutputStream(dirNew + exceptionFileName)
  }

  ///////////////////////////////////////////////////////////////////
  // This function reads the PolicyCenter product model and some of the existing ("prior") ClaimCenter typelists
  // and writes a revised set of ClaimCenter typelists.  The idea is to allow changes to be made in the PolicyCenter 
  // product model, such as adding a coverage or an entirely new LOB or PolicyType and then push those new codes 
  // over to ClaimCenter (rather than having to manually maintain the new codes in two places.  
  //
  // The system expects to read a set of existing ClaimCenter typelist files from a given "prior" directory and then 
  // a revised version of the same set of files.  The list of files is:
  // * LOBCode.ttx
  // * PolicyType.ttx
  // * CoverageType.ttx
  // * CoverageSubtype.ttx
  // * ExposureType.ttx (optional, see below)
  // * LossPartyType.ttx
  //
  // The input parameter mapNewCovToGeneralDamageExpo controls whether or not the system should link any new default 
  // coverage subtypes it creates to the General Damage exposure type.  This is convenient because a new coverage can 
  // immediately be used by CC without needing to manually create a coverage subtype or link it to a more specific 
  // exposure type in CC.  However, if there is a better exposure type to link to, then setting the default is not 
  // helpful because a user has to delete the default CoverageSubtype <--> ExposureType link before creating the correct
  // one.  Possible values:
  // * True - The system will create a revised ExposureType file and will create links to General Damage for any newly
  //   created CoverageSubtypes.
  // * False - The system will not create a revised ExposureType file at all and will not create any default links to 
  //   ExposureType for any newly created CoverageSubtypes.
  //
  // The function will preserve any data from the prior typelists that was not sourced from PolicyCenter.  This includes:
  // * Any linking between a LOBCode and a LossType (since this has to be done in CC after creating the new LOBCode
  // * Any linking of coverages to coverage subtypes and coverage subtypes to exposure types.  (This linking will 
  //   usually be done in CC after sending a new CoverageType over from PC.)
  // * Any LOBCodes, PolicyTypes, CoverageTypes that did not come from PolicyCenter (tagged with SourceSystem=PC)
  // * Any CoverageSubtypes that are linked to a non-PC CoverageType 
  // * All ExposureTypes - the only possible change to this file is to link a new CoverageSubtype to an existing ExposureType
  //
  // It is advisable to create a back-up copy of the CC typelists when running this function.  For example, if the output
  // directory is different from the input directory, then the function will not overwrite the prior typelist files.  
  // However, if you do wish to overwrite the prior files (e.g., read from and write directly to the CC config/extensions/
  // directory), this can be done safely with this function.  It reads the prior files and builds up a set of output
  // data, and only opens the files for writing at the very end.
  /////////////////////////////////////////////////////////////////////////
  public function writeCCProductModelTypelists() {
    var xml = genCCProductModelXML()
    
    // Generate the LOBCode typelist file
    writeTypelistFile(xml, _lobRootName, "LOBCode", "Line of business", dirNew + _fileCCLOBCode)
      
    // Generate the PolicyType typelist file
    writeTypelistFile(xml, _policyRootName, "PolicyType", "Types of policies", dirNew + _fileCCPolicyType)
    
    // Generate the CoverageType typelist file
    writeTypelistFile(xml, _covRootName, "CoverageType", "Type of coverage", dirNew + _fileCCCoverageType)
    
    // Generate the CoverageSubtype typelist file
    writeTypelistFile(xml, _covSubRootName, "CoverageSubtype", "Subtype of coverage, filtered by CoverageType", dirNew + _fileCCCoverageSubtype)

    // Generate the ExposureType typelist file if we are linking new coverages to general damage exposures by default
    // We should do this only if the linking was requested and we actually found the general damage exposure and did the linking.
    // Otherwise no changes were made to the ExposureType file, so there is no reason to export a new version of it.
    if (mapNewCovToGeneralDamageExpo and foundGeneralDamageExpo) {
      writeTypelistFile(xml, _expoRootName, "ExposureType", "The different types of available exposure screens, filtered by coverage type and coverage subtype", dirNew + _fileCCExposureType)
    }
    
    // Generate the CoverageType typelist file
    writeTypelistFile(xml, _covTermRootName, "CovTermPattern", "The types of coverage terms for each coverage type", dirNew + _fileCCCovTermPattern)

    // Generate the LossPartyType typelist file
    writeTypelistFile(xml, _lossPartyRootName, "LossPartyType", "Generally either first- or third-party loss", dirNew + _fileCCLossPartyType)

    // Generate localized typelist files for all locales
    writeLocalizedTypelistFiles()

    // Finish and close the exception report file
    _exceptionFile.flush()
    _exceptionFile.close()
  }
  
  
  /////////////////////////////////////////////////////////////////////////
  // This function does all of the main work to support writeCCProductModelTypelists()
  // It reads the PC product model and prior CC typelist files and generates an XML representation
  // of the data for the CC typelist files.  If it is desirable to send the data to another system rather
  // than writing it out to the typelist files, then this function provides that intermediate representation.
  /////////////////////////////////////////////////////////////////////////
  private function genCCProductModelXML() : XMLNode {
    
    // load typelist localized string files for all languages
    // expecting each typelist file to be under its own directory in the input directory
    // each locale folder is named with its language code. ex: fr or en_US
    var localeDir = new File(dirPrior).Children.where(\ f -> f.Directory)
    localeDir.each(\ f -> {
      var localeFile = f.getChild(FileCCTypeListProperties)
      if (localeFile != null) {
        var propertyFile = TypelistL10NPropertiesGateway.readFrom(localeFile)
        var language = LanguageType.get(f.Name)
        if (language != null) {
          LanguageTypeListMap.put(language, propertyFile)
        } else {
          writeExceptionReport("Warning: Language code [" + f.Name + "] could not be mapped to any language type.")
        }
      }
    })
    
    
    var root = new XMLNode("CCProductModel")
    
    // Get a map of LOBs and Products from PolicyCenter's product model.  
    var LOBProductMap = calcLOBProductMap()

    // Get a map of LOBs and LossTypes from the prior ClaimCenter LOBCode file
    // Note: The LOBCodes in this map may be trimmed codes
    var LOBLossTypeMap = calcLOBLossTypeMap()

    // Get a list of prior PC coverage subtypes and create a map of {coverage code, List[coverage subtype nodes]} from that
    // prior typelist file.  The idea is that if a coverage has already been mapped to several subtypes on the CC side
    // then we should preserve that.  Otherwise, we should generate a single default subtype for that coverage.
    // Note: The Coverage codes in this map may be trimmed codes
    var priorSubCovTypeXML = parseXMLFileSafely(dirPrior + _fileCCCoverageSubtype)
    var priorCovSubcovMap = calcCovSubcovMap(priorSubCovTypeXML)

    //*********************
    // Generate LOB Codes
    //*********************
    var LOBCodeRoot = new XMLNode(_lobRootName)
    root.addChild(LOBCodeRoot)
    
    // Create the XML Nodes for the LOBs
    for (lob in LOBProductMap.Keys) {
      localizeNameAndDescription(lob, "LOBCode", PolicyLinePattern.NAME, PolicyLinePattern.DESCRIPTION)
      var LOBNode = createTypeCodeNode(LOBCodeRoot, lob.Code, lob.Name, lob.Description)

      // Add category elements for each product that the LOB is used for
      var lobProductEntry = (LOBProductMap.get(lob) as ArrayList<gw.api.productmodel.Product>)
      if (lobProductEntry <> null) {
        for (prod in lobProductEntry) {
          createCategoryNode(LOBNode, "PolicyType", prod.Code)
        }
      }

      // Add category elements for each loss type that the LOB is associated with in CC
      // Need to use a trimmed code for the look-up because that is what the CC typelist would be using
      var lobLossEntry = (LOBLossTypeMap.get(trimTypeCode(lob.Code)) as ArrayList<String>)
      if (lobLossEntry <> null) {
        for (lossType in lobLossEntry) {
          createCategoryNode(LOBNode, "LossType", lossType)
        }
      } else {
        // If no existing Loss Type entries, then note this in the exception report because this LOB should get 
        // mapped to a loss type in CC.
        writeExceptionReport("Warning: LOB Code [" + lob.Code + "] is not mapped to any loss types.")
      }
      
      // Add a category node to indicate that this PolicyType came from PolicyCenter
      createPCSourceCategoryNode(LOBNode)
    }

    // Read in prior LOB Codes XML
    var priorLOBCodeXML = parseXMLFileSafely(dirPrior + _fileCCLOBCode)

    // Read through prior XML and add non-PC nodes to the output set
    copyAllNonPCTypecodes(LOBCodeRoot, priorLOBCodeXML)
    

    //*********************
    // Generate Policy Type Codes
    //*********************
    var PolicyTypeRoot = new XMLNode(_policyRootName)
    root.addChild(PolicyTypeRoot)

    // Read in the prior policy type XML in order to be able to reapply the internal policy type and policy tab categories
    // Note: this may contain trimmed policy type codes
    var priorPolicyTypeXML = parseXMLFileSafely(dirPrior + _fileCCPolicyType)
    //Non-pc coverage types
    //this is a map of covergae types CC says should be present
    var priorCoverageMap = new HashMap<String,List<String>>()
    for (node in priorPolicyTypeXML.Children) {
      priorCoverageMap[node.getAttributeValue("code")] = new ArrayList<String>()
      for (subnode in node.Children) {
        if (isCategoryForTypelist(subnode, "CoverageType"))
          priorCoverageMap[node.getAttributeValue("code")].add(subnode.getAttributeValue("code"))
      }
    }
        
    // Create the XML Nodes for the PolicyTypes
    for (prod in gw.api.productmodel.ProductLookup.getAll() ) {
      localizeNameAndDescription(prod, "PolicyType", Product.NAME, Product.DESCRIPTION)
      var PolicyTypeNode = createTypeCodeNode(PolicyTypeRoot, prod.Code, prod.Name, prod.Description)
      var previousCoverageTypes = priorCoverageMap[prod.Code]
      
      // Add category elements for each LOB
      for (lob in prod.LinePatterns) {
        createCategoryNode(PolicyTypeNode, "LOBCode", lob.Code)
        
        // Add category elements for each coverage on each LOB for the policy type
        for (cov in lob.CoverageCategories.flatMap(\ cat -> cat.CoveragePatterns)) {
          createCategoryNode(PolicyTypeNode, "CoverageType", cov.Code)
          if (previousCoverageTypes != null) previousCoverageTypes.remove(cov.Code) //remove anything we are getting from pc; pc is the authoriative source
        }
        
        if (previousCoverageTypes != null)
          for (code in previousCoverageTypes)
            createCategoryNode(PolicyTypeNode,"CoverageType", code)
      }
      
      // Add "Internal Policy Type" and "Policy Tab" category elements if they were in the prior PolicyType file
      for (policyNode in priorPolicyTypeXML.Children) {
        // Find the Node for this policy type.  Need to use a trimmed code because that is what would be in the CC typelist.
        if (isMatchingTypecode(policyNode, trimTypeCode(prod.Code))) {
          for (catNode in policyNode.Children) {
            // Look for any of the right category nodes and then create equivalent category nodes for the new PolicyType file
            if (isCategoryForTypelist(catNode, "PolicyTab") or 
                isCategoryForTypelist(catNode, "InternalPolicyType")) {
              createCategoryNode(PolicyTypeNode, catNode.getAttributeValue("typelist"), getCategoryCode(catNode))
            }
          }
        }
      } // End of adding extra category modes
      
      // Add a category node to indicate that this PolicyType came from PolicyCenter
      createPCSourceCategoryNode(PolicyTypeNode)
      
    }
    
    // Read through prior XML and add non-PC nodes to the output set
    copyAllNonPCTypecodes(PolicyTypeRoot, priorPolicyTypeXML)

    //*********************
    // Exposure Type
    //*********************
    var ExposureTypeRoot : XMLNode          // Will be null unless we are linking new coverages to general damage exposures
    var generalDamageExposureNode : XMLNode  // Will be null unless we are linking new coverages to general damage exposures
    
    if (mapNewCovToGeneralDamageExpo) {
      // Create the root node for the ExposureTypes
      ExposureTypeRoot = new XMLNode(_expoRootName)
      root.addChild(ExposureTypeRoot)
      
      // Copy the prior file into the structure. Since none of these will be "PC nodes", we can use the generic copy method.
      // Basically, if there are no new coverages, we will simply copy the prior to the new with no changes.  The only
      // possible change is to add new category nodes for new coverage subtypes, so all prior entries will be copied
      // to the output.
      var priorExposureTypeXML = parseXMLFileSafely(dirPrior + _fileCCExposureType)
      copyAllNonPCTypecodes(ExposureTypeRoot, priorExposureTypeXML)
      
      // Find the general damage node and set it for use later
      for (expoNode in ExposureTypeRoot.Children) {
        if (isMatchingTypecode(expoNode, "GeneralDamage")) {
          generalDamageExposureNode = expoNode
        }
      }
      
      // If General Damage node not found, write a warning to the exception report
      if (generalDamageExposureNode == null) { 
        writeExceptionReport("Warning: General damage exposure type not found, so new coverages could not be linked to it by default.")
      } else {
        foundGeneralDamageExpo = true
      }
    }


    //*********************
    // Coverage Type, Coverage Subtype, and Cov Term Pattern codes
    //*********************
    var CoverageTypeRoot = new XMLNode(_covRootName)
    root.addChild(CoverageTypeRoot)
    var CoverageSubtypeRoot = new XMLNode(_covSubRootName)
    root.addChild(CoverageSubtypeRoot)
    var CovTermPatternRoot = new XMLNode(_covTermRootName)
    root.addChild(CovTermPatternRoot)
    
    // As we look through all the coverages, keep track of a list of coverage codes that fall into either first party or third party coverage categories
    var firstPartyCovs = new ArrayList<String>()
    var thirdPartyCovs = new ArrayList<String>()
    
    // Create the XML Nodes for the CoverageTypes
    for (lob in LOBProductMap.Keys) {
      for (cov in lob.CoverageCategories.flatMap(\ cat -> cat.CoveragePatterns) ) {
        // Create a typelist node for the coverage
        var CovTypeNode = createTypeCodeNode(CoverageTypeRoot, cov.Code, cov.Name, cov.Description)

        // Save the localized strings for the coverage
        localizeNameAndDescription(cov, "CoverageType", CoveragePattern.NAME, CoveragePattern.DESCRIPTION)
        
        // Add policy type elements for each coverage based on the LOB that the coverage is part of
        for (prod in LOBProductMap.get(lob)) {
          createCategoryNode(CovTypeNode, "PolicyType", prod.Code)
        }

        // Add a category node to indicate that this Coverage came from PolicyCenter
        createPCSourceCategoryNode(CovTypeNode)

        //****************************************************
        //  Cov Term Patterns
        //****************************************************
        for (covTerm in cov.CovTerms) {
          // Create a typelist node for the CovTerm
          var CovTermNode = createTypeCodeNode(CovTermPatternRoot, covTerm.Code, covTerm.Name, covTerm.Description)
          
          // Save the localized strings for the coverage
          localizeNameAndDescription(covTerm, "CovTermPattern", CovTermPattern.NAME, CovTermPattern.DESCRIPTION)
          
          // Add a category node to identify the parent coverage
          createCategoryNode(CovTermNode, "CoverageType", cov.Code)
          
          // Add a category node to indicate that this CovTerm came from PolicyCenter
          createPCSourceCategoryNode(CovTermNode)
        }

        //****************************************************
        //  Coverage Subtypes
        //****************************************************
        // Create a list of CoverageSubtypes for this coverage
        // Need to use trimmed coverage code here because that is what the prior CC typelist would have.
        var subtypeNodes = priorCovSubcovMap.get(trimTypeCode(cov.Code))
        
        if (subtypeNodes == null) {
          // If no pre-existing subtypes, create a new default subcoverage.  By default, the coverage subtype 
          // will have exactly the same code, name, and description as the parent coverage.

          // Create category node for this coverage subtype on the parent coverage
          createCategoryNode(CovTypeNode, "CoverageSubtype", cov.Code)
            
          // Create a typelist node for the coverage subtype
          var subCovNode = createTypeCodeNode(CoverageSubtypeRoot, cov.Code, cov.Name, cov.Description)
          
          // Save the localized strings for the coverage subtype, based on the parent coverage
          localizeNameAndDescription(cov, "CoverageSubtype", CoveragePattern.NAME, CoveragePattern.DESCRIPTION)

          // Add a category node for the coverage subtype node pointing back to the parent coverage
          createCategoryNode(subCovNode, "CoverageType", cov.Code)
          
          // Add a category node to indicate that this Sub-Coverage came from PolicyCenter
          createPCSourceCategoryNode(subCovNode)

          // Depending on the settings, either link this subcoverage to the general damage exposure type by default
          // or write a warning to the exception report that it should be linked manually to an exposure type.
          // If the general damage exposure node was not found (for example, there is no input file), then do not 
          // link the coverage subtype to anything.
          if (mapNewCovToGeneralDamageExpo and generalDamageExposureNode != null) {
            // Create a category node on the coverage subtype linking to the General Damage exposure type
            createCategoryNode(subCovNode, "ExposureType", getCategoryCode(generalDamageExposureNode))
            
            // Create a category node on the General Damage exposure type node pointing to the coverage subtype
            createCategoryNode(generalDamageExposureNode, "CoverageSubtype", getCategoryCode(subCovNode))
          } else {
            // Don't create any exposure type links.  Instead, add an entry to the exception report.
            writeExceptionReport("Warning: A new default coverage subtype was created for [" + cov.Code + "].  It is not mapped to any exposure types.")
          }

          // Add the sub-coverage code to either the first party or third party list
          if (cov.CoveredPartyType=="FirstParty") {  
            firstPartyCovs.add(cov.Code)  
          } else {
            thirdPartyCovs.add(cov.Code)
          }
            
        } else {
          // For each existing coverage subtype...
          
          for (sub in subtypeNodes) {
            // Create category node for this coverage subtype on the parent coverage
            var subCode = getTypecodeCode(sub)
            createCategoryNode(CovTypeNode, "CoverageSubtype", subCode)
          
            // Copy the typecode node from the prior typelist to the output typelist 
            // This should already contain a category node to point back to the parent coverage and any category
            // nodes for pointing to exposure types.
            copyNodeFromPriorXML(CoverageSubtypeRoot, sub)

            // If the coverage subtype node being copied is not associated with any exposure types, write a warning to the 
            // exception report.
            if (!hasExposureType(sub)) {
              writeExceptionReport("Warning: Coverage subtype [" + subCode + "] is not mapped to any exposure types.")
            }

            // Add the sub-coverage code to either the first party or third party list
            if (cov.CoveredPartyType=="FirstParty") {
              firstPartyCovs.add(subCode)
            } else {
              thirdPartyCovs.add(subCode)
            }
          }
        }
        
      }  // loop over coverages
    }    // looop over LOBs

    // Read through prior XML for coverage and subcoverage and add non-PC nodes to the output sets
    var priorCovTypeXML = parseXMLFileSafely(dirPrior + _fileCCCoverageType)
    copyAllNonPCTypecodes(CoverageTypeRoot, priorCovTypeXML)
    copyAllNonPCCovSubtypes(CoverageSubtypeRoot, priorSubCovTypeXML, priorCovTypeXML)

    // Read through prior XML for cov term patterns and add non-PC nodes to the output set
    var priorCovTermPatternXML = parseXMLFileSafely(dirPrior + _fileCCCovTermPattern)
    copyAllNonPCTypecodes(CovTermPatternRoot, priorCovTermPatternXML)


    ////////////////////////////////
    // Loss Party Typelist
    ////////////////////////////////

    // For non-PC coverages, use the existing categorization of first or third party
    // The tricky part here is that we need to copy over codes only for all the non-PC coverages.  
    var priorLossPartyTypeXML = parseXMLFileSafely(dirPrior + _fileCCLossPartyType)
    var priorThirdPartyCodes = new ArrayList<String>()
    
    // Find the third party node and capture all its coverage codes in a list.  This implicitly assumes all other 
    // codes should be considered 1st party, whether or not they are already listed under that typecode.  Assuming this 
    // way is based on there being more 1st party coverages than 3rd party coverages, in general.  Plus, that means
    // the third party list should be shorter and faster to traverse repeatedly.
    for (lossparty in priorLossPartyTypeXML.Children) {
      if (isMatchingTypecode(lossparty, "third_party")) {
        foreach (covNode in lossparty.Children) {
          if (isCategoryForTypelist(covNode, "CoverageSubtype")) {
            priorThirdPartyCodes.add(getCategoryCode(covNode)) 
          }
        }
      } 
    }

    // Look through all the prior subcoverages and for all the non-PC ones, add them to either the first or third party lists
    // Note that the coverage subtype codes captured from reading the priorLossPartyTypeXML and the coverage subtypes in the
    // priorSubCovTypeXML are both trimmed codes, so no need for further trimming when comparing them.
    for (subNode in priorSubCovTypeXML.Children) {
      if(this.isPCCovSubtypeNode(subNode, priorCovTypeXML)==2) {
        var subCode = getTypecodeCode(subNode)
        if(priorThirdPartyCodes.contains(subCode)) {
          thirdPartyCovs.add(subCode)
        } else {
          firstPartyCovs.add(subCode)
        }
      }
    }

    // Create the output file root note
    var LossPartyTypeRoot = new XMLNode(_lossPartyRootName)
    root.addChild(LossPartyTypeRoot)

    // Create the first and third party typecodes based on what we've collected in the lists
    var firstPartyNode = createTypeCodeNode(LossPartyTypeRoot, "insured", "Insured's loss", "Insured's loss")
    for (code in firstPartyCovs) {
      createCategoryNode(firstPartyNode, "CoverageSubType", code)
    }
    var thirdPartyNode = createTypeCodeNode(LossPartyTypeRoot, "third_party", "Third-party liability", "Third-party liability")
    for (code in thirdPartyCovs) {
      createCategoryNode(thirdPartyNode, "CoverageSubType", code)
    }
    
    return root
  }

  public function typeListFileForLanguage(language : LanguageType) : String {
    return dirNew + language.Code + File.separator + FileCCTypeListProperties
  }

  
  // Reads the product model in order to calculate of map of how Policy Lines are used by different products.  
  // Each entry in the returned map will represent 1 LOB with a list of products that use it.
  private function calcLOBProductMap() : HashMap<gw.api.productmodel.PolicyLinePattern, List<gw.api.productmodel.Product>> {
    var LOBProductMap = new HashMap<gw.api.productmodel.PolicyLinePattern, List<gw.api.productmodel.Product>>()
    for (prod in gw.api.productmodel.ProductLookup.getAll() ) {
      for (lob in prod.LinePatterns) {
        // Look for an entry for this LOB already
        var lobEntry = (LOBProductMap.get(lob) as ArrayList<gw.api.productmodel.Product>)
        // If none, create an entry for it
        if (lobEntry == null) {
          lobEntry = new ArrayList<gw.api.productmodel.Product>()
          LOBProductMap.put(lob, lobEntry)
        }
        // Add this product to the list of products which use this LOB
        lobEntry.add(prod)
      }
    }
    
    return LOBProductMap
  }

  // The LOBCode typelist contains category elements that map to ClaimCenter's loss type codes.  The CC LossType 
  // typelist also contains category entries to point from LossType to LOBCode, making this a bi-directional relationship.
  // The idea here is to read the prior LOBCode to LossType mapping in the LOBCode file and use it to make the same
  // entries in the new LOBCode file to preserve prior links for any LOBCodes sourced from PolicyCenter. 
  // Note: a new LOB added in PC will not be mapped to any loss types initially.  This linkage will have to be added in CC
  // after generating a product model that contains that LOB and opening it up in the CC product model editor, which will 
  // then create the bi-directional links.  This code essentially preserves bi-directional links that previously have been
  // set up in CC so that they are not lost when the LOBCode typelist is regenerated from PC's product model.
  private function calcLOBLossTypeMap() : HashMap<String, List<String>> {
    var LOBLossTypeMap = new HashMap<String, List<String>>()

    // First, we need to read in the CC LOBCode typelist XML file
    var lobXML = parseXMLFileSafely(this.dirPrior + _fileCCLOBCode)

    // Loop over LOBCodes and find all the loss types for it
    for (lob in lobXML.Children) {
      var lobEntry = new ArrayList<String>()

      // Each child is an XMLNode containing 1 category element, each representing a LossType
      for (lossCat in lob.Children) {
        // Look for category elements for LOBCode and create an entry in map for each
        if (isCategoryForTypelist(lossCat, "LossType")) {
          lobEntry.add(getCategoryCode(lossCat))
        }
      }
      // Save the list of LossTypes for this LOBCode
      LOBLossTypeMap.put(getTypecodeCode(lob), lobEntry)
    }
      
    return LOBLossTypeMap
  }

  private function calcCovSubcovMap(priorXML : XMLNode) : HashMap<String, List<XMLNode>> {
    var theMap = new HashMap<String, List<XMLNode>>()
    
    // Loop over CoverageSubtypes and, if a PC subtype, add it to the list of subtypes for its coverage code
    if (priorXML <> null) {
      for (subCov in priorXML.Children) {
          for (catNode in subCov.Children) {
            // Look for category elements for parent coverage(s) (should only be one) and create an entry in map for each
            if (isCategoryForTypelist(catNode, "CoverageType")) {
              var covCode = getCategoryCode(catNode)
              var covEntry = (theMap.get(covCode) as ArrayList<XMLNode>)
              // If none, create an entry for it
              if (covEntry == null) {
                covEntry = new ArrayList<XMLNode>()
                theMap.put(covCode, covEntry)
              }
              // Add this to the list of subcoverages for this coverage
              covEntry.add(subCov)
            }
          }
      }
    }
    
    return theMap
  }

  // Encapsulates a few set-up details for creating the XML for a typelist file
  private function createTypelistRoot(name : String, desc : String) : XMLNode {
    var node = new XMLNode()
    node.setQName(new QName("http://guidewire.com/typelists", "typelistextension"))
    node.setAttributeValue("name", name)
    node.setAttributeValue("desc", desc)
    return node    
  }
  
  private function createTypeCodeNode(parent : XMLNode, code : String, name : String, desc : String) : XMLNode {
    var node = new XMLNode()
    node.setQName(new QName("http://guidewire.com/typelists", "typecode"))
    parent.addChild(node)
    node.setAttributeValue("name", name)
    node.setAttributeValue("desc", desc)
    
    // Handle cases where code field length > 50 (max allowed for a typecode)
    if (code.length() <= 50) {
      node.setAttributeValue("code", code)
    } else {
      writeExceptionReport("Warning: Code exceeds max allowed 50 characters for a typecode: [" + code + "] for typelist " 
                            + parent.ElementName + "  Code trimmed in order to map it.")
                            
      node.setAttributeValue("code", trimTypeCode(code))
    }
    
    return node
  }

  // Useful function for checking whether an XMLNode is a typecode node with a given code
  private function isMatchingTypecode(node : XMLNode, code : String) : Boolean {
    return (node.ElementName.equalsIgnoreCase("typecode") and 
            node.getAttributeValue("code").equalsIgnoreCase(code)) 
  }
  
  // Assuming this is a typecode node, get its code attribute
  private function getTypecodeCode(node : XMLNode) : String {
    return node.getAttributeValue("code") 
  }

  // Useful function for checking whether an XMLNode is a category node for a given typelist
  private function isCategoryForTypelist(node : XMLNode, typelist : String) : Boolean {
    return (node.ElementName.equalsIgnoreCase("category") and 
            node.getAttributeValue("typelist").equalsIgnoreCase(typelist))
  }
  
  // Assuming this is a typecode node, get its code attribute
  private function getCategoryCode(node : XMLNode) : String {
    return node.getAttributeValue("code") 
  }
  
  private function createCategoryNode(parent : XMLNode, typeName : String, code : String) {
    var node = new XMLNode()
    node.setQName(new QName("http://guidewire.com/typelists", "category"))
    parent.addChild(node)
    node.setAttributeValue("code", trimTypeCode(code))  // Handle cases where the code exceeds the max length
    node.setAttributeValue("typelist", typeName)
    return
  }
  
  private function createPCSourceCategoryNode(parent : XMLNode) {
    createCategoryNode(parent, "SourceSystem", "PC") 
    return
  }

  // Determines whether this node is marked as coming from PC.  It will be considered "from PC" only if we find a 
  // SourceSystem node for "PC".  That means it will be non-PC if it is marked with a different source system or 
  // it simply has no source system category.
  private function isPCNode(node : XMLNode) : boolean {  
    for (catNode in node.Children) {
      if (isCategoryForTypelist(catNode, "SourceSystem") and
          getCategoryCode(catNode).equalsIgnoreCase("PC")) {
        return true        
      }
    }
    
    return false
  }
  
  // Since coverage subtypes can (and will) be edited in CC, there is no guarantee that they are tagged with the 
  // SourceSystem=PC category to identify them as being "from PC".  A more reliable way to determine this is to find 
  // the parent coverage and see if that is a PC Node.
  // Note: this function requires comparison to a list of PC Coverage Nodes.  If we are looking at CoverageSubtypes from 
  // the prior files then we should be looking for their owning coverage in the prior coverage file, not the new coverages 
  // list.  For example, it may have been a coverage subtype on a PC coverage previously, but if that PC coverage no longer
  // exists (in the new XML) then we don't want it to be copied as if it is a non-PC subtype.  
  // There are actually 3 possible return values:
  // 0 = No matching coverage found at all (either because no Coverage category node or because coverage code not found in the coverage list
  // 1 = Found matching PC coverage
  // 2 = Found matching non-PC coverage
  // Note: We are comparing the coverage category code on a coverage subtype from a prior CC typelist file with the coverage
  // code from a CoverageType typelist XML.  Both of those values will be trimmed codes, so no need to do further trimming.
  private function isPCCovSubtypeNode(node : XMLNode, PCCovs : XMLNode) : Number {
    // Exit early if the PCCovs list is null
    if (PCCovs == null) return 0  // No match since the list to match to is empty
    
    var covCode : String
     
    // Find the cov code
    for (catNode in node.Children) {
      if (isCategoryForTypelist(catNode, "CoverageType")) {
        covCode = getCategoryCode(catNode)
      }
    }
    
    // If no cov code found, then this will return false
    if (covCode == null) {
      return 0  // no coverage code at all on the coverage subtype
    } else {
      // find the coverage node
      for (cov in PCCovs.Children) {
        if (isMatchingTypecode(cov, covCode)) {
          // Match found
          if (isPCNode(cov)) {
            return 1  // PC cov subtype
          } else {
            return 2  // PC cov subtype
          }
        }
      }
    }
       
    return 0  // No cov node match found 
  }
    
  
  // This function will look through a typelist file (priorXML) and find all the typecodes within it that are not 
  // "from PC".  parent should be an XMLNode representing the root of the output "copy to" typelist.
  private function copyAllNonPCTypecodes(parent : XMLNode, priorXML : XMLNode) {
    // Return early if there was no prior XML
    if (priorXML == null) return
    
    // Look through all the typecodes for a typelist file
    for (node in priorXML.Children) {
      if (!isPCNode(node)) {
        this.copyNodeFromPriorXML(parent, node)
      }
    }
  }

  // This function will look through a typelist file (priorXML) and find all the typecodes within it that are not 
  // "from PC".  A special version is required for coverage subtypes since we have to use a different way of checking 
  // whether they are "from PC".  
  // parent should be an XMLNode representing the root of the output "copy to" typelist.
  private function copyAllNonPCCovSubtypes(parent : XMLNode, priorXML : XMLNode, PCCovs : XMLNode) {
    // Return early if there was no prior XML
    if (priorXML == null) return

    // Look through all the typecodes for a typelist file
    for (node in priorXML.Children) {
      var match = this.isPCCovSubtypeNode(node, PCCovs)
      // Copy nodes only if they are linked to a non-PC coverage.  Don't copy those linked to a PC subcoverage or those
      // linked to no coverage at all.
      if (match == 2) {
        this.copyNodeFromPriorXML(parent, node)
      }
      if (match == 0) { 
        // Note the error
        writeExceptionReport("Warning: Coverage subtype [" + node.getAttributeValue("code") + "] was not linked to any coverage and will not be copied to the output file.")
      }
    }
  }

  // This copies a node from the collection of prior nodes for a typelist file into the output set 
  private function copyNodeFromPriorXML(parent : XMLNode, prior : XMLNode) {
    parent.addChild(prior.clone())
  }
  
  // Creates a root typelist XML, copies the product model nodes into it, and writes it out to a file
  private function writeTypelistFile(productModelXML : XMLNode, nodeElementName : String, name : String, 
                                     desc : String, filePath : String) {
    var root = createTypelistRoot(name, desc)
    var node = productModelXML.findFirst(\n -> n.ElementName.equalsIgnoreCase(nodeElementName))
    for (tcode in node.Children) {
      root.addChild(tcode.clone())
    }
    root.writeTo(new File(filePath))
  }

  private function hasExposureType(covSub : XMLNode) : boolean {
    for (catNode in covSub.Children) {
      if (isCategoryForTypelist(catNode, "ExposureType")) {
        return true        
      }
    }
    
    return false  // If no exposure type category was found
  }
  
  private function writeExceptionReport(msg : String) {
    _exceptionFile.write(StreamUtil.toBytes(msg + "\n"))
  }

  private function validateDirectoriesAndFiles() {
    var f = new File(dirPrior)
    if (!f.exists()) {
      throw new IOException("Input directory could not be found")
    }
    f = new File(dirNew)
    if (!f.exists()) {
      throw new IOException("Output directory could not be found")
    } else if (!f.canWrite()) {
      throw new IOException("Output directory cannot be written to")
    }
    _inputFiles.each(\ filename -> {
      /* We will allow there to be no prior version of the files
      f = new File(dirPrior + filename)
      if (!f.exists()) {
        throw new IOException("Input file ${filename} could not be found")
      } */
      f = new File(dirNew + filename)
      if (f.exists() && !f.canWrite()) {
        throw new IOException("Output file ${filename} cannot be written to")
      }
    })
  }
  
  // If the file is not found, this will return an XMLNode with no children, which simulates an empty typelist input file.
  private function parseXMLFileSafely(filepath : String) : XMLNode {
    var f = new File(filepath)
    if (!f.exists()) {
      return new XMLNode()
    } else {
      return gw.xml.XMLNode.parse(f)
    }
  }

  private function getPropertiesForlanguage(language : LanguageType) : Properties {
    var properties = LanguageTypeListMap.get(language)
    if (properties == null) {
      properties = new Properties()
      LanguageTypeListMap.put(language, properties)
    }
    return properties
  }
  
  private function localizeNameAndDescription(prodModel : ProductModelClass, typeListName : String,
                                              nameField : ProductModelDisplayKey, descriptionField : ProductModelDisplayKey) {
    //localized names
    var localeNames = prodModel.getProductModelDisplayKeyForAllLanguages(nameField)
    var ccTypeListDisplayKeyName = TypelistL10NPropertiesGateway.generateKey(true, typeListName, trimTypeCode(prodModel.Code))
    localeNames.eachKeyAndValue(\ language, displayName -> {
      var typeListMap = getPropertiesForlanguage(language)
      typeListMap.put(ccTypeListDisplayKeyName, displayName)
    })

    //localized descriptions
    var descriptionNames = prodModel.getProductModelDisplayKeyForAllLanguages(descriptionField)
    var ccTypeListDisplayKeyDescription = TypelistL10NPropertiesGateway.generateKey(false, typeListName, trimTypeCode(prodModel.Code))
    descriptionNames.eachKeyAndValue(\ language, displayName -> {
      var typeListMap = getPropertiesForlanguage(language)
      typeListMap.put(ccTypeListDisplayKeyDescription, displayName)
    })
  }

  private function writeLocalizedTypelistFiles() {
    LanguageTypeListMap.Keys.each(\ language -> {
      var properties = LanguageTypeListMap.get(language)
      TypelistL10NPropertiesGateway.writeTo(properties, new File(typeListFileForLanguage(language)))
    })
  }
  
  private function normalizeDirectory(dir : String) : String {
    if (!dir.endsWith(File.separator)) {
      dir += File.separator
    }
    return dir
  }

  // When a code exceeds the max length of a typecode, this function can be used to trim it down to the max length.
  // This should be used for both generating the typelist and later when mapping values during policy retrieval.  Of course, 
  // it is far better to avoid having codes which exceed the 50 char max length because there is no way to guarantee that a
  // trimmed code will be unique.  If cases occur where trimmed codes are not unique, they could be added as special cases here
  // which are treated in a non-standard way that results in unique values.
  public static function trimTypeCode(code : String) : String {
    if (code.length > 50) {
      return code.substring(0,50)
    } else {
      return code
    }
  }
}
