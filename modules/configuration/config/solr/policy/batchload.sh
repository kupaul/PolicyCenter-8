#!/bin/sh

APP_PREFIX=pc
DOC_TYPE=policy
BASE_DIR=/opt/gwsolr
SOLR_VERSION=4.1.0

GWSOLR_HOME=$BASE_DIR/$APP_PREFIX

LIBDIR=$GWSOLR_HOME/lib
SOLRLIBDIR=$GWSOLR_HOME/$APP_PREFIX-gwsolr/WEB-INF/lib
SERVLETJAR=/opt/tomcat/apache-tomcat-6.0.36/lib/servlet-api.jar
TRANSFORMERLIBDIR=$LIBDIR
CONFIGFILE=$GWSOLR_HOME/solr/${DOC_TYPE}_active/conf/batchload-config-oracle.xml
#DEBUG="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=5005"

jarfiles="solr-1.0-SNAPSHOT.jar commons-lang3-3.1.jar log4j-1.2.16.jar ojdbc7-12.1.0.1.0.jar db2jcc4-0.jar sqljdbc4-4.0.2206.100.jar h2-1.2.147.jar httpcore-4.2.1.jar httpclient-4.2.1.jar"
JARS=.
for jar in $jarfiles
do
  jar=$LIBDIR/$jar
  if [ -f $jar ]
  then
    JARS=$JARS:$jar
  else
    echo "File $jar does not exist"
    exit -1
  fi
done

jarfiles="cglib-nodep-2.2.jar commons-beanutils-1.7.0.jar commons-cli-1.2.jar commons-codec-1.7.jar commons-collections-3.2.1.jar commons-fileupload-1.2.1.jar commons-io-2.1.jar commons-lang-2.6.jar guava-13.0.1.jar httpclient-4.1.3.jar httpcore-4.1.4.jar httpmime-4.1.3.jar jcl-over-slf4j-1.6.4.jar libphonenumber-5.1.jar lucene-analyzers-common-$SOLR_VERSION.jar lucene-analyzers-kuromoji-$SOLR_VERSION.jar lucene-analyzers-phonetic-$SOLR_VERSION.jar lucene-core-$SOLR_VERSION.jar lucene-grouping-$SOLR_VERSION.jar lucene-highlighter-$SOLR_VERSION.jar lucene-memory-$SOLR_VERSION.jar lucene-misc-$SOLR_VERSION.jar lucene-queries-$SOLR_VERSION.jar lucene-queryparser-$SOLR_VERSION.jar lucene-spatial-$SOLR_VERSION.jar lucene-suggest-$SOLR_VERSION.jar objenesis-1.2.jar slf4j-api-1.6.4.jar slf4j-jdk14-1.6.4.jar solr-analysis-extras-$SOLR_VERSION.jar solr-cell-$SOLR_VERSION.jar solr-clustering-$SOLR_VERSION.jar solr-core-$SOLR_VERSION.jar solr-dataimporthandler-$SOLR_VERSION.jar solr-dataimporthandler-extras-$SOLR_VERSION.jar solr-ext-1.0-SNAPSHOT.jar solr-langid-$SOLR_VERSION.jar solr-solrj-$SOLR_VERSION.jar solr-test-framework-$SOLR_VERSION.jar solr-uima-$SOLR_VERSION.jar solr-velocity-$SOLR_VERSION.jar spatial4j-0.3.jar velocity-1.7.jar velocity-tools-2.0.jar wstx-asl-3.2.7.jar zookeeper-3.4.5-gw05.jar"
SOLRJARS=
for jar in $jarfiles
do
  jar=$SOLRLIBDIR/$jar
  if [ -f $jar ]
  then
    SOLRJARS=$SOLRJARS:$jar
  else
    echo "File $jar does not exist"
    exit -1
  fi
done

# If you define transformer classes, archive them in a jar, place the jar in the directory pointed to by the TRANSFORMERLIBDIR environment variable
# and assign the name of the jar to the jarfiles variable in the following line. For example, you would write:
#
#   jarfiles=Foo.jar
#
jarfiles=$APP_PREFIX-solr-1.0-SNAPSHOT.jar
TRANSFORMERJARS=
for jar in $jarfiles
do
  jar=$TRANSFORMERLIBDIR/$jar
  if [ -f $jar ]
  then
    TRANSFORMERJARS=$TRANSFORMERJARS:$jar
  else
    echo "File $jar does not exist"
    exit -1
  fi
done

java $DEBUG -cp $JARS:$SOLRJARS:$SERVLETJAR:$TRANSFORMERJARS com.guidewire.solr.batchload.SolrBatchLoader $CONFIGFILE 2> solr-batchload.log
