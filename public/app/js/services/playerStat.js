angular.module('NbaScraper')
  .factory('PlayerStat', function($http) {
    return {
      searchPlayer: function(playerName, successCallback, errorCallback) {
        $http.post('/search', playerName)
          .success(successCallback)
          .error(errorCallback);
      },
      scrapePlayer: function(name_key, successCallback, errorCallback) {
        $http.post('/scrape', name_key)
          .success(successCallback)
          .error(errorCallback);
      }
    };
});