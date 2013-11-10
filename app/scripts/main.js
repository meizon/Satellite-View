/* global Modernizr, google */
(function (window, document, undefined) {
	'use strict';

	// FIXME: Refactor this out into a module
	var transEndEventNames = {
			'WebkitTransition' : 'webkitTransitionEnd',// Saf 6, Android Browser
			'MozTransition'    : 'transitionend',      // only for FF < 15
			'transition'       : 'transitionend'       // IE10, Opera, Chrome, FF 15+, Saf 7+
		},
		transEndEventName = transEndEventNames[Modernizr.prefixed('transition')];

	var elements = {
			map: null,
			prompt: null
		},
		map,
		locationPromise,
		tilesPromise;

	/**
	 * App initialization, called when DOM ready.
	 * @return {undefined} 
	 */
	function initialize () {
		// Cache DOM elements.
		elements.prompt = document.querySelector('.js-location-prompt');
		elements.map 	= document.querySelector('.js-map');
		
		// Show the location prompt with transition.
		elements.prompt.classList.add('is-transparent');
		elements.prompt.classList.remove('is-hidden');

		// Force style recalc.
		elements.prompt.offsetWidth;

		// Add class triggering the transition.
		elements.prompt.classList.remove('is-transparent');

		// Try and get the users location so we can show the 
		// top down view of where they are on a map.
		locationPromise = getLocation();
		locationPromise.then(initializeMap, handleGeolocationError);
	}

	function initializeMap (position) {
		var mapOptions,
			tilesDfd = $.Deferred();

		mapOptions = {
			center: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
			disableDefaultUI: true,
			draggable: false,
			mapTypeId: google.maps.MapTypeId.SATELLITE,
			scrollwheel: false,
			zoom: 18
		};

		tilesPromise = tilesDfd.promise();

		// Hide the location warning once we have the location
		$(elements.prompt).on(transEndEventName, function () {
			tilesPromise.done(function () {
				$(elements.prompt).addClass('.is-hidden');
			});
		});

		// Hide the location prompt.
		elements.prompt.classList.add('trans-exit');

		// Start the transition out.
		elements.prompt.classList.add('is-transparent');

		map = new google.maps.Map(document.querySelector('.js-map'), mapOptions);
		
		google.maps.event.addListener(map, 'tilesloaded', function () {
			tilesDfd.resolve();
		});
	}

	function handleGeolocationError () {
		console.log('Could not get location.', arguments);
	}

	/**
	 * Fetches the users location using the HTML5 geolocation API.
	 * @return {$.Deferred}
	 *         Promise representing a future of the response from the 
	 *         HTML5 geolocation API.
	 */
	function getLocation () {
		var locationDfd = $.Deferred();

		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(locationDfd.resolve, locationDfd.reject);
		} else {
			locationDfd.reject('UNSUPPORTED');
		}

		return locationDfd.promise();
	}

	// Bind to the document ready event to kick the app off when ready.
	google.maps.event.addDomListener(window, 'load', initialize);

}(window, document));
