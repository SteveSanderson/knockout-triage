define(["knockout", "knockout-mapping", "jquery", "js/data/issue"], function(ko, koMapping, $, Issue) {
	var baseUrl = "https://api.github.com",
		issuesUrl = baseUrl + "/repos/knockout/knockout/issues?page=1&per_page=100",
        untrustedUserOAuthToken = "20e1f5bd105c41e4d249686d9b47da698f352171";

    function GithubApi() {
    	this.issues = koMapping.fromJS([], {
            key: function(issue) { return issue.number; },
            create: function(info) { return new Issue(); },
            update: function(info) { info.target.populate(info.data); return info.target; }
        });

    	this.loadingPercentage = ko.observable(null);
    	this.loading = ko.computed(function() {
    		return typeof this.loadingPercentage() === 'number';
    	}, this);
    }

    GithubApi.prototype.loadIssues = function() {
    	var self = this;
    	return loadRemainingData(issuesUrl, 1, null, []).always(function() {
    		self.loadingPercentage(null);
    	});

    	function loadRemainingData(startUrl, currentPageIndex, totalPageCount, dataSoFar) {
    		if (startUrl) {
		    	self.loadingPercentage(totalPageCount ? 100 * (currentPageIndex+1) / totalPageCount : 0);

		    	var ajaxOptions = {
		    		url: startUrl,
		    		dataType: 'json',
		    		headers: {},
		    		cache: false
		    	};
		    	
		    	return ajaxRequestWithAuth(ajaxOptions).then(function(newData, status, jqXHR) {
					var linkUrls = extractLinkUrlsFromLinkHeader(jqXHR),
		    			totalPageCount = totalPageCount || (1 + parseInt(linkUrls.last.match(/[?&]page=(\d+)/)[1]));
		    		return loadRemainingData(linkUrls.next, currentPageIndex + 1, totalPageCount, dataSoFar.concat(newData));
		    	});
    		} else {
    			return dataSoFar;
    		}
    	}

    	function extractLinkUrlsFromLinkHeader(jqXHR) {
    		var linkHeader = jqXHR.getResponseHeader('link'),
    			linkHeaderParts = linkHeader.split(/,\s*/),
    			linkHeaderMatches = ko.utils.arrayMap(linkHeaderParts, function(linkHeaderPart) {
    				var match = linkHeaderPart.match(/<(.*?)>; rel="(.*?)"/);
    				return { rel: match[2], url: match[1] };
    			}),
    			result = {};
    		for (var i = 0; i < linkHeaderMatches.length; i++) {
    			result[linkHeaderMatches[i].rel] = linkHeaderMatches[i].url;
    		}
    		return result;
    	}

        // GitHub's anonymous API allows 60 requests per IP per hour. This is usually enough,
        // but in the event that you run out, this function transparently switches over to
        // use a hardcoded OAuth token. Since this is for a user with no priviledges at all,
        // there's no problem with making the token public.
        function ajaxRequestWithAuth(ajaxOptions) {
            var didUseAuth = false;
            if (localStorage.useAuthUntil && (localStorage.useAuthUntil > new Date().valueOf())) {
                ajaxOptions.headers.Authorization = 'token ' + untrustedUserOAuthToken;
                didUseAuth = true;
            }

            return $.ajax(ajaxOptions).then(null, function(error) {
                if (!didUseAuth && error.getResponseHeader("X-RateLimit-Remaining") === "0") {
                    // Looks like anonymous access has run out for this IP. Switch to using
                    // the untrustedUserOAuthToken for the next hour.
                    localStorage.useAuthUntil = new Date().valueOf() + 60*60*1000;
                    return ajaxRequestWithAuth(ajaxOptions);
                } else {
                    return error;
                }
            });
        }
    };

    GithubApi.prototype.refreshIssues = function() {
        var self = this;
    	this.loadIssues().then(
    		function (rawData) {
                koMapping.fromJS(rawData, self.issues);
            },
    		function (error) {
    			alert(error.responseText || error.toString());
    		}
    	);
    }

    return new GithubApi();
});
