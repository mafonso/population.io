(function () {
    'use strict';

    angular.module('populationioApp')
      .directive('deathChart', ['$filter', '$translate', 'PopulationIOService', 'HelloWords', '$timeout', 'ProfileService',
          function ($filter, $translate, PopulationIOService, HelloWords, $timeout, ProfileService) {
              return {
                  restrict: 'E',
                  link: function ($scope, element) {
                      var chart,
                        xAxis, yAxis,
                        parentWidth = element[0].clientWidth,
                        pointerPerson, pointerWorld, pointerCountry,
                        actionBox,
                        verticalPointerLine,
                        personAreaWorld, personAreaCountry,
                        parentHeight = 240,
                        yAxisFormat = d3.format('.0%'),
                        ageFormat = d3.format('.2f'),
                        xRange = d3.scale.linear(),
                        yRange = d3.scale.linear().nice(),
                        line = d3.svg.line(),
                        area = d3.svg.area(),
                        age,
                        areaCountry, areaWorld,
                        areaLine,
                        xAxisElement, yAxisElement,
                        xLabel, yLabel, someLabel, worldLabel, worldLabel2,
                        xLabelLine, yLabelLine,
                        tooltip = d3.select('.chart-tooltip'),
                        fullData
                        ;

                      _initChart();

                      $scope.$on('languageChange', function () {
                        xLabel.text($translate.instant('DEATH_CHART_AXIS_X'));
                        yLabel.text($translate.instant('DEATH_CHANCES_OF_DYING'));
                        yLabel.text(function () {
                            if ($scope.type === 'distribution') {
                                return $translate.instant('DEATH_CHANCES_OF_DYING');
                            }
                            else {
                                return $translate.instant('DEATH_CHART_AXIS_Y');
                            }
                        });
                        someLabel.text($translate.instant('DEATH_CHART_YOUR_AGE'));
                        pointerWorld.select('.region').text($translate.instant('SUMMARY_WORLD'));
                        pointerWorld.select('.age').text(function () {
                          return $filter('number')($scope.totalLifeWorldInYears, 1) + ' ' + $translate.instant('LOCAL_YEARS')
                        });
                        pointerCountry.select('.region').text($translate.instant(ProfileService.country));
                        pointerCountry.select('.age').text(function () {
                          return $filter('number')($scope.totalLifeCountryInYears, 1) + ' ' + $translate.instant('LOCAL_YEARS')
                        });
                      });

                      $scope.$on('mortalityDistributionDataChanged', function (e, data) {
                          fullData = data;
                          $timeout(function () {
                              age = ProfileService.getAge();
                              _updateChart({world: data.worldDistribution, country: data.countryDistribution})
                          }, 0);
                      });
                      $scope.$watch('type', function (newVal, oldVal) {
                          if (newVal === 'distribution' && fullData) {
                              _updateChart({world: fullData.worldDistribution, country: fullData.countryDistribution})
                          }
                          else if (newVal === 'chances') {
                              _updateChart({world: fullData.worldChances, country: fullData.countryChances})
                          }
                      });

                      function _initChart() {
                          chart = d3.select(element[0])
                            .append('svg')
                            .attr({width: parentWidth, height: parentHeight + 200})
                            .append('g')
                            .attr({
                                class: 'death-chart',
                                transform: 'translate(0,180)'
                            })
                          ;

                          xAxis = d3.svg.axis()
                            .scale(xRange)
                          yAxis = d3.svg.axis()
                            .scale(yRange)
                            .tickSize(5)
                            .orient('left')
                          ;
                          areaCountry = chart.append('path');
                          areaWorld = chart.append('path');
                          areaLine = chart.append('path');
                          chart.select('.x-label').remove();
                          chart.select('.y-label').remove();
                          chart.select('.label-line').remove();
                          chart.select('.vertical-pointer').remove();
                          xLabel = chart.append('text')
                            .text($translate.instant('DEATH_CHART_AXIS_X'))
                            .attr(
                            {
                                class: 'x-label',
                                transform: 'translate(' + [parentWidth - 100, parentHeight - 50 + 16] + ')'
                            })
                            .style(
                            {
                                'text-anchor': 'end'
                            });
                          xLabelLine = chart.append('line')
                            .attr({
                                class: 'label-line',
                                x1: parentWidth - 200,
                                y1: parentHeight - 50,
                                x2: parentWidth - 70,
                                y2: parentHeight - 50
                            })
                            .style({
                                stroke: '#d9d9d9',
                                'stroke-width': 1
                            });
                          yLabel = chart.append('text')
                            .text($translate.instant('DEATH_CHANCES_OF_DYING'))
                            .attr(
                            {
                                class: 'y-label',
                                transform: 'translate(' + [110, -20] + ') rotate(-90)'
                            })
                            .style(
                            {
                                'text-anchor': 'start'
                            });

                          yLabelLine = chart.append('line')
                            .attr({
                                class: 'label-line',
                                x1: 120,
                                y1: -130,
                                x2: 120,
                                y2: 0
                            })
                            .style({
                                stroke: '#d9d9d9',
                                'stroke-width': 1
                            });

                          xAxisElement = chart.append('g');
                          yAxisElement = chart.append('g');

                          pointerPerson = chart.append('g').attr({class: 'pointer'})
                            .attr({transform: 'translate(-200,0)'});
                          pointerPerson.append('line')
                            .attr({
                                x1: 0,
                                y1: -30,
                                x2: 0,
                                y2: 30
                            })
                            .style({
                                stroke: '#dedede',
                                'stroke-width': '1px'

                            });
                          pointerPerson.append('circle')
                            .attr({
                                r: 3,
                                cy: -30
                            })
                            .style({
                                fill: '#333'
                            });

                          someLabel = pointerPerson.append('text')
                            .style({
                                fill: '#333',
                                'text-anchor': 'start'
                            })
                            .attr({
                                class: 'region',
                                dx: 10,
                                dy: 10
                            })
                            .text($translate.instant('DEATH_CHART_YOUR_AGE'))
                          ;
                          pointerPerson.append('text')
                            .style({
                                'font-size': '9pt',
                                fill: '#666',
                                'text-anchor': 'start'
                            })
                            .attr({
                                class: 'age',
                                dx: 10,
                                dy: 25
                            })
                          ;

                          pointerWorld = chart.append('g').attr({class: 'pointer'}).attr({transform: 'translate(-200,0)'});
                          pointerWorld.append('line')
                            .attr({
                                x1: 0,
                                y1: 0,
                                x2: 0,
                                y2: parentHeight + 50,
                                'stroke-dasharray': '2,2'
                            })
                            .style({
                                stroke: '#888',
                                'stroke-width': '1px'

                            });
                          worldLabel = pointerWorld.append('text')
                            .style({
                                fill: '#98EC79',
                                'text-anchor': 'start'
                            })
                            .attr({
                                class: 'region',
                                dx: 10,
                                dy: 10
                            })
                            .text($translate.instant('SUMMARY_WORLD'))
                          ;

                          worldLabel2 = pointerWorld.append('text')
                            .style({
                                'font-size': '9pt',
                                fill: '#666',
                                'text-anchor': 'start'
                            })
                            .attr({
                                class: 'age',
                                dx: 10,
                                dy: 25
                            })
                            .text($translate.instant('SUMMARY_WORLD'))
                          ;

                          pointerCountry = chart.append('g').attr({class: 'pointer'}).attr({transform: 'translate(-200,0)'});
                          pointerCountry.append('line')
                            .attr({
                                x1: 0,
                                y1: 0,
                                x2: 0,
                                y2: parentHeight + 10,
                                'stroke-dasharray': '2,2'
                            })
                            .style({
                                stroke: '#888',
                                'stroke-width': '1px'

                            });
                          pointerCountry.append('text')
                            .style({
                                fill: '#6581f1',
                                'text-anchor': 'start'
                            })
                            .attr({
                                class: 'region',
                                dx: 10,
                                dy: 10
                            })
                          ;
                          pointerCountry.append('text')
                            .style({
                                'font-size': '9pt',
                                fill: '#666',
                                'text-anchor': 'start'
                            })
                            .attr({
                                class: 'age',
                                dx: 10,
                                dy: 25
                            })
                          ;

                          actionBox = chart.append('rect')
                            .style({
                                fill: 'red',
                                opacity: 0
                            })
                            .attr({
                                transform: 'translate(120,-150)',
                                width: parentWidth - 280,
                                height: 340
                            })
                          ;

                          actionBox
                            .on('mouseenter', _showTooltip)
                            .on('mousemove', function () {
                                var mouse = d3.mouse(this);
                                var ageFormatted = $filter('number')(xRange.invert(mouse[0] + 120), 2);

                                var yPositionWorld = _.find(personAreaWorld, function (item, i) {
                                    return item.age >= xRange.invert(mouse[0] + 120) - 5;
                                }).mortality_percent;

                                var yPositionCountry = _.find(personAreaCountry, function (item, i) {
                                    return item.age >= xRange.invert(mouse[0] + 120) - 5;
                                }).mortality_percent;

                                var deathRateWorld = $filter('number')(yPositionWorld, 2);
                                var deathRateCountry = $filter('number')(yPositionCountry, 2);
                                tooltip.html(function (d, i) {
                                      return '<p><span class="tooltip-label">Age:</span><span class="tooltip-value">' + ageFormatted + ' years</span></p>'
                                        + '<p><span class="tooltip-label">World:</span><span class="tooltip-value">' + deathRateWorld + '%</span></p>'
                                        + '<p><span class="tooltip-label">' + $translate.instant(ProfileService.country) + ':</span>'
                                        + '<span class="tooltip-value">' + deathRateCountry + '%</span></p>'
                                        ;
                                  }
                                );
                                tooltip
                                  .style("left", (d3.event.pageX - 100) + "px")
                                  .style("top", (d3.event.pageY - d3.mouse(this)[1]) + "px");

                            }
                          )
                            .on('mouseleave', _hideTooltip);

                          function _showTooltip() {
                              tooltip
                                .attr({class: 'chart-tooltip death'})
                                .transition()
                                .duration(200)
                                .style({
                                    display: 'block',
                                    opacity: 0.9
                                });
                          }

                          function _hideTooltip() {
                              tooltip
                                .transition()
                                .duration(200)
                                .style("opacity", 0)
                                .each('end', function () {
                                    d3.select(this)
                                      .style({display: 'none'})
                                      .attr({class: 'chart-tooltip'})
                                })
                              ;
                          }

                      }

                      function _updateChart(data) {
                          personAreaCountry = _.filter(data.country, function (item) {
                              return item.age >= age - 5;

                          });
                          personAreaWorld = _.filter(data.world, function (item) {
                              return item.age >= age - 5;

                          });
                          var worldMax = d3.max(personAreaWorld, function (d) { return d.mortality_percent; });
                          var countryMax = d3.max(personAreaCountry, function (d) { return d.mortality_percent; });

                          var yTickStep = d3.max([worldMax, countryMax]) / 3; // To have 4 ticks total for y axis
                          xAxis.tickFormat(function (d) {return d + 'y'})
                          yAxis.tickFormat(function (d) {return yAxisFormat(d / 100)})
                            .tickValues([0, yTickStep, yTickStep * 2, d3.max([worldMax, countryMax])])

                          xRange.range([120, parentWidth - 160]).domain([d3.min(personAreaCountry, function (d) { return d.age; }), d3.max(personAreaCountry, function (d) { return d.age; })]).nice([0, 25, 50, 55, 60, 75, 100, 125]);
                          yRange.range([parentHeight - 50, 0]).domain([0, d3.max([worldMax, countryMax])]);


                          line
                            .x(function (d) {
                                return xRange(d.age);
                            })
                            .y(function (d) {
                                return yRange(d.mortality_percent);
                            })
                            .interpolate('linear')
                          ;
                          area
                            .x(function (d) { return xRange(d.age); })
                            .y0(parentHeight - 50)
                            .y1(function (d) { return yRange(d.mortality_percent); })
                              // .interpolate('step-after')
                          ;

                          areaCountry
                            .attr('fill', function () {
                                if ($scope.type == 'distribution') {
                                    return '#6581f1'
                                }
                                else {
                                    return 'transparent'
                                }
                            })
                            .attr('stroke', function () {
                                if ($scope.type == 'distribution') {
                                    return 'transparent'
                                }
                                else {
                                    return '#6581f1'
                                }
                            })
                            .attr('stroke-width', function () {
                                if ($scope.type == 'distribution') {
                                    return 0
                                }
                                else {
                                    return 5
                                }
                            })
                            .transition()
                            .attr('d', function () {
                                if ($scope.type === 'distribution') {
                                    return area(personAreaCountry)
                                }
                                else {
                                    return line(personAreaCountry)
                                }
                            });

                          areaWorld
                            .attr('fill', function () {
                                if ($scope.type == 'distribution') {
                                    return '#98EC79'
                                }
                                else {
                                    return 'transparent'
                                }
                            })
                            .attr('stroke', function () {
                                if ($scope.type == 'distribution') {
                                    return 'transparent'
                                }
                                else {
                                    return '#98EC79'
                                }
                            })

                            .attr('stroke-width', function () {
                                if ($scope.type == 'distribution') {
                                    return 0
                                }
                                else {
                                    return 5
                                }
                            })
                            .transition()
                            .attr('d', function () {
                                if ($scope.type === 'distribution') {
                                    return area(personAreaWorld)
                                }
                                else {
                                    return line(personAreaWorld)
                                }
                            })
                            .style({opacity: 0.5});

                          /* highlight-blue */

                          areaLine
                            .transition()
                            .attr('d', line(data))
                              //.attr('stroke', '#66666F')
                              //.attr('stroke-width', 3)
                            .attr('fill', 'none');
                          xAxisElement
                            .transition()
                            .attr('class', 'x axis')
                            .attr('transform', 'translate(0,' + (parentHeight - 50) + ')')
                            .call(xAxis);

                          yAxisElement
                            .transition()
                            .attr('class', 'y axis')
                            .attr('transform', 'translate(120,0)')
                            .call(yAxis);

                          pointerWorld
                            .transition()
                            .attr({
                                transform: 'translate(' + [xRange($scope.totalLifeWorldInYears), -100] + ')'
                            });

                          pointerWorld.select('.age')
                            .transition()
                            .text(function () {
                                return $filter('number')($scope.totalLifeWorldInYears, 1) + ' ' + $translate.instant('LOCAL_YEARS')
                            });

                          pointerCountry
                            .transition()
                            .attr({
                                transform: 'translate(' + [xRange($scope.totalLifeCountryInYears), -60] + ')'
                            });

                          pointerCountry.select('.region').text($translate.instant(ProfileService.country));

                          pointerCountry.select('.age')
                            .transition()
                            .text(function () {
                                return $filter('number')($scope.totalLifeCountryInYears, 1) + ' ' + $translate.instant('LOCAL_YEARS')
                            })
                          pointerPerson.select('.age').text(age + ' ' + $translate.instant('LOCAL_YEARS'))

                          pointerPerson
                            .transition()
                            .attr({
                                transform: 'translate(' + [xRange(age), parentHeight - 20] + ')'
                            });
                          yLabel.text(function () {
                              if ($scope.type === 'distribution') {
                                  return $translate.instant('DEATH_CHANCES_OF_DYING')
                              }
                              else {
                                  return $translate.instant('DEATH_CHART_AXIS_Y')
                              }
                          });
                          yLabelLine
                            .transition()
                            .attr({
                                y1: function () {
                                    if ($scope.type === 'distribution') {
                                        return -130
                                    }
                                    else {
                                        return -180
                                    }

                                }
                            })


                      }
                  }
              };
          }]);
}());
