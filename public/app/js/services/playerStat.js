angular.module('NbaScraper')
  .factory('playerStat', ['$http', function($http){
    return {
      searchPlayerStat: function(player, callback){
        $http.post('/search', { "data":  player })
          .success(callback);
      }
    }
  }])