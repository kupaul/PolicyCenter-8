@rem ############################################################
@rem ## Unpack language configuration from productdesigner.war ##
@rem ############################################################
@echo off
set PD_WAR=..\war\productdesigner.war

echo Unpacking the language configuration directory from '%PD_WAR%' into config\locale
jar xf %PD_WAR% config/locale


