<html>
<head>
  <title>Sample Policy Data Extraction Template</title>
</head>
<body>
<p><b>Sample Policy Data Extraction Template</b></p>

<p>This is a sample gosu template for extracting data using the IDataExtractionAPI.</p>

<% if( policy == null ) { %>
<p><b>No policy found</b></p>
<% } else { %>
<p><b>Policy found:</b></p>
Policy Number: <%= (policy as Policy).PublicID %>
Account Main Contact Name: <%= (policy as Policy).Account.AccountHolderContact.DisplayName %>
<% } %>

</body>
</html>