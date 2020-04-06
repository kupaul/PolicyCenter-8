/**
 * Progress polling function
 */
gw.progressfunction = function() {
  var _progBarTask = null;
  var _progVersion = 0;
  var _needPoll = [];
  var PROGRESS_POLL_INTERVAL = 3000; // 3 seconds

  function doPoll() {
    var currentPoll = _progVersion;
    if (_needPoll[currentPoll] == null) {
      return;
    }
    if (_needPoll[currentPoll].length == 0) {
      return;
    }

    var nextPoll = currentPoll+1;
    _needPoll[nextPoll] = [];
    _progVersion = nextPoll;

    var ids = _needPoll[currentPoll];
    _needPoll[currentPoll] = null;

    var reqs = [];
    for (var i = 0; i < ids.length; i++) {
      reqs[i] = {viewRootId:ids[i], paramMap:{progBarId:ids[i]}, childrenOnly:false};
    }

    gw.app.requestViewRoots(reqs,
        function(options, success, response) {
          var commands = Ext.decode(response.responseText);
          var op;
          if (reqs.length == 1) {
            op = commands[0];
            // Need to handle case where there is no op because
            // the progress is no longer visible (navigated to another page)
            // in that case, an empty op is sent.
            if (op) {
              gw.cmdProc[op.cmd](op, response)
            }
          } else {
            for (var i = 0; i < commands.length; i++) {
              op = Ext.decode(commands[i])[0];
              if (op) {
                gw.cmdProc[op.cmd](op, response)
              }
            }
          }
        })
  }

  function _getProgBarTask () {
    if (_progBarTask == null) {
      // Create the progress bar task.
      _progBarTask = {
        run: function() {
          doPoll()
        },
        interval: PROGRESS_POLL_INTERVAL
      }
      Ext.TaskManager.start(_progBarTask);
    }
    return _progBarTask;
  }

  return {
   registerToPoll : function(progBarId) {
     _getProgBarTask();
     if (_needPoll[_progVersion] == null) {
       _needPoll[_progVersion] = []
     }
     _needPoll[_progVersion].push(progBarId);
   }
  }
}();