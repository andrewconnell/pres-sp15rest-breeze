Overview
========
- [SharePoint 2013 REST API](#sharepoint-2013-rest-api)
- [Introducing BreezeJS](#introducing-breezejs---wwwbreezejscom)
- [So, How to Set it Up?](#so-how-to-set-it-up)
- [What's Next for BreezeJS & SharePoint?](#whats-next-for-breezejs--sharepoint)



SharePoint 2013 REST API
========================
- Introduced with read/write support for lists in SharePoint 2010
  - `http://intranet.contoso.com/_layouts/ListData.svc`
- Dramatically expanded in SharePoint 2013 to support more than lists
- Based on [OData v3.0](http://www.odata.org/documentation/odata-version-3-0/) but contains some oddities & inconsistencies



SharePoint REST API Advantages
------------------------------
- Full control over payload
- Standard response type
- Consumers can use any technology on any platform



SharePoint REST API Disadvantages
---------------------------------
- Have to write all the plumbing
- More chatty than CSOM



What about SharePoint's CSOM?
-----------------------------
- CSOM is a proxy wrapper around the same endpoint
- Only available to .NET, Silverlight & JavaScript
- Not available to other technologies
- Returns SharePoint objects
- Very few 3rd party libraries written for SharePoint objects



SharePoint 2013 REST API - Get Many Items
-----------------------------------------
- Point to the collection & get all

````javascript
var requestUri = _spPageContextInfo.webAbsoluteUrl +'/_api/Web/Lists'
  +'/getByTitle(\'Contacts\')/items/?'
  +'$select=Id,FirstName,Title,Email';

// execute AJAX request
var requestHeaders = {
  'ACCEPT': 'application/json;odata=verbose'
};

jQuery.ajax({
  url: requestUri,
  headers: requestHeaders,
  success: function (response){ /* do something on success */ },
  error: function(error){ /* do something on fail */ }
});

````



SharePoint 2013 REST API - Get One Item
---------------------------------------
- Just like **Get Many Items** but point to specific resource

````javascript
var requestUri = _spPageContextInfo.webAbsoluteUrl + '/_api/Web/Lists'
  +'/getByTitle(\'Contacts\')/items/?'
  +'$select=Id,FirstName,Title,Email' + '&$filter=Id eq 1';

// execute AJAX request
var requestHeaders = {
  'ACCEPT': 'application/json;odata=verbose'
};

jQuery.ajax({
  url: requestUri,
  headers: requestHeaders,
  success: function (response){ /* do something on success */ },
  error: function(error){ /* do something on fail */ }
});

````



SharePoint 2013 REST API - Create Item
--------------------------------------
- Point to collection
- Send object to create (matching metadata) via HTTP **POST**
- Include `X-REQUEST-DIGEST` header

````javascript
var requestUri = _spPageContextInfo.webAbsoluteUrl + '/_api/Web/Lists'
  +'/getByTitle(\'Contacts\')/items';

var requestHeaders = {
  'ACCEPT': 'application/json;odata=verbose',
  'X-RequestDigest': $('#__REQUESTDIGEST').val(),
};

var customerData = {
  __metadata: {
    'type': 'SP.Data.ContactsListItem'
  },
  Title: 'Name'
};
requestBody = JSON.stringify(customerData);

jQuery.ajax({
  url: requestUri,
  type: 'POST',
  contentType: 'application/json;odata=verbose',
  headers: requestHeaders,
  data: JSON.stringify(customerData),
  success: function (response){ /* do something on success */ },
  error: function(error){ /* do something on fail */ }
});
````



SharePoint 2013 REST API - Update Item
--------------------------------------
- Point to specific resource you want to update
- Send object to create (matching metadata) via HTTP **POST**
- If updating only fields submitted, include `X-HTTP-METHOD` header set to **MERGE**
- Include `X-REQUEST-DIGEST` header
- Include `IF-MATCH` header so updating intended version

````javascript
var requestUri = _spPageContextInfo.webAbsoluteUrl + '/_api/Web/Lists'
  +'/getByTitle(\'Contacts\')/items(1)';

var requestHeaders = {
  'ACCEPT': 'application/json;odata=verbose',
  'X-RequestDigest': $('#__REQUESTDIGEST').val(),
  'X-HTTP-Method': 'MERGE',
  'If-Match': etag
};

var customerData = {
  __metadata: {
    'type': 'SP.Data.ContactsListItem'
  },
  Title: 'NewName'
};
requestBody = JSON.stringify(customerData);

jQuery.ajax({
  url: requestUri,
  type: 'POST',
  contentType: 'application/json;odata=verbose',
  headers: requestHeaders,
  data: requestBody,
  success: function (response){ /* do something on success */ },
  error: function(error){ /* do something on fail */ }
});
````



SharePoint 2013 REST API - Delete Item
--------------------------------------
- Point to specific resource you want to delete
- Use HTTP **DELETE**
- Include `X-REQUEST-DIGEST` header
- Include `IF-MATCH` header with `*` value

````javascript
var requestUri = _spPageContextInfo.webAbsoluteUrl + '/_api/Web/Lists'
  +'/getByTitle(\'Contacts\')/items(1)';

var requestHeaders = {
  'ACCEPT': 'application/json;odata=verbose',
  'X-RequestDigest': $('#__REQUESTDIGEST').val(),
  'If-Match': '*'
};

jQuery.ajax({
  url: requestUri,
  type: 'DELETE',
  headers: requestHeaders,
  success: function (response){ /* do something on success */ },
  error: function(error){ /* do something on fail */ }
});
````



Introducing BreezeJS
====================
[www.breezejs.com](http://www.breezejs.com)

- Think "ORM / Entity Framework in JavaScript"
- LINQ-style query syntax
- All async calls **return promises** 
- Query & navigate to related entities
- Query locally with automatic **client side caching**
- Client-side **entity validation**
- Client-side **change tracking**



BreezeJS Architecture 101
-------------------------
- Client & server component
- Validation
- Customizable - data service adapter pattern
  - OData
  - WebAPI
  - WebAPIOData
  - SharePoint
- Breeze Labs
  - AngularJS directives
  - Helpers
  - Custom data service adapters



BreezeJS & SharePoint 2013 REST API
===================================
Doesn't work out of the box



SharePoint's REST API not compliant with OData 3.0 spec
-------------------------------------------------------
- No support for `$batch`
- Invalid `$metadata` response



Requires non-standard things in some requests
---------------------------------------------
- For HTTP POST, PUT, DELETE must include `X-RequestDigest` in header
- Doesn't support HTTP PATCH / MERGE
  - Uses `X-MERGE-METHOD` header instead



We Got it Working!
------------------
- Created custom BreezeJS data service adapter for SharePoint
  - Overrides communication between **BeezeJS & SharePoint**
- Configure Breeze for manual metadata store creation (*not automatic*)
- All included in NuGet package - **[Breeze.DataService.SharePoint](http://www.nuget.org/packages/Breeze.DataService.SharePoint)**
  - Includes everything you need, including BreezeJS client
- Requires a little setup work, but only required once per project



SharePoint 2013 REST API with BreezeJS - Get Many Items
-------------------------------------------------------
After the one time setup...

````javascript
var contactType = metadataStore.getEntityType('Contact');
var queryAsPromise = breeze.EntityQuery
    .from(contactType.defaultResourceName)
    .using(entityManager)
    .execute();
````



SharePoint 2013 REST API with BreezeJS - Get One Item
-----------------------------------------------------
After the one time setup...

````javascript
// try to get a single item from the cache, then revert to server
var queryAsPromise = entityManager.fetchEntityByKey('Contact', 1, true);

// handling response example
queryAsPromise.then(function(data){
  var actualEntity = data.entity;

  var message = "data retrieved from: "
  if (data.fromCache){
    message += "client-side cache";
  } else {
    message += "server-side REST call";
  }
});
````



SharePoint 2013 REST API with BreezeJS - Create Item
----------------------------------------------------
After the one time setup...

````javascript
// get reference to our entity type...
var entityType = metadataStore.getEntityType('Contact');

// create instance of the entity
var newEntity = entityManager.createEntity(entityType, initialValues)
newEntity.Title = "some title";

// save entity to server
var resultPromise = entityManager.saveChanges();
````



SharePoint 2013 REST API with BreezeJS - Update Item
----------------------------------------------------
After the one time setup...

````javascript
var entity = // some query to get an item

// update entity
entity.Title = "new title";

// save changes to server
var resultPromise = entityManager.saveChanges();

// or cancel... reset dirty flag & entity to original data
var resultPromise = entityManager.rejectChanges();
````



SharePoint 2013 REST API with BreezeJS - Delete Item
----------------------------------------------------
After the one time setup...

````javascript
var entity = // some query to get an item

// update entity
entity.entityAspect.setDeleted();

// save changes to server
var resultPromise = entityManager.saveChanges();

// or cancel... reset dirty flag & entity to original data
var resultPromise = entityManager.rejectChanges();
````



So, How to Set it Up?
=====================
Only 4 easy steps...

  1. Apply the NuGet package to your project - **[Breeze.DataService.SharePoint](http://www.nuget.org/packages/Breeze.DataService.SharePoint)**
  2. Configure BreezeJS SharePoint data service adapter
  3. Create & populate the BreezeJS metadata store
  4. Initialize BreezeJS



Step 1 - Get the NuGet package
------------------------------
````powershell
Install-Package "Breeze.DataService.SharePoint"
````



Step 2 - Configure BreezeJS SharePoint Data Service Adapter
-----------------------------------------------------------
````javascript
// configure breeze to use SharePoint OData service
var dsAdapter = breeze.config.initializeAdapterInstance('dataService', 'SharePointOData', true);

// tell breeze how to get the security validation token for
//  HTTP POST & DELETE calls
dsAdapter.getRequestDigest = function () {
  return jQuery('#__REQUESTDIGEST').val();
};
````



Step 3 - Create & Populate the BreezeJS Metadata Store
------------------------------------------------------
````javascript
// create a new breeze metadata store
metadataStore = new breeze.MetadataStore();

// setup a helper to create entities
var namespace = '';
var helper = new breeze.config.MetadataHelper(namespace, breeze.AutoGeneratedKeyType.Identity);

// create entity for contacts
var contactEntity = {
  name: 'Contact',
  defaultResourceName: 'getbytitle(\'Contacts\')/items',
  dataProperties: {
    Id: { type: breeze.DataType.Int32 },
    FirstName: { nullable: false },
    Title: { nullable: false },  // this is actually the last name field in the list
    Email: {
      nullable: false,
      validators: [breeze.Validator.emailAddress()]
    }
  }
};

// add entity to metadata store
helper.addTypeToStore(metadataStore, contactEntity);
````



Step 4 - Initialize BreezeJS
----------------------------
````javascript
// get reference to contact entity type
contactType = metadataStore.getEntityType('Contact');

// create the data service
var dataService = new breeze.DataService({
  // tell breeze the root REST endpoint to use
  //  since we only are using lists, point to that
  serviceName: _spPageContextInfo.webAbsoluteUrl + '/_api/web/lists/',
  // tell breeze not to interrogate sharepoint for it's
  //  massive OData $metadata response... we created it manually
  hasServerMetadata: false
});

// create an instance of the entity manager
entityManager = new breeze.EntityManager({
  dataService: dataService,
  // tell breeze where the metadata is
  metadataStore: metadataStore
});
````



Demo Time... Let's Take a Look!
-------------------------------
![demo time](img/punchbear.jpeg)



What's Next for BreezeJS & SharePoint?
======================================
- SharePoint 2010 `listdata.svc` REST support - [issue #2](https://github.com/andrewconnell/breeze.js.labs/issues/2)
- SharePoint 2013 cross domain support - [issue #4](https://github.com/andrewconnell/breeze.js.labs/issues/4)
- Simplify setup & registration
- Entity metadata generation



How to stay informed of updates...
----------------------------------
- Follow [my blog](http://www.andrewconnell.com) or me on Twitter [@andrewconnell](http://www.twitter.com/andrewconnell)
- Follow my fork of the BreezeJS Labs repo
  - [github.com/andrewconnell/breeze.js.labs](https://github.com/andrewconnell/breeze.js.labs)
  - All issues, enhancements & milestones in [issues list](https://github.com/andrewconnell/breeze.js.labs/issues)
  - Contribute, follow, report bugs
  - Edits sent back to BreezeJS pull requests & new drops ship every few weeks



#Resources
- AC's Blog Posts
  - [BreezeJS Makes Client-Side SharePoint 2013 REST Development a... BREEZE!](http://www.andrewconnell.com/blog/breezejs-makes-client-side-sharepoint-2013-rest-development-a-breeze)
  - [Understanding Challenges Using Breeze & SharePoint Out-Of-The-Box](http://www.andrewconnell.com/blog/understanding-challenges-using-breeze-sharepoint-out-of-the-box)
  - [Getting BreezeJS to Work with the SharePoint 2013 REST API](http://www.andrewconnell.com/blog/getting-breezejs-to-work-with-the-sharepoint-2013-rest-api)
- [What are Breeze Labs?](http://www.breezejs.com/documentation/what-are-breeze-labs)
- Demo project
  - [github.com/andrewconnell/breezeSP2013Sample](https://github.com/andrewconnell/BreezeSP2013Sample)
- BreezeJS Labs fork for SharePoint data service adapter development
  - [github.com/andrewconnell/breeze.js.labs](https://github.com/andrewconnell/breeze.js.labs)