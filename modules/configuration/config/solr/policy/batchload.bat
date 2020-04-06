echo off

set APP_PREFIX=pc
set DOC_TYPE=policy
set BASE_DIR=c:\opt\gwsolr
set SOLR_VERSION=4.1.0

set GWSOLR_HOME=%BASE_DIR%\%APP_PREFIX%

set LIBDIR=%GWSOLR_HOME%\lib
set SOLRLIBDIR=%GWSOLR_HOME%\%APP_PREFIX%-gwsolr\WEB-INF\lib
set SERVLETJAR=c:\opt\apache-tomcat\lib\servlet-api.jar
set TRANSFORMERLIBDIR=%LIBDIR%
set CONFIGFILE=%GWSOLR_HOME%\solr\%DOC_TYPE%_active\conf\batchload-config-sqlserver.xml
rem set DEBUG=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=5005

set GLOBVAR=%LIBDIR%
call :quote LIBDIR

set GLOBVAR=%SOLRLIBDIR%
call :quote SOLRLIBDIR

set GLOBVAR=%APPSERVERLIBDIR%
call :quote APPSERVERLIBDIR

set GLOBVAR=%TRANSFORMERLIBDIR%
call :quote TRANSFORMERLIBDIR

set JARS=%LIBDIR%\solr-1.0-SNAPSHOT.jar;%LIBDIR%\commons-lang3-3.1.jar;%LIBDIR%\log4j-1.2.16.jar;%LIBDIR%\ojdbc7-12.1.0.1.0.jar;%LIBDIR%\db2jcc4-0.jar;%LIBDIR%\sqljdbc4-4.0.2206.100.jar;%LIBDIR%\h2-1.2.147.jar;%LIBDIR%\httpcore-4.2.1.jar;%LIBDIR%\httpclient-4.2.1.jar

set SOLRJARS=%SOLRLIBDIR%\cglib-nodep-2.2.jar;%SOLRLIBDIR%\commons-beanutils-1.7.0.jar;%SOLRLIBDIR%\commons-cli-1.2.jar;%SOLRLIBDIR%\commons-codec-1.7.jar;%SOLRLIBDIR%\commons-collections-3.2.1.jar;%SOLRLIBDIR%\commons-fileupload-1.2.1.jar;%SOLRLIBDIR%\commons-io-2.1.jar;%SOLRLIBDIR%\commons-lang-2.6.jar;%SOLRLIBDIR%\guava-13.0.1.jar;%SOLRLIBDIR%\httpclient-4.1.3.jar;%SOLRLIBDIR%\httpcore-4.1.4.jar;%SOLRLIBDIR%\httpmime-4.1.3.jar;%SOLRLIBDIR%\jcl-over-slf4j-1.6.4.jar;%SOLRLIBDIR%\libphonenumber-5.1.jar;%SOLRLIBDIR%\lucene-analyzers-common-%SOLR_VERSION%.jar;%SOLRLIBDIR%\lucene-analyzers-kuromoji-%SOLR_VERSION%.jar;%SOLRLIBDIR%\lucene-analyzers-phonetic-%SOLR_VERSION%.jar;%SOLRLIBDIR%\lucene-core-%SOLR_VERSION%.jar;%SOLRLIBDIR%\lucene-grouping-%SOLR_VERSION%.jar;%SOLRLIBDIR%\lucene-highlighter-%SOLR_VERSION%.jar;%SOLRLIBDIR%\lucene-memory-%SOLR_VERSION%.jar;%SOLRLIBDIR%\lucene-misc-%SOLR_VERSION%.jar;%SOLRLIBDIR%\lucene-queries-%SOLR_VERSION%.jar;%SOLRLIBDIR%\lucene-queryparser-%SOLR_VERSION%.jar;%SOLRLIBDIR%\lucene-spatial-%SOLR_VERSION%.jar;%SOLRLIBDIR%\lucene-suggest-%SOLR_VERSION%.jar;%SOLRLIBDIR%\objenesis-1.2.jar;%SOLRLIBDIR%\slf4j-api-1.6.4.jar;%SOLRLIBDIR%\slf4j-jdk14-1.6.4.jar;%SOLRLIBDIR%\solr-analysis-extras-%SOLR_VERSION%.jar;%SOLRLIBDIR%\solr-cell-%SOLR_VERSION%.jar;%SOLRLIBDIR%\solr-clustering-%SOLR_VERSION%.jar;%SOLRLIBDIR%\solr-core-%SOLR_VERSION%.jar;%SOLRLIBDIR%\solr-dataimporthandler-%SOLR_VERSION%.jar;%SOLRLIBDIR%\solr-dataimporthandler-extras-%SOLR_VERSION%.jar;%SOLRLIBDIR%\solr-ext-1.0-SNAPSHOT.jar;%SOLRLIBDIR%\solr-langid-%SOLR_VERSION%.jar;%SOLRLIBDIR%\solr-solrj-%SOLR_VERSION%.jar;%SOLRLIBDIR%\solr-test-framework-%SOLR_VERSION%.jar;%SOLRLIBDIR%\solr-uima-%SOLR_VERSION%.jar;%SOLRLIBDIR%\solr-velocity-%SOLR_VERSION%.jar;%SOLRLIBDIR%\spatial4j-0.3.jar;%SOLRLIBDIR%\velocity-1.7.jar;%SOLRLIBDIR%\velocity-tools-2.0.jar;%SOLRLIBDIR%\wstx-asl-3.2.7.jar;%SOLRLIBDIR%\zookeeper-3.4.5-gw05.jar

rem If you define transformer classes, archive them in a jar, place the jar in the directory pointed to by the TRANSFORMERLIBDIR environment variable
rem and assign the name of the jar to the TRANSFORMERJARS variable in the next line. For example, you would write:
rem
rem   set TRANSFORMERJARS=%TRANSFORMERLIBDIR%\Foo.jar
rem
set TRANSFORMERJARS=%TRANSFORMERLIBDIR%\pc-solr-1.0-SNAPSHOT.jar

java %DEBUG% -cp .;%JARS%;%SOLRJARS%;%SERVLETJAR%;%TRANSFORMERJARS% com.guidewire.solr.batchload.SolrBatchLoader %CONFIGFILE% 2> solr-batchload.log
exit /b

:quote
set var=%GLOBVAR:"=%
set %~1="%var%"
exit /b
