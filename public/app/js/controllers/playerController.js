angular.module('NbaScraper')
  .controller('PlayerController', ['$scope', '$rootScope', '$http', 'toaster', 'PlayerStat', function($scope, $rootScope, $http ,toaster, PlayerStat){
    $scope.playerName = "";
    $scope.playerData = {};
    $scope.totalData = [];
    $scope.presentedData =[]; //initial values
    $scope.currentStatType = {name: 'Point', shortName: 'pts'}
    $scope.isProcessing = false;
    $scope.options = generateOptions();
    $scope.statTypes = [
      {name: 'Point', shortName: 'pts'},
      {name: 'Assist', shortName: 'ast'},
      {name: 'Rebound', shortName: 'reb'},
      {name: 'Steal', shortName: 'stl'},
      {name: 'Block', shortName: 'blk'},
      {name: 'Free Point', shortName: 'ft'},
      {name: 'Plus Minus', shortName: 'plus_minus'}
    ];

    $scope.setStatType = function(type){
      $scope.currentStatType = type;
    };

    $scope.searchPlayer = function(playerName){
      $scope.isProcessing = true;      
      PlayerStat.searchPlayer(playerName, function(data,status){
        $scope.player_namelist = data;
        $scope.isProcessing = false;      
        },
        function(data,status){
          $scope.isProcessing = false;
          $scope.notification = data
      });
    };

    $scope.scrapePlayer = function(name_key){
      if (name_key == null || $scope.isProcessing) return;
      $scope.isProcessing = true;
      PlayerStat.scrapePlayer(name_key, function(data,status){
        $scope.playerData = data;
        $scope.isProcessing = false;     
        },
        function(data,status){
          $scope.isProcessing = false;
          $scope.notification = data
      });
    };

  $scope.$watch('playerData', function(newVal, oldVal){
    if( _.isEqual(oldVal, newVal) ) return;
    $scope.totalData.push(newVal);
    $scope.presentedData.push(toAnotherType(newVal, $scope.currentStatType.shortName))
  });

  $scope.$watch('currentStatType', function(newVal, oldVal){
    if( _.isEqual(oldVal, newVal) ) return;
    $scope.presentedData = getPresentedData($scope.totalData, $scope.currentStatType.shortName)
    $scope.options = generateOptions();
  });

  $scope.$watch('totalData', function(newVal, oldVal){
    if( _.isEqual(oldVal, newVal) ) return;
    $scope.totalData.push(newVal);   
  });

  $scope.$watch('notification', function(newVal, oldVal){
    if(oldVal == newVal) return;
    $scope.pop();
  });

  $scope.pop = function(){
    toaster.pop('error', "Error", $scope.notification, 6000);
  };

  function generateOptions(){
    return {
            chart: {
              type: 'scatterChart',
              height: 350,
              margin : {
                  top: 20,
                  right: 20,
                  bottom: 40,
                  left: 55
              },
              x: function(d){ return d.x; },
              y: function(d){ return d.y; },
              useInteractiveGuideline: true,
              xAxis: {
                  axisLabel: 'Age',
                  tickFormat: function(d){
                      return d3.format(',.2f')(d);
                  }
              },
              yAxis: {
                  axisLabel: $scope.currentStatType.name,
                  tickFormat: function(d){
                      return d3.format(',.2f')(d);
                  },
                  axisLabelDistance: 30
              },
              transitionDuration: 500,
              interpolate: 'linear'
            },
            title: {
              enable: true,
              text: 'Player Stat'
            },
            subtitle: {
              enable: true,
              text: $scope.currentStatType.name + ' aganist age',
              css: {
                'text-align': 'center',
                'margin': '10px 13px 0px 7px'
              }
            },
            caption: {
              enable: true,
              html: '<b>Reference:</b> http://www.basketball-reference.com<br/> <p>Have an idea for exploring data? Send me a email! kafaicoder@gmail.com<p>',
              css: {
                'text-align': 'justify',
                'text-font': '10px',
                'margin': '10px 13px 0px 7px'
              }
            }
           };
  };

  function getPresentedData(data, type){
    var output_data = [];
    for (var i=0; i<data.length; i++){
      output_data.push(toAnotherType(data[i], type));
    }
    return output_data
  };

  function toAnotherType(player_stat, type){
    var totalYears = [];
    var totalgames = player_stat.games_stat;

    var games = totalgames;
    if (type == 'reb') {
      for ( var i=0; i<games.length-1; i++){
        totalYears.push({
          x:  games[i].age*1,
          y:  games[i]['orb']*1 + games[i]['drb']*1             
        })
      };
    } else {
      for ( var i=0; i<games.length-1; i++){
        totalYears.push({
          x:  games[i].age*1,
          y:  games[i][type]*1             
        })
      };
    };

    return {
        values: totalYears,
        key: player_stat.full_name,
        color: getRandomColor()
    }
  };

  function getRandomColor(){
    var letters = '0123456789ABCDEF'.split('');
    var color = '#'
    for (var i=0; i<6; i++){
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

}]);