/*
 Instructions:
 (1) Wrap an XHR in a Promise in the get() function below. See: https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Using_XMLHttpRequest
 (a) Resolve on load and reject on error.
 (2) If the XHR resolves, use addSearchHeader to add the search header to the page.
 (3) If the XHR fails, console.log the error and pass 'unknown' to addSearchHeader
 */

// Inline configuration for jshint below. Prevents `gulp jshint` from failing with quiz starter code.
/* jshint unused: false */

(function(document) {
	'use strict';
	
	var home = null;
	
	/**
	 * Helper function to show the search query.
	 * @param {String} response - The unparsed JSON response from get.
	 */
	function addSearchHeader(response) {
		try {
			response = JSON.parse(response).query;  // you'll be moving this line out of here in the next quiz!
		} catch (e) {
			// it's 'unknown', so leave it alone
		}
		home.innerHTML = '<h2 class="page-title">query: ' + response + '</h2>';
	}
	
	/**
	 * XHR wrapped in a promise.
	 * @param  {String} url - The URL to fetch.
	 * @return {Promise}    - A Promise that resolves when the XHR succeeds and fails otherwise.
	 */
	function get(url) {
		return fetch(url, {method: 'get'}); // returns a promise
	}
	
	
	function getJSON(url) {
		// return a promise that gets a URL and parses the JSON response
		return get(url)
			.then(function (response) {
				return response.json(); // parse the json, result passed to the next step in the chain
			})
	}
	
	window.addEventListener('WebComponentsReady', function() {
		home = document.querySelector('section[data-route="home"]');
		
		getJSON('../data/earth-like-results.json')
			.then(function (result) {
				addSearchHeader(result.query);
				console.log(result);
			})
			.catch(function (error) {
				addSearchHeader('unknown');
				console.error(error);
			});
		
	});
})(document);
