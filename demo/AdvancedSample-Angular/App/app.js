(function () {
  'use strict';

  // create app
  var app = angular.module('app', [
    // ootb angular modules
    'ngRoute',      // app route (url path) support
    'ngCookies',    // cookie read/write support
    'ngSanitize',   // fixes HTML issues in data binding
    'ngResource',   // assists with rest calls
    'ngAnimate',    // animation capabilities

    // 3rd party modules
    'breeze.angular',
    'breeze.directives',

    // my custom modules
    'common'
  ]);

  // startup code
  app.run(['$route', function ($route) {

  }]);
})();