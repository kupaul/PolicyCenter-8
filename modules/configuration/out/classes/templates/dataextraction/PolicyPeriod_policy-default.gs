<?xml version="1.0" encoding="UTF-8"?>
<policy xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="http://pacman/PolicyPeriod.xsd">
  <policynumber><%= entityRoot.PolicyNumber %></policynumber><%
  var Insured = entityRoot.Policy.Account.AccountHolder; %>
  <insured>
    <name><%= Insured.Contact.Name %></name>
    <address>
      <addressline1><%= Insured.Contact.PrimaryAddress.AddressLine1 %></addressline1>
      <city><%= Insured.Contact.PrimaryAddress.City %></city>
      <state><%= Insured.Contact.PrimaryAddress.State %></state>
      <postalcode><%= Insured.Contact.PrimaryAddress.PostalCode %></postalcode>
    </address>
  </insured><%
  var UWCompany = entityRoot.UWCompany; %>
  <underwriter>
    <name><%= UWCompany.Name %></name>
  </underwriter>
  <effectivedate><%= entityRoot.PeriodStart %></effectivedate>
  <expirationdate><%= entityRoot.PeriodEnd %></expirationdate>
  <lines><%
  foreach (Line in entityRoot.Lines) { %>
    <line>
      <description><%= Line.Subtype.Description %></description><%
    var ExposureUnits = Line.ExposureUnits
    if (ExposureUnits.length > 0) { %>
      <exposureunits><%
      foreach (ExposureUnit in ExposureUnits index ExpoUnitNum) { %>
        <exposureunit>
          <name>Exposure Unit <%= ExpoUnitNum + 1 %></name><%
        var Location = ExposureUnit.Location
        if (Location != null) { %>
          <address>
            <addressline1><%= Location.AddressLine1 %></addressline1>
            <city><%= Location.City %></city>
            <state><%= Location.State %></state>
            <postalcode><%= Location.PostalCode %></postalcode>
          </address><%
        }
        if (ExposureUnit.Subtype == "VehicleEU") {
          var Vehicle = (ExposureUnit as com.guidewire.pc.domain.policy.VehicleEU).Vehicle; %>
          <vehicledescription>
            <vin><%= Vehicle.Vin %></vin>
            <Make><%= Vehicle.Make %></Make>
            <Model><%= Vehicle.Model %></Model>
            <Year><%= Vehicle.Year %></Year>
            <Type><%= Vehicle.Type.Description %></Type>
            <Class><%= Vehicle.ClassCode %></Class>
            <Use><%= Vehicle.PrimaryUse.Description %></Use>
          </vehicledescription><%
        }
        renderCoverages(ExposureUnit.Coverages); %>
        </exposureunit><%
      } %>
      </exposureunits><%
    }
    var LineLevelCoverages = new java.util.ArrayList()
    foreach (Coverage in Line.AllCoverages) {
      if (Coverage.CoverageLevel == "LineLevel") {
        LineLevelCoverages.add(Coverage)
      }
    }
    renderCoverages(LineLevelCoverages.toArray()); %>
    </line><%
    } %>
  </lines>
  <premium>0.00</premium>
  <totalcharges>0.00</totalcharges>
</policy>
<%

function renderCoverages(Coverages : com.guidewire.pc.domain.coverage.Coverage[]) {
  if (Coverages.length > 0) { %>
          <coverages><%
    foreach (Coverage in Coverages) {
      renderCoverage(Coverage)
    } %>
          </coverages><%
  }
}

function renderCoverage(Coverage : com.guidewire.pc.domain.coverage.Coverage) { %>
          <coverage>
            <type><%= Coverage.Subtype.Description %></type>
            <limits><%
            foreach (Term in Coverage.CovTerms) {
              if (Term.CovTermType.Name.endsWith("Limit")) {%>
              <limit><%
                var Model = Term.CovTermModel
                if (Model != null) { %>
                <model>
                  <restriction><%= Term.CovTermModel.CovTermModelRest.Description %></restriction>
                  <aggregation><%= Term.CovTermModel.CovTermModelAgg.Description %></aggregation>
                </model><%
                }
                var Option = Term.CovTermOpt
                if (Option != null) { %>
                <option><%
                  var OpModel = Term.CovTermModel
                  if (OpModel != null) { %>
                  <model>
                    <restriction><%= OpModel.CovTermModelRest.Description %></restriction>
                    <aggregation><%= OpModel.CovTermModelAgg.Description %></aggregation>
                  </model><%
                } %>
                  <value><%= toStringNoNull(Option.Value) %></value>
                </option><%
                } %>
                <type><%= Term.CovTermType.Description %></type>
                <value><%= toStringNoNull(Term.Value) %></value>
              </limit><% }
            } %>
            </limits>
          </coverage><%
}

function toStringNoNull(thing : java.lang.Object) : java.lang.String {
  %><%= thing == null ? "" : thing.toString() %><%
}
%>