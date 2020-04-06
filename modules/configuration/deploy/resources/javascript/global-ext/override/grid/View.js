//
// Grid shrinkWrap bug fixes
//

/**
 * @SenchaUpgrade
 *
 * Added on 06/12/13 by Bruno Tavares for Ext 4.2.1
 * Support Ticket ticket-12521
 * Sencha Jira Ticket EXTJSIV-7923
 *
 * To solve our layouts we leave grids without any layout… it won't have a width and it will fit 100%…
 * PLUS we add shrinkWrap, so the columns push the grid further 100%…
 * PLUS set gridview position: relative; so it has at least 100%… if the columns are < 100% it doesn't matter… the gridview has 100%
 */

/**
 * First part, make sure position is relative. So it's always at least 100%.
 * (that's the way <divs> work)
 */
Ext.define('Gw.override.grid.View', {
  override: 'Ext.grid.View',
  style: 'position: relative'
});
