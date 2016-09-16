angular.module('populationioApp').directive('rankGraph', [
	'$filter', '$translate',
	function($filter, $translate){
		return {
			restrict: 'E',
			scope: {
				data: '=',
				country: '=',
				age: '='
			},
			link: function($scope, element){
				var width = 350,
					height = 200,
					xAxis, xAxisElement,
					yAxis, yAxisElement,
					yAxisFormat = d3.format('s');
				var root = d3.select(element[0])
					.append('svg')
					.attr({
						width: width,
						height: height + 20
					})
					.append('g')
					.attr({
						transform: 'translate(' + [10, -10] + ')'
					});
				var labelX;
				var labelY;
				var labelPointer;
				$scope.$on('languageChange', function(){
					if(labelX){
						labelX.text($translate.instant('MILESTONES_CHART_AXIS_X'));
					}
					if(labelY){
						labelY.text($translate.instant('MILESTONES_CHART_AXIS_Y'));
					}
					if(labelPointer){
						labelPointer.text($translate.instant('MILESTONES_CHART_POINTER'));
					}
					root.select('.percentage').text(function(){
						return $scope.age + ' ' + $translate.instant('UNIT_YEARS');
					});
				});
				$scope.$watch('data', function(data){
					if(data){
						_updateGraph(data);
					}
				});
				var frame = root.append('g')
					.attr({
						'class': 'frame'
					});
				var _initGraph = function(){
					root.append('g').attr('class', 'chart');
					root.append('g').attr('class', 'pointer');
					xAxisElement = root.append('g')
						.attr('class', 'x axis')
						.attr({
							transform: 'translate(' + [0, height] + ')'
						});
					yAxisElement = root.append('g')
						.attr('class', 'y axis')
						.attr({
							transform: 'translate(' + [40, 0] + ')'
						});
					yAxis = d3.svg.axis()
						.orient('left')
						.tickFormat(function(d){
							return yAxisFormat(d);
						});
				};
				var _updateGraph = function(data){
					labelY = frame.append('text')
						.text($translate.instant('MILESTONES_CHART_AXIS_Y'))
						.attr({
							'class': 'people',
							transform: function(){
								return 'translate(' + [40, 70] + ') rotate(-90)';
							}
						});
					labelX = frame.append('text')
						.text($translate.instant('MILESTONES_CHART_AXIS_X'))
						.attr({
							'class': 'age',
							transform: function(){
								return 'translate(' + [width - 60, height + 3] + ')';
							}
						});
					var ticks = [], step = $scope.country !== 'World' ? 500000 : 50000000;
					if($scope.country !== 'World' && d3.max(data, function(d){ return d.total; }) <= 500000000){
						step = Math.ceil(d3.max(data, function(d){ return d.total; }) / 1000000) * 1000000;
					}
					if($scope.country !== 'World' && d3.max(data, function(d){ return d.total; }) <= 500000){
						step = Math.ceil(d3.max(data, function(d){ return d.total; }) / 100000) * 100000;
					}
					if($scope.region !== 'World' && d3.max(data, function(d){ return d.total; }) <= 2000){
						step = Math.ceil(d3.max(data, function(d){ return d.total; }) / 200) * 200;
					}
					for(var i = 0; i < d3.max(data, function(d){
						return d.total;
					}) + step; i = i + step){
						ticks.push(i);
					}
					var xScale = d3.scale.linear()
						.domain([
							d3.min(data, function(d){
								return d.age;
							}),
							d3.max(data, function(d){
								return d.age;
							})
						])
						.range([40, width - 100]);
					var yScale = d3.scale.linear()
							.domain([0, ticks[ticks.length - 1]])
							.range([height, 90])
						;
					xAxis = d3.svg.axis()
						.scale(xScale)
						.tickFormat(function(d){
							return d + 'y';
						})
						.tickValues([0, 25, 50, 75, 100]);
					yAxis.scale(yScale)
						.tickValues(ticks);
					var area = d3.svg.area()
						.x(function(d){
							return xScale(d.age);
						})
						.y0(function(){
							return height;
						})
						.y1(function(d){
							return yScale(d.total);
						})
						.interpolate('basis');
					var areaNull = d3.svg.area()
						.x(function(d){
							return xScale(d.age);
						})
						.y0(function(){
							return height;
						})
						.y1(function(){
							return height;
						})
						.interpolate('basis');
					var chart = root.select('.chart');
					var path = chart
						.selectAll('.age-line')
						.data([data]);
					path.transition()
						.duration(1000)
						.attr('d', function(){
							return area(data);
						});
					path.enter()
						.append('path')
						.attr({
							d: function(){
								return areaNull(data);
							},
							'class': 'age-line'
						})
						.transition()
						.duration(1000)
						.attr('d', function(){
							return area(data);
						});
					var bisect = d3.bisector(function(d){
						return d.age;
					}).right;
					var item = data[bisect(data, $scope.age)];
					if(item){
						var pointer = root.select('.pointer');
						var group = pointer.selectAll('.pointer-wrapper')
							.data([item])
							.enter()
							.append('g')
							.attr('class', 'pointer-wrapper');
						// TODO: refactore me in a good d3 way
						if(pointer.select('.percentage').empty()){
							pointer.attr({
								transform: function(){
									return 'translate(' + [xScale($scope.age), 0] + ')';
								}
							});
						}
						pointer
							.transition()
							.duration(1000)
							.attr({
								transform: 'translate(' + [xScale($scope.age), 0] + ')'
							});
						group.append('line');
						pointer.select('line')
							.transition()
							.duration(1000)
							.attr({
								x1: 0,
								y1: 20,
								x2: 0,
								y2: (yScale(item.total))
							});
						group.append('circle')
							.attr({
								r: 3,
								cx: 0,
								cy: yScale(item.total) - 1
							});
						var textBlock = group
								.append('g')
								.attr({
									'class': 'text-block',
									transform: function(){
										return 'translate(' + [15, 35] + ')';
									}
								})
							;
						textBlock.append('text')
							.attr({
								'class': 'percentage'
							});
						labelPointer = textBlock.append('text')
							.text($translate.instant('MILESTONES_CHART_POINTER'))
							.attr({
								'class': 'desc',
								transform: function(){
									return 'translate(' + [0, 15] + ')';
								}
							});
						root.select('.percentage')
							.transition()
							.delay(1000)
							.text(function(){
								return $scope.age + ' ' + $translate.instant('UNIT_YEARS');
							});
					}
					yAxisElement
						.transition()
						.call(yAxis);
					xAxisElement
						.transition()
						.call(xAxis);
					root.select('circle')
						.transition()
						.duration(1000)
						.attr({
							cy: yScale(item.total) - 1
						});
				};
				_initGraph();
			}
		};
	}
]);
