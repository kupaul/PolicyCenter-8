/**
 * Reflector in the reflection
 */
Ext.define('gw.reflection.Reflector', {

  constructor:function (id, aspectMap) {
    if (arguments.length == 0) {
      return;
    }

    this.id = id
    this.aspects = []

    // TODO : change for .. in to just the for loop
    for (var name in aspectMap) {
      if (aspectMap.hasOwnProperty(name)) {
        if ('DIRECT_ONLY' == name) {
          this.bReflectDirectChangeOnly = aspectMap[name];
        } else {
          this.aspects.push(new gw.reflection.Aspect(this, name, aspectMap[name]));
        }
      }
    }
    //sort aspects, so that "OPTION" will come before "VALUE"
    this.aspects = Ext.Array.sort(this.aspects, function (a, b) {
      return (a.name == b.name) ? 0 : (a.name < b.name) ? -1 : 1;
    })
  },

  // add aspects to the input aspect array
  // returns true if aspects were added
  addAspects:function (e, bDirectChange, aspects) {
    var oldLen = aspects.length;
    if (!this.bReflectDirectChangeOnly || bDirectChange) {
      Ext.each(this.aspects, function (aspect) {
        if (aspect.isTriggered(e)) {
          aspects.push(aspect);
        }
      })
    }
    return oldLen != aspects.length;
  },

  addRangeReflector:function (reflectorToTriggersMap) {
    var id = this.id
    Ext.each(this.aspects, function (aspect) {
      var rangeTriggers = aspect.getRangeTriggers();
      if (rangeTriggers != null) {
        reflectorToTriggersMap[id] = rangeTriggers;
        return false;
      }
    })
  }

});
