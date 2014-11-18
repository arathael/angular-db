var dbService = angular.module('dbService', []);

dbService.provider('db', function() {
  var self = this;
  var options = null;

  this.config = function(options) {
    this.options = options;
  };

  this.$get = function($rootScope, $q) {
    var deferred = $q.defer();
    // TODO: this.options || default
    var request = db.open(this.options);
    var server = null;
    var objectStore = null;

    request.then(function(s) {
      server = s;
      deferred.resolve();
      if ( ! $rootScope.$$phase) $rootScope.$apply();
    });

    var execute = function(transactionFunction) {
      if ( ! server) {
        deferred.promise.then(function() {
          transactionFunction(server);
        });
      } else {
        transactionFunction(server);
      }
    };

    var get = function(key, value, onSuccess, onError) {
      execute(function(connection) {
        connection[self.objectStore]
          .query()
          .filter(key, value)
          .execute()
          .then(function(array) {
            if (typeof onSuccess === 'function') onSuccess(array);
            if ( ! $rootScope.$$phase) $rootScope.$apply();
          });
      });
    };

    var putBatch = function(array, onSuccess, onError) {
      execute(function(connection) {
        connection[self.objectStore]
          .update.apply(null, array)
          .then(function(array) {
            if (typeof onSuccess === 'function') onSuccess(array);
            if ( ! $rootScope.$$phase) $rootScope.$apply();
          });
      });
    };

    var getBatch = function(onSuccess, onError) {
      execute(function(connection) {
        connection[self.objectStore]
          .query()
          .filter()
          .execute()
          .then(function(array) {
            if (typeof onSuccess === 'function') onSuccess(array);
            if ( ! $rootScope.$$phase) $rootScope.$apply();
          });
      });
    };

    var service = function(objectStore) {
      self.objectStore = objectStore;
      return {
        get: get,
        putBatch: putBatch,
        getBatch: getBatch
      }
    };

    return service;
  };
});
