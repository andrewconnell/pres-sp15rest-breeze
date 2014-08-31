(function () {
  'use strict';

  // define factory
  var serviceId = 'breeze.config';
  angular.module('app').factory(serviceId,
    ['breeze', 'common', 'spContext', configBreeze]);

  // create service
  function configBreeze(breeze, common, spContext) {
    // init service
    init();

    // service public signature
    return {
      dataservice: getDataService()
    };

    // init service
    function init() {

      // configure breeze to use SharePoint OData service
      var dsAdapter = breeze.config.initializeAdapterInstance('dataService', 'SharePointOData', true);

      // when breeze needs the request digest for sharepoint, 
      //  this is how it will get it, from our sharepoint context
      dsAdapter.getRequestDigest = function () {
        return spContext.securityValidation;
      };

      common.logger.log("service loaded", null, serviceId);
    }

    function getDataService() {
      // set the data service endpoint
      return new breeze.DataService({
        // point to universal sharepoint rest endpoint for lists
        serviceName: spContext.hostWeb.appWebUrl + '/_api/web/lists/',
        // tell data service to NOT get the $metadata from sharepoint
        //  we will set it ourselves
        hasServerMetadata: false
      });
    }
  }
})();