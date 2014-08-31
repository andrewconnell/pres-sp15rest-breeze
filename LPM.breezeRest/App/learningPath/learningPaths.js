(function () {
  'use strict';

  // define controller
  var controllerId = "learningPaths";
  angular.module('app').controller(controllerId,
    ['$location', 'common', 'datacontext', learningPaths]);

  // create controller
  function learningPaths($location, common, datacontext) {
    var vm = this;

    // navigate to specified item
    vm.gotoItem = gotoItem;
    // build link to associated learning items
    vm.learningItemsPath = learningItemsPath;

    // init controller
    init();

    // load all learning paths
    getLearningPaths();

    // init controller
    function init() {
      common.logger.log("controller loaded", null, controllerId);
      common.activateController([], controllerId);
    }

    // navigate to specified item
    function gotoItem(learningPath) {
      if (learningPath && learningPath.Id) {
        $location.path('/LearningPaths/' + learningPath.Id);
      }
    }

    // utility function for UI pointing to learning path items
    function learningItemsPath(learningPath) {
      if (learningPath && learningPath.Id) {
        return $location.path('/LearningPaths/' + learningPath.Id + '/Items');
      } else {
        common.logger.logWarning('invalid item selected', learningPath, controllerId);
        return '';
      }
    }

    // get learning paths & set to bindable collection on vm
    function getLearningPaths() {
      datacontext.getLearningPaths()
        .then(function (data) {
          if (data) {
            vm.learningPaths = data;
          } else {
            throw new Error('error obtaining data');
          }
        })
        .catch(function (error) {
          common.logger.logError('error obtaining learning paths', error, controllerId);
        });
    }

  };
})();