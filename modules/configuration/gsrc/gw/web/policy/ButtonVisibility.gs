package gw.web.policy

@Export
enum ButtonVisibility {

  Hidden(false, false),
  GrayedOut(true, false),
  Clickable(true, true)
  
  var _visible : boolean as Visible
  var _available : boolean as Available

  private construct(visibleArg : boolean, availableArg : boolean) {
    _visible = visibleArg
    _available = availableArg
  }
  
  static function of(visible : boolean, available : boolean) : ButtonVisibility {
    return ButtonVisibility.AllValues.singleWhere(\ b -> b.Visible == visible and b.Available == available)
  }
}
