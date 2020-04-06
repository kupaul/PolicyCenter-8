@rem #######################################################################
@rem ## Repackage productdesigner.war with the new language configuration ##
@rem #######################################################################
@echo off
set PD_WAR=..\..\war\productdesigner.war
set TMP=pd_unpack
set OUTPUT_DIR=.\output

md %TMP%

cd %TMP%
echo Unpacking all files from productdesigner.war
jar xf %PD_WAR%

cd ..

set L10N_WAR=productdesigner.war
set LANG_DIR=config

echo Deleting the old language configuration from the unpacked war
rd /q /s %TMP%\%LANG_DIR%

echo copying the new language configuration
xcopy /E /I %LANG_DIR% %TMP%\%LANG_DIR%

cd %TMP%

echo rebuilding the localized war
jar cf %L10N_WAR% .

cd ..

md %OUTPUT_DIR%
MOVE %TMP%\%L10N_WAR% %OUTPUT_DIR%\%L10N_WAR%
rd /q /s %TMP%

echo ------------------------------------------------------------
echo repack is done.
echo Created a localized productdesigner.war file at: '%OUTPUT_DIR%'
echo To launch via the launcher script, you must first copy file '%OUTPUT_DIR%\%L10N_WAR%' into '..\war\productdesigner.war'


