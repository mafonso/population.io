(function () {
    'use strict';

    angular.module('populationioApp')
      .directive('summaryChart', ['$filter', 'ProfileService', 'PopulationIOService', 'HelloWords', '$timeout',
          function ($filter, ProfileService, PopulationIOService, HelloWords, $timeout) {
              return {
                  restrict: 'E',
                  link: function ($scope, element) {
                      var chart,
                        xAxis, yAxis,
                        actionBox,
                        parentWidth = element[0].clientWidth,
                        currentData, pointer,
                        parentHeight = 240,
                        yAxisFormat = d3.format('s'),
                        xRange = d3.scale.linear(),
                        yRange = d3.scale.linear().nice(),
                        line = d3.svg.line(),
                        area = d3.svg.area(),
                        age = 0,
                        areaTotal, areaLine,
                        areaYounger,
                        xAxisElement, yAxisElement,
                        xLabel, yLabel, yLabelText, xLabelText,
                        xLabelLine, yLabelLine,
                        tooltip = d3.select('.chart-tooltip');

                      _initChart();
                      $scope.$watch('region', function (newVal) {
                          if (newVal === 'World' && $scope.worldPopulationData) {
                              _updateChart($scope.worldPopulationData);
                          }
                          else if (newVal !== 'World' && $scope.countryPopulationData) {
                              _updateChart($scope.countryPopulationData);
                          }
                      });

                      $scope.$on('worldPopulationDataChanged', function (e, population) {
                          $timeout(function () {
                              age = ProfileService.getAge();
                              _updateChart(population);
                          }, 2000);
                      });
                      if (ProfileService.rankGlobal > -1) {
                        $scope.rankGlobal = ProfileService.rankGlobal;
                      }
                      if (ProfileService.rankLocal > -1) {
                        $scope.rankLocal = ProfileService.rankLocal;
                      }
                      $scope.$on('rankGlobalChanged', function (e, rank) {
                          $scope.rankGlobal = rank;

                          if ($scope.region == 'World' && $scope.worldPopulationData) {
                              _updateChart($scope.worldPopulationData)
                          }
                          else if ($scope.region != 'World' && $scope.countryPopulationData) {
                              _updateChart($scope.countryPopulationData)
                          }

                      });
                      $scope.$on('countryPopulationDataChanged', function (e, population) {
                          age = ProfileService.getAge();
                          _updateChart(population);
                      });

                      function _initChart() {
                          chart = d3.select(element[0])
                            .append('svg')
                            .attr({width: parentWidth, height: parentHeight + 100})
                            .append('g')
                            .attr({
                                class: 'summary-chart',
                                transform: 'translate(0,80)'
                            })
                          ;

                          xAxis = d3.svg.axis()
                            .scale(xRange)
                            .tickSize(5)
                            .tickValues([0, 25, 50, 75, 100, 125, 150]);
                          yAxis = d3.svg.axis()
                            .scale(yRange)
                            .tickSize(5)
                            .orient('left')
                          ;
                          areaTotal = chart.append('path');
                          areaYounger = chart.append('path');
                          areaLine = chart.append('path');
                          chart.select('.x-label').remove();
                          chart.select('.y-label').remove();
                          chart.select('.label-line').remove();

                          xLabelText = $filter('translate')('SUMMARY_CHART_AXIS_X');
                          xLabel = chart.append('text')
                            .text(xLabelText)
                            .attr(
                            {
                                class: 'x-label',
                                transform: 'translate(' + [parentWidth - 100, parentHeight - 100 + 16] + ')'
                            })
                            .style(
                            {
                                'text-anchor': 'end'
                            });
                          xLabelLine = chart.append('line')
                            .attr({
                                class: 'label-line',
                                x1: parentWidth - 200,
                                y1: parentHeight - 100,
                                x2: parentWidth - 70,
                                y2: parentHeight - 100
                            })
                            .style({
                                stroke: '#d9d9d9',
                                'stroke-width': 1
                            });

                            yLabelText = $filter('translate')('SUMMARY_CHART_AXIS_Y');

                            yLabel = chart.append('text')
                              .text(yLabelText)
                              .attr(
                              {
                                  class: 'y-label',
                                  transform: 'translate(' + [110, -20] + ')'
                              })
                              .style(
                              {
                                  'text-anchor': 'end'
                              });


                          yLabelLine = chart.append('line')
                            .attr({
                                class: 'label-line',
                                x1: 120,
                                y1: -40,
                                x2: 120,
                                y2: 0
                            })
                            .style({
                                stroke: '#d9d9d9',
                                'stroke-width': 1
                            });

                          xAxisElement = chart.append('g');
                          yAxisElement = chart.append('g');
                          pointer = chart.append('g').attr({class: 'pointer'});
                          pointer.append('line')
                            .attr({
                                x1: 0,
                                y1: 10,
                                x2: 0,
                                y2: 0
                            })
                            .style({
                                stroke: '#333',
                                'stroke-width': '1px'

                            })
                          ;
                          pointer.append('text')
                            .style({
                                fill: '#333',
                                'text-anchor': 'middle'
                            })
                          ;
                          pointer.append('circle').attr({
                              r: 6
                          })
                            .attr('stroke-width', 2)
                            .style({
                                fill: 'black',
                                stroke: 'white'
                            });
                          actionBox = chart.append('rect')
                            .style({
                                fill: 'red',
                                opacity: 0
                            })
                            .attr({
                                transform: 'translate(120,-40)',
                                width: parentWidth - 280,
                                height: 180
                            })
                          ;


                          actionBox
                            .on('mouseenter', _showTooltip)
                            .on('mousemove', function () {
                                var mouse = d3.mouse(this);
                                var currentAgeObject = _.find(currentData, function (item) {
                                    return item.age == parseInt(xRange.invert(mouse[0] + 120), 10)
                                });
                                var ageFormatted = $filter('number')(parseInt(xRange.invert(mouse[0] + 120), 10), 0);
                                var populationFormatted = $filter('number')(currentAgeObject.total, 0);
                                tooltip.html(function (d, i) {
                                      return "<p><span class='tooltip-label'>Age:</span><span class='tooltip-value'>" + ageFormatted + " years</span></p>"
                                        + "<p><span class='tooltip-label'>Population:</span><span class='tooltip-value'>" + populationFormatted + "</span></p>";
                                  }
                                );
                                tooltip
                                  .style("left", (d3.event.pageX - 100) + "px")
                                  .style("top", (d3.event.pageY - d3.mouse(this)[1] - 80) + "px");

                            }
                          )
                            .on('mouseleave', _hideTooltip);

                          function _showTooltip() {
                              tooltip
                                .attr({class: 'chart-tooltip summary'})
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
                          currentData = data;
                          var ticks = [], step;
                          step = $scope.region != 'World' ? 500000 : 50000000;
                          if ($scope.country != 'World' && d3.max(data, function (d) { return d.total; }) <= 500000000) {
                              step = Math.ceil(d3.max(data, function (d) { return d.total; }) / 1000000) * 1000000
                          }
                          if ($scope.region != 'World' && d3.max(data, function (d) { return d.total; }) <= 500000) {
                              step = Math.ceil(d3.max(data, function (d) { return d.total; }) / 100000) * 100000
                          }
                          if ($scope.region != 'World' && d3.max(data, function (d) { return d.total; }) <= 2000) {
                              step = Math.ceil(d3.max(data, function (d) { return d.total; }) / 200) * 200
                          }
                          for (var i = 0; i < d3.max(data, function (d) { return d.total; }) + step; i = i + step) {
                              ticks.push(i)
                          }
                          xAxis.tickFormat(function (d) {return d + 'y'});
                          yAxis.tickFormat(function (d) {return yAxisFormat(d).replace('k', 'K')})
                            .tickValues(ticks);

                          xRange.range([120, parentWidth - 160]).domain([0, d3.max(data, function (d) { return d.age; })]);
                          yRange.range([parentHeight - 100, 0]).domain([0, ticks[ticks.length - 1]]);


                            yLabelText = $filter('translate')('SUMMARY_CHART_AXIS_Y');
                            yLabel.text(yLabelText);

                            xLabelText = $filter('translate')('SUMMARY_CHART_AXIS_X');
                            xLabel.text(xLabelText);

                          line
                            .x(function (d) {
                                return xRange(d.age);
                            })
                            .y(function (d) {
                                return yRange(d.total);
                            })
                            .interpolate('linear');
                          area
                            .x(function (d) { return xRange(d.age); })
                            .y0(parentHeight - 100)
                            .y1(function (d) { return yRange(d.total); });
                          var younger = data.slice(0, age+1);

                          areaTotal
                            .datum(data)
                            .transition()
                            .attr('d', area(data))
                            .attr('fill', '#EBEBEB');

                          areaYounger
                            .transition()
                            .attr('d', area(younger))
                            .attr('fill', '#6581F1');
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
                            .attr('transform', 'translate(0,' + (parentHeight - 100) + ')')
                            .call(xAxis);

                          yAxisElement
                            .transition()
                            .attr('class', 'y axis')
                            .attr('transform', 'translate(120,0)')
                            .call(yAxis);
                          pointer
                            .transition()
                            .attr({
                                transform: 'translate(' + [xRange(age), -40] + ')'
                            });
                          var totalOfAge = data !== undefined && data[age] !== undefined ? data[age].total : 0;
                          pointer.select('line')
                            .transition()
                            .attr({
                                y2: yRange(totalOfAge) + 40
                            });
                          pointer.select('circle')
                            .transition()
                            .attr({
                                cy: yRange(totalOfAge) + 40
                            });
                          pointer.select('text')
                            .text(function () {
                                if ($scope.region != 'World') {

                                    return $filter('number')(Math.min(100, $scope.rankLocal / ($scope.countryPopulation / 100)), '0') + '%'
                                }
                                else {
                                    return $filter('number')(Math.min(100, $scope.rankGlobal / ($scope.worldPopulation / 100)), '0') + '%'
                                }
                            })

                      }

                  }
              };
          }]);
}());
