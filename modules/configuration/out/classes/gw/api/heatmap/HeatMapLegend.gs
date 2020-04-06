package gw.api.heatmap
uses java.awt.Color
uses java.awt.image.BufferedImage
uses java.awt.AlphaComposite
uses java.awt.image.RenderedImage
uses java.awt.Font
uses java.lang.Math
uses java.awt.RenderingHints

/**
 * Code to generate a map legend as an image with a title and a series of color squares with labels. 
*/
@Export
class HeatMapLegend {
  /** The font to use for labels, must be valid for Font.decode()
  */
  var _labelFontName : String as LabelFontName = Font.SANS_SERIF + "-PLAIN-14"
  /** The font to use for the title, must be valid for Font.decode()
  */
  var _titleFontName : String as TitleFontName = Font.SANS_SERIF + "-BOLD-14"
  /** The background color for the legend
  */
  var _legendBackgroundColor : Color as LegendBackgroundColor = Color.WHITE
  /** The text color for the the legend
  */
  var _legendTextColor : Color as LegendTextColor = Color.BLACK

 /**
  * Generate a map legend as an image with a title and a series of color squares with labels.
  */
  function generateLegendIcon(colorMap : HeatMapColorMap, title : String) : RenderedImage {
    var colors = colorMap.Colors
    var labels = colorMap.Labels
    // get sizes for the labels and title text
    var bufferedImage1 = new BufferedImage(10, 10, BufferedImage.TYPE_INT_ARGB)
    var g2d = bufferedImage1.createGraphics()
    var labelFont = Font.decode(LabelFontName)
    var frc = g2d.getFontRenderContext()

    var maxHeight : double = labelFont.getStringBounds("X", frc).Height
    var maxWidth : double = 0
    var labelWidths = new int[labels.Count]
    for (label in labels index i) {
      var rect = labelFont.getStringBounds(label, frc)
      maxHeight = Math.max(maxHeight, rect.Height)
      maxWidth = Math.max(maxWidth, rect.Width)
      labelWidths[i] = rect.Width as int
    }
    g2d.dispose()

    // compute the overall size
    var maxLabelWidth = maxWidth as int
    var titleFont = Font.decode(TitleFontName)
    var titleRect = titleFont.getStringBounds(title, frc)
    maxWidth = Math.max(maxWidth, titleRect.Width)


    var labelRowHeight = (maxHeight * 1.3) as int
    var titleRowHeight = (titleRect.Height * 1.6) as int
    var colorSquareSize = maxHeight as int

    var numRows = Math.max(colors.Count, labels.Count)
    var totalHeight = titleRowHeight + numRows * labelRowHeight
    var totalWidth = 15 + labelRowHeight + (maxWidth as int)
    var leftMargin = (totalWidth - (labelRowHeight + maxLabelWidth))/2
    var titleMargin = titleRowHeight - labelRowHeight

    // now draw the legend
    // use TYPE_INT_ARGB to include alpha
    bufferedImage1 = new BufferedImage(totalWidth, totalHeight, BufferedImage.TYPE_INT_ARGB)

    g2d = bufferedImage1.createGraphics()
    var AlphaCompositeSRC = 2 // value is AlphaComposite.SRC, but Gosu confuses that with AlphaComposite.Src
    g2d.setComposite(AlphaComposite.getInstance(AlphaCompositeSRC))
    g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON)

    g2d.setColor(LegendBackgroundColor)
    g2d.fillRect(0, 0, totalWidth, totalHeight)

    g2d.setColor(LegendTextColor)
    g2d.setFont(titleFont)

    // centered title
    g2d.drawString(title, ((totalWidth - titleRect.Width)/2) as int, 8 + titleRowHeight/2)
    g2d.setFont(labelFont)
    
    // color squares
    for (i in 0..|numRows) {
      var revIndex = numRows - 1 - i
      if (revIndex < 0 || revIndex >= colors.Count)
        continue
      g2d.setColor(colors[revIndex]);
      g2d.fillRect(leftMargin,
                   titleMargin + titleRowHeight + i*labelRowHeight,
                   colorSquareSize,
                   colorSquareSize)
    }

    // centered labels
    g2d.setColor(LegendTextColor)
    for (i in 0..|numRows) {
      var revIndex = numRows - 1 - i
      if (revIndex < 0 || revIndex >= labels.Count)
        continue;
      g2d.drawString(labels[revIndex],
                     leftMargin + labelRowHeight + (maxLabelWidth - labelWidths[revIndex])/2,
                     3 + titleMargin + i*labelRowHeight + titleRowHeight + labelRowHeight/2)
    }

    g2d.dispose()
    return bufferedImage1
  }

}