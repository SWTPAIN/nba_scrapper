angular.module('NbaScraper')
  .controller('FindingController', ['$scope','$http', function($scope, $http) {
    $scope.atlanticData = [];
    $scope.teams = {
      atlantic: ["TOR","BRK", "NJN","BOS","NYK","PHI"],
      central: ["IND", "CHI", "CLE", "DET", "MIL"],
      southeast: ["MIA", "WAS", "WSB", "CHA", "ATL", "ORL"],
      northwest: ["OKC", "SEA", "POR", "MIN", "DEN'","UTA"],
      pacific: ["LAC", "GSW", "PHO", "SAC", "LAL"],
      southwest: ["SAS", "HOU", "MEM", "DAL", "NOH"]
    }
    $scope.rawData = "";

    $scope.getData = function (){
      $http.get('/advanced_data')
        .success(function(data, status){
          $scope.rawData = data;
        })
        .error(function(data,status){
          $scope.notification = data ;       
        });
    };

    $scope.$watch('rawData', function(newVal, oldVal){
      if( _.isEqual(oldVal, newVal) ) return;
      for (var i=1; i<$scope.teams.atlantic.length  ; i++){
        console.log(getPresentedData($scope.rawData, $scope.teams.atlantic[i]));
        $scope.atlanticData.push(getPresentedData($scope.rawData, $scope.teams.atlantic[i]));
      };
    })

    $scope.options = {
              chart: {
                  type: 'scatterChart',
                  height: 500,
                  color: d3.scale.category10().range(),
                  scatter: {
                      onlyCircles: false
                  },
                  showDistX: true,
                  showDistY: true,
                  tooltipContent: function(key,x,y,e) {
                    var d = e.series.values[e.pointIndex];
                    return '<h3>' + d.name + " (" +key + ")"+'</h3>';
                  },
                  transitionDuration: 350,
                  xAxis: {
                      axisLabel: 'Year',
                      tickFormat: function(d) {
                        return d3.time.format('%Y')(new Date(String(d))); 
                      }
                      // tickFormat: function(d){
                      //     return d3.format('.02f')(d);
                      // }
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

          // $scope.data = generateData(1,40);

          /* Random Data Generator (took from nvd3.org) */
          function generateData(groups, points) {
              var data = [],
                  shapes = ['circle', 'cross', 'triangle-up', 'triangle-down', 'diamond', 'square'],
                  random = d3.random.normal();

              for (var i = 0; i < groups; i++) {
                  data.push({
                      key: 'Group ' + i,
                      values: []
                  });

                  for (var j = 0; j < points; j++) {
                      data[i].values.push({
                          x: random()
                          , y: random()
                          , size: Math.random()
                          , shape: shapes[j % 6]
                      });
                  }
              }
              return data;
          }

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
              return player.pick_team == team
            });
            for (var i=0; i<players.length; i++){
              presentedData.values.push({
                x: players[i].drafted_year,
                y: getAverageStat(players[i], 'per'),
                size: 5- Math.log(players[i].pick), //To scale down the difference
                name: players[i].full_name,
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
