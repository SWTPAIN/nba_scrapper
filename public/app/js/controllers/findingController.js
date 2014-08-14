angular.module('NbaScraper')
  .controller('FindingController', ['$scope','$http', function($scope, $http) {
    $scope.presentedData = [];
    $scope.teams = {
      atlantic: ["TOR","BRK", "NJN","BOS","NYK","PHI"],
      central: ["IND", "CHI", "CLE", "DET", "MIL"],
      southeast: ["MIA", "WAS", "WSB", "CHA", "ATL", "ORL"],
      northwest: ["OKC", "SEA", "POR", "MIN", "DEN'","UTA"],
      pacific: ["LAC", "GSW", "PHO", "SAC", "LAL"],
      southwest: ["SAS", "HOU", "MEM", "DAL", "NOH"]
    }
    $scope.regions = Object.getOwnPropertyNames($scope.teams)
    $scope.currentRegion = ""
    $scope.rawData = "";

    $scope.setRegion = function(region){
      $scope.currentRegion = region;
      console.log($scope.currentRegion)
    };

    $scope.getData = function (){
      $http.get('/advanced_data')
        .success(function(data, status){
          $scope.rawData = data;
          $scope.currentRegion = "atlantic";
        })
        .error(function(data,status){
          $scope.notification = data ;       
        });
    };

    $scope.$watch('currentRegion', function(newVal, oldVal){
      if( _.isEqual(oldVal, newVal) ) return;
      $scope.presentedData = []
      for (var i=0; i<$scope.teams[newVal].length; i++){
        $scope.presentedData.push(getPresentedData($scope.rawData, $scope.teams[newVal][i]));
      };      
      console.log($scope.presentedData);

    });

    $scope.options = {
              chart: {
                  type: 'scatterChart',
                  height: 350,
                  color: d3.scale.category10().range(),
                  scatter: {
                      onlyCircles: false
                  },
                  showDistX: true,
                  showDistY: true,
                  tooltipContent: function(key,x,y,e) {
                    var d = e.series.values[e.pointIndex];
                    var html = '<div style="opacity: 0.5; font-size: 0.9em;">'+'<h4 style="text-align: center">' + d.name +'</h3>'
                               + '<p>' +'Picked ' + d.pick + ' by ' + key +'</p>'
                               + '<ul>' 
                               + '<li>' + 'Avg Season Minute ' + Math.round(d.mp) +'</li>' 
                               + '<li>' + 'Avg Usage Rate ' + Math.round(d.usg*10)/10 +'</li>' 
                               + '<li>' + 'Avg Off Rate ' + Math.round(d.ortg) +'</li>' 
                               + '<li>' + 'Avg Def Rate ' + Math.round(d.drtg) +'</li>' 
                               + '<li>' + 'Avg Win Share ' + Math.round(d.ws*100)/100 +'</li>' 
                               + '</ul>' 
                               + '</div>';
                    return html
                  },


                  transitionDuration: 350,
                  xAxis: {
                      axisLabel: 'Year',
                      tickFormat: function(d) {
                        return d3.time.format('%Y')(new Date(String(d))); 
                      }
                  },
                  yAxis: {
                      axisLabel: 'Avg Per',
                      tickFormat: function(d){
                          return d3.format('.02f')(d);
                      },
                      axisLabelDistance: 30
                  }
              }
          };

          function getPresentedData(data, team){
            var presentedData = {}, 
                shapes = {
                  G: 'circle',
                  F: 'cross',
                  C: 'triangle-up'
                }
            presentedData.key = team;
            presentedData.values = [];
            players = _.select(data, function(player){
              //filter out unrealisticly high or low data
              var avg_per = getAverageStat(player, 'per')
              if (avg_per < 45 && avg_per > -10){
                return player.pick_team == team
              };
            });
            for (var i=0; i<players.length; i++){
              presentedData.values.push({
                x: players[i].drafted_year,
                y: getAverageStat(players[i], 'per'),
                size: 5- Math.log(players[i].pick), //To scale down the difference
                name: players[i].full_name,
                pick: players[i].pick,
                mp: getAverageStat(players[i], 'mp'),
                usg: getAverageStat(players[i], 'usg'),
                ortg: getAverageStat(players[i], 'ortg'),
                drtg: getAverageStat(players[i], 'drtg'),
                ws: getAverageStat(players[i], 'ws'),
                shape: shapes[players[i].position[1]]

              })
            };
            return presentedData;
          };



          function getAverageStat(player,type){
            var count = 0;
            return _.reduce(player.advanced_stat, function(sum, yearStat){
              if (yearStat[type] == null){
                return sum;
              } else {
                count += 1;
                return sum + yearStat[type];
              }
            },0)/count ;
          }
}]);
