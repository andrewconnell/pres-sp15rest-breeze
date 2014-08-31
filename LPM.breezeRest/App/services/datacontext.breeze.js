(function () {
  'use strict';

  // define factory
  var serviceId = 'datacontext';
  angular.module('app').factory(serviceId,
    ['$q', 'common', 'breeze.config', 'breeze.entities', datacontext]);

  function datacontext($q, common, breezeConfig, breezeEntities) {
    var metadataStore, learningItemType, learningPathType;
    var manager;

    // init factory
    init();

    // service public signature
    return {
      // learning path members
      getLearningPaths: getLearningPaths,
      getLearningPath: getLearningPath,
      createLearningPath: createLearningPath,
      deleteLearningPath: deleteLearningPath,
      // learning item members
      getLearningItems: getLearningItems,
      getLearningItemsForLearningPath: getLearningItemsForLearningPath,
      getLearningItem: getLearningItem,
      createLearningItem: createLearningItem,
      deleteLearningItem: deleteLearningItem,

      // shared
      saveChanges: saveChanges,
      revertChanges: revertChanges
    };

    // init service
    function init() {
      // get reference to the breeze metadata store
      metadataStore = breezeEntities.metadataStore;

      // get references to the two types
      learningItemType = metadataStore.getEntityType('LearningItem');
      learningPathType = metadataStore.getEntityType('LearningPath');

      // define instance of the entity manager
      manager = new breeze.EntityManager({
        dataService: breezeConfig.dataservice,
        metadataStore: metadataStore
      });

      common.logger.log("service loaded", null, serviceId);
    }

    // retrieve all learning paths
    function getLearningPaths() {
      return breeze.EntityQuery
      .from(learningPathType.defaultResourceName)
      .using(manager)
      .execute()
      .then(function (data) {
        return data.results;
      });
    }

    // gets a specific learning path
    function getLearningPath(id) {
      // first try to get the data from the local cache, but if not present, grab from server
      return manager.fetchEntityByKey('LearningPath', id, true)
      .then(function (data) {
        common.logger.log('fetched learning path from ' + (data.fromCache ? 'cache' : 'server'), data);
        return data.entity;
      });
    }

    // creates a new learning path
    function createLearningPath(initialValues) {
      return manager.createEntity(learningPathType, initialValues);
    }

    // deletes a learning path
    function deleteLearningPath(learningPath) {
      // could possibly have this also delete the children items related to this
      //  but you need to consider what happens with the local cache... if 
      //  sharepoint automatically deletes the children, your biz logic should handle it
      learningPath.entityAspect.setDeleted();
      return saveChanges();
    }

    // retrieve all learning paths, using ngHttp service
    function getLearningItems() {
      return breeze.EntityQuery
      .from(learningItemType.defaultResourceName)
      .using(manager)
      .execute()
      .then(function (data) {
        return data.results;
      });
    }

    // retrieve learning items for a specific path
    function getLearningItemsForLearningPath(learningPathId) {
      // get learning path (hopefully from cache)...
      return getLearningPath(learningPathId)
        .then(function () {
          // query that always works
          var query = breeze.EntityQuery
             .from(learningItemType.defaultResourceName)
             .where('LearningPath.Id', 'eq', learningPathId)
             .select(learningItemType.custom.defaultSelect + ',LearningPath.Id')
             .expand('LearningPath');

          // query that works in Office365 / SPO and versions of SharePoint 2013
          //  that have XXX 201X applied (this CU includes a bugfix)
          //var query = breeze.EntityQuery
          //  .from(learningItemType.defaultResourceName)
          //  .where('LearningPathId', 'eq', learningPathId);

          return manager.executeQuery(query)
            .then(function (data) {
              return data.results;
            });
        });
    }

    // gets a specific learning item
    function getLearningItem(id) {
      // first try to get the data from the local cache, but if not present, grab from server
      return manager.fetchEntityByKey('LearningItem', id, true)
        .then(function (data) {
          common.logger.log('fetched learning item from ' + (data.fromCache ? 'cache' : 'server'), data);
          return data.entity;
        });
    }

    // creates a new learning item
    function createLearningItem(initialValues) {
      return manager.createEntity(learningItemType, initialValues);
    }

    // saves all changes
    function saveChanges() {
      // save changes
      return manager.saveChanges()
        .then(function (result) {
          if (result.entities.length == 0) {
            common.logger.logWarning('Nothing saved.');
          } else {
            common.logger.logSuccess('Saved changes.');
          }
        })
        .catch(function (error) {
          $q.reject(error);
          common.logger.logError('Error saving changes', error, serviceId);
        });
    }

    // reverts all changes back to their original state
    function revertChanges() {
      return manager.rejectChanges();
    }

    // deletes a learning item
    function deleteLearningItem(learningItem) {
      learningItem.entityAspect.setDeleted();
      return saveChanges();
    }
  }
})();