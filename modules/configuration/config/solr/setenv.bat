rem Uncomment the following line to run zookeeper inside of Solr
rem set JAVA_OPTS=-Xms256m -Xmx2048m -XX:MaxPermSize=256m -DzkRun -DnumShards=1 -DSTOP.PORT=7983 -DSTOP.KEY=key -Dbootstrap_conf=true

rem Uncomment the following line to run zookeeper in standalone mode
rem export JAVA_OPTS="-Xms256m -Xmx2048m -XX:MaxPermSize=256m -DzkHost=localhost:2181 -DnumShards=1 -DSTOP.PORT=7983 -DSTOP.KEY=key -Dbootstrap_conf=true"

rem Uncomment the following line to run tomcat in debug mode
rem set JPDA_OPTS=-agentlib:jdwp=transport=dt_socket,address=5005,server=y,suspend=y