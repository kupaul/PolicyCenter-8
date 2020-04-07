PolicyCenter8-General-3B-8.0.2_en_US

This instance of PolicyCenter is identical to a base application instance, except for the following:

- Shortcuts in the PolicyCenter directory
	- There are shortcuts to start PolicyCenter (with and without the debugger enabled) and stop PolicyCenter.
	- There is a shortcut to start Studio.
- Studio
	- The port number, 8180, has been added to the remote server URL.
	- In config.xml, the H2 database files are stored in c:\Guidewire\PolicyCenter\db.
        (This ensures the database files are contained within the PolicyCenter directory.)
	- In config.xml:
		- AllowDocumentAssistant is set to true to enable Document Assistant.
		- EnableInternalDebugTools is set to true.
		- The ClaimSystemURL has been set to point to ClaimCenter. (This has no effect unless PC/CC integration is enabled.)
		- The BillingSystemURL has been set to point to BillingCenter. (This has no effect unless PC/BC integration is enabled.)
- properties files
        - logging.properties is configured to store the PolicyCenter logs in c:\Guidewire\PolicyCenter\logs. (This ensures the log files
          are contained within the PolicyCenter directory.)
- Generated files
	- The Data Dictionary and Security Dictionary have been generated.
- PolicyCenter
	- The large sample data set has been loaded.
	- The training data has been loaded. This consists of 20 student accounts that are functionally identical to aapplegate,
          except the student accounts have additional roles (Forms Admin, Rating Analyst, Rating Supervisor).
	- A "dbbackup" directory has a copy of the database as it exists at the start of the course.
        (This simplifies the task of reloading the sample data and training data after a dbdrop.)
	- Solr has been enabled and sample data is indexed.
	- TinySampleCommunityData.gs has been modified to create data that supports multicurrency lab. 
This is Test Run.
