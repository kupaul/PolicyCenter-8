rem change this directory path to match where coreutils is installed.
set CoreUtils=c:\cygwin

set path=%CoreUtils%\bin;%path%

rem usage:  scriptname -T tempDir

if "%1" == "-T" (
  set tempDir=%2
) else (
  echo !Error: Please specify temporary directory.
  echo usage: scriptname -T tempDir
  echo Exiting.& exit /b 1
)

rem NOTE: if XML output changes (e.g. because query is modified) these columns may change
set urnField=7,8
set sliceDateField=5,6r
set termNumberField=9,10rn

sort -T %tempDir% --stable --key=%urnField% --key=%sliceDateField% --key=%termNumberField% "--field-separator=>" | ^
sort -T %tempDir% --unique --key=%urnField%                                                "--field-separator=>"