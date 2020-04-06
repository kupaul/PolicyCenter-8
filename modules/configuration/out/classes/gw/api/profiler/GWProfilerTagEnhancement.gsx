package gw.api.profiler
uses gw.api.profiler.ProfilerFrame
uses gw.api.profiler.ProfilerTag

/**
 * This enhancement adds some methods to {@link ProfilerTag} to automatically manage
 * pushing and popping the ProfilerFrame. In contrast with Gosu's <code>using</code>
 * statement, these methods optionally make the ProfilerFrame available.
 */
enhancement GWProfilerTagEnhancement : ProfilerTag {

  function execute(task()) {
    var frame = Profiler.push(this)
    try {
      task()
    } finally {
      Profiler.pop(frame)
    }
  }

  function execute(task(f : ProfilerFrame)) {
    var frame = Profiler.push(this)
    try {
      task(frame)
    } finally {
      Profiler.pop(frame)
    }
  }

  function evaluate<R>(func() : R) : R {
    var frame = Profiler.push(this)
    try {
      return func()
    } finally {
      Profiler.pop(frame)
    }
  }

  function evaluate<R>(func(f : ProfilerFrame) : R) : R {
    var frame = Profiler.push(this)
    try {
      return func(frame)
    } finally {
      Profiler.pop(frame)
    }
  }

}
