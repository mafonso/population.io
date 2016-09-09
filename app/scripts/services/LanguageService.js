angular.module('populationioApp').factory('LanguageService', [
	'$rootScope', '$translate', 'tmhDynamicLocale',
	function($rootScope, $translate, tmhDynamicLocale){
		'use strict';
		var supportedLanguages = ['EN', 'ES', 'FR', 'DE', 'ZH', 'ID', 'RU'];
		var languageEvents = {};
		var getSupportedLanguage = function(language){
			language = language.toUpperCase();
			if (supportedLanguages.indexOf(language) > -1){
				return language;
			}

			return 'EN';
		};
		var skipLanguageEvent = function(language){
			languageEvents[language] = true;
			languageEvents[language.toUpperCase()] = true;
		};
		return {
			skipLanguageEvent: skipLanguageEvent,
			change: function(language){
				if (!languageEvents.hasOwnProperty(language)){
					//noinspection JSUnresolvedFunction
					ga('send', 'event', 'Language', 'change', language);
					skipLanguageEvent(language);
				}
				language = getSupportedLanguage(language);
				$translate.use(language).then(function(){
					moment.locale(language.toLowerCase());
					tmhDynamicLocale.set(language.toLowerCase());
					$rootScope.defaultLanguage = language;
					$rootScope.$broadcast('languageChange');
				});
			},
			getTitle: function(language){
				switch(language){
					case 'EN': return 'English';
					case 'ES': return 'Español';
					case 'FR': return 'Français';
					case 'DE': return 'Deutsch';
					case 'ZH': return '汉语';
					case 'ID': return 'Bahasa Indonesia';
					case 'RU': return 'русский';
				}

				return '';
			},
			supportedLanguages: supportedLanguages
		};
	}
]);
