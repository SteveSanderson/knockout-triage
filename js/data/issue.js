define(["knockout"], function(ko) {
	var labels = {
		type: {
			bug: 		{ score: 5, text: 'type: bug', shortText: 'bug' },
			feature: 	{ score: 3, text: 'type: feature', shortText: 'feature' },
			meta: 		{ score: 0, text: 'type: meta', shortText: 'meta' }
		},
		severity: {
			blocking:   { score: 5, text: 'severity: blocking', shortText: 'blocking' },
			major:   	{ score: 3, text: 'severity: major', shortText: 'major' },
			minor:   	{ score: 2, text: 'severity: minor', shortText: 'minor' },
			niceToHave: { score: 1, text: 'severity: nice-to-have', shortText: 'nice' }
		},
		affected: {
			all:   		{ score: 5, text: 'affected: all', shortText: 'all' },
			most:   	{ score: 4, text: 'affected: most', shortText: 'most' },
			average:   	{ score: 3, text: 'affected: average', shortText: 'average' },
			few: 		{ score: 2, text: 'affected: few', shortText: 'few' },
			veryFew: 	{ score: 1, text: 'affected: very few', shortText: 'very few' }
		}
	};

    function Issue() {
    	// Construct a blank new Issue
    	this.number = null;
    	this.htmlUrl = null;
    	this.title = ko.observable();

    	// Triage fields
    	this.type = ko.observable();
    	this.typeColor = ko.observable();
    	this.severity = ko.observable();
    	this.severityColor = ko.observable();
    	this.affected = ko.observable();
    	this.affectedColor = ko.observable();
    	this.unknownLabels = ko.observableArray();

    	this.isMeta = ko.computed(function() { return this.type() === labels.type.meta; }, this);
    	this.isTriaged = ko.observable();
    	this.isMalformed = ko.observable();
    	this.score = ko.observable(null);

        // The following properties have nonprimitive values. To avoid unnecessary
        // UI updates, use reference comparisons to determine when the value has changed.
        useReferenceComparisons([this.type, this.severity, this.affected]);
    }

    Issue.prototype.populate = function(data) {
    	// Fill this instance with loaded data
    	this.number = data.number;
    	this.htmlUrl = data.html_url;
    	this.title(data.title);
    	this.updateTriageFields(data.labels);
    };

    Issue.prototype.updateTriageFields = function(issueLabels) {
    	var isMalformed = false,
    		foundType = null, foundTypeColor = null,
    		foundSeverity = null, foundSeverityColor = null,
    		foundAffected = null, foundAffectedColor = null,
    		unknownLabels = [];

    	ko.utils.arrayForEach(issueLabels, function(label) {
    		var found,
    			labelText = label.name;

    		if (found = findLabelByText(labelText, labels.type)) {
    			if (foundType) {
					isMalformed = true;
				} else {
					foundType = found;
					foundTypeColor = '#' + label.color;
				}
    		} else if (found = findLabelByText(labelText, labels.severity)) {
				if (foundSeverity) {
					isMalformed = true;
				} else {
					foundSeverity = found;
					foundSeverityColor = '#' + label.color;
				}
    		} else if (found = findLabelByText(labelText, labels.affected)) {
				if (foundAffected) {
					isMalformed = true;
				} else {
					foundAffected = found;
					foundAffectedColor = '#' + label.color;
				}
    		} else {
    			unknownLabels.push({ text: labelText, color: '#' + label.color });
    		}
    	});

    	this.isMalformed(isMalformed);
		this.type(isMalformed ? null : foundType);
    	this.severity(isMalformed ? null : foundSeverity);
    	this.affected(isMalformed ? null : foundAffected);
    	this.typeColor(foundTypeColor);
    	this.severityColor(foundSeverityColor);
    	this.affectedColor(foundAffectedColor);
    	this.unknownLabels(unknownLabels);
    	if (foundType && foundSeverity && foundAffected && !isMalformed) {
    		this.isTriaged(true);
    		this.score(foundType.score * foundSeverity.score * foundAffected.score);
    	} else {
    		this.isTriaged(false);
    		this.score(null);
    	}
    };

    function findLabelByText(labelText, group) {
    	for (var key in group) {
    		if (group.hasOwnProperty(key)) {
    			if (group[key].text === labelText) {
    				return group[key];
    			}
    		}
    	}

    	return null;
    }

    function useReferenceComparisons(observables) {
        ko.utils.arrayForEach(observables, function(observable) {
            observable.equalityComparer = function(a, b) {
                return a === b;
            }
        });
    }

    Issue.labels = labels;

    return Issue;
});
