package gw.exportimport

enhancement EntityFlowMaskDataUIEnhancement : entity.EntityFlowMaskData {
  
  /**
   * Columns included by an EntityFlowMask.  This does not include
   * any required columns.
   */
  property get SelectedColumnNames() : String[] {
    return SelectableColumnNames == null ? null : SelectableColumnNames.subtract(this.MaskIdentifiers).toTypedArray()
  }

  property set SelectedColumnNames(columnNames : String[]) {
    this.MaskIdentifiers = SelectableColumnNames == null ? {} : SelectableColumnNames.subtract(columnNames).toTypedArray()
  }

  property get AllIncludedColumnNames() : String[] {
    return getEntityInfo().Columns*.ColumnIdentifier.subtract(this.MaskIdentifiers).toTypedArray()
  }

  property get RequiredColumnNames() : String[] {
    return getEntityInfo().RequiredColumns*.ColumnIdentifier
  }

  /**
   * Return an array of column identifiers that are generally available for
   *  inclusion or exclusion.
   */
  property get SelectableColumnNames() : String [] {
    return getEntityInfo().OptionalColumns*.ColumnIdentifier
  }

  private function getEntityInfo() : EntityInfo {
    return ( this.EntityType == null ) ? null : EntityInfo.Registry.findEntityInfo(this.EntityType)
  }
  
}
