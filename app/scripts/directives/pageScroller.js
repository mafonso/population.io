(function () {
  'use strict';

  angular.module('populationioApp')
    .directive('page-scroller', function () {
      return {
        restrict: 'E',
        link: function ($scope, element) {
          var width = 380,
            height = 80,
            handleRadius = 11,
            range = 40,
            margin = 30,
            currentYear = parseInt((new Date()).getFullYear(), 0);

          var data = [];
          for (var i=(currentYear-range); i<=currentYear; i+=1) {
            data.push({
              year: i
            });
          }

          var x = d3.scale.linear()
            .domain([
              d3.min(data, function(d) { return d.year; }),
              d3.max(data, function(d) { return d.year; })
            ])
            .range([0, width - (margin*2)]);

          var stepArr = [];
          var stepWidth = (width - (margin*2))/(data.length-1);
          for (var j=0; j<data.length; j+=1) {
            stepArr.push(stepWidth*j);
          }

          var drag = d3.behavior.drag()
            .on('drag', function() {
              if (d3.event.x < 0 || d3.event.x > (width - (margin*2))) {
                return;
              }

              var bisect = d3.bisector(function(d) { return d; }).left,
                idx = bisect(stepArr, d3.event.x - handleRadius);

              d3.select(this)
                .attr('transform', 'translate(' + [stepArr[idx], 0] + ')');

              this.year = data[idx].year;

              d3.select(this).select('text')[0][0].textContent = this.year;
            })
            .on('dragend', function() {
              $scope.$emit('timesliderChanged', this.year);
            });

          var root = d3.select(element[0])
            .append('svg')
            .attr({
              width: width,
              height: height
            })
            .append('g')
            .attr({transform: 'translate(0,0)'});

          var slider = root.append('g')
            .attr({
              'class': 'slider',
              transform: 'translate(' + [margin, margin] + ')'
            });

          slider.append('rect')
            .attr({
              width: (width - (2*margin)) + 2,
              height: 4,
              transform: 'translate(-1,-2)'
            });

          var axis = slider
            .selectAll('.x-axis')
            .data(data)
            .enter()
            .append('g')
            .attr({
              'class': 'x-axis'
            });

          axis.append('line')
            .attr({
              x1: function(d) {
                return x(d.year);
              },
              y1: function(d, i) {
                if (i === 0 || i === data.length-1) {
                  return 0;
                } else {
                  return 15;
                }
              },
              x2: function(d) {
                return x(d.year);
              },
              y2: 22
            });

          var handle = slider.append('g')
            .attr({
              'class': 'handle',
              transform: function() {
                return 'translate(' + [stepArr[stepArr.length-1], 0] + ')';
              }
            })
            .call(drag);

          handle.append('circle')
            .attr('r', handleRadius);

          handle.append('text')
            .text(data[data.length-1].year);

          axis.append('text')
            .text(function(d, i) {
              if (i%4 === 0 || i === data.length-1) {
                return '\'' + (d.year + '').substring(2,4);
              }
            })
            .attr({
              x: function(d) {
                return x(d.year);
              }
            });
        }
      };
    });

}());