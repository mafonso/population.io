angular.module('populationioApp').controller('ExpectancyCtrl', [
	'$scope', 'ProfileService', 'Countries',
	function($scope, ProfileService, Countries){
		'use strict';
		$scope.countries = Countries;
		$scope.$root.$on('profileUpdated', function(){
			$scope.currentCountry = ProfileService.country;
			$scope.referenceCountry = '';
		});
		$scope.$on('languageChange', function(){
			// This part is required to properly update (and translate) country
			var currentCountry = $scope.currentCountry;
			var referenceCountry = $scope.referenceCountry;
			$scope.currentCountry = '';
			$scope.referenceCountry = '';
			$scope.$applyAsync(function(){
				$scope.currentCountry = currentCountry;
				$scope.referenceCountry = referenceCountry;
			});
		});
		$scope.$watch('currentCountry', function(n){
			if (n !== null && n !== undefined && n !== ''){
				//noinspection JSUnresolvedFunction
				ga('send', 'event', 'ExpectancyMap', 'local_country_change', n);
			}
		});
		$scope.$watch('referenceCountry', function(n){
			if (n !== null && n !== undefined && n !== ''){
				//noinspection JSUnresolvedFunction
				ga('send', 'event', 'ExpectancyMap', 'reference_country_change', n);
			}
		});
	}
]);
