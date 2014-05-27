define(["knockout"], function(ko) {
    var labels = {
        type: {
            bug:        { score: 5, text: 'type: bug', shortText: 'bug', backColor: '#5319e7', foreColor: 'white' },
            feature:    { score: 3, text: 'type: feature', shortText: 'feature', backColor: '#207de5', foreColor: 'white' },
            meta:       { score: 0, text: 'type: meta', shortText: 'meta', backColor: '#fbca04', foreColor: 'black' }
        },
        severity: {
            blocking:   { score: 5, text: 'severity: blocking', shortText: 'blocking', backColor: '#e11d21', foreColor: 'white' },
            major:      { score: 3, text: 'severity: major', shortText: 'major', backColor: '#e14d51', foreColor: 'white' },
            minor:      { score: 2, text: 'severity: minor', shortText: 'minor', backColor: '#e17d81', foreColor: 'black' },
            niceToHave: { score: 1, text: 'severity: nice-to-have', shortText: 'nice', backColor: '#e1adb1', foreColor: 'black' }
        },
        affected: {
            all:        { score: 5, text: 'affected: all', shortText: 'all', backColor: '#00c800', foreColor: 'white' },
            most:       { score: 4, text: 'affected: most', shortText: 'most', backColor: '#40c840', foreColor: 'white' },
            average:    { score: 3, text: 'affected: average', shortText: 'average', backColor: '#80c880', foreColor: 'black' },
            few:        { score: 2, text: 'affected: few', shortText: 'few', backColor: '#b0d8b0', foreColor: 'black' },
            veryFew:    { score: 1, text: 'affected: very few', shortText: 'very few', backColor: '#e0f8e0', foreColor: 'black' }
        }
    };

    function Issue() {
        // Construct a blank new Issue
        this.number = null;
        this.htmlUrl = null;
        this.title = ko.observable();
        this.isSaving = ko.observable(false);
        this.milestone = ko.observable();

        // Triage fields
        this.type = ko.observable();
        this.severity = ko.observable();
        this.affected = ko.observable();
        this.unknownLabels = ko.observableArray();

        this.isMeta = ko.computed(function() { return this.type() === labels.type.meta; }, this);
        this.isTriaged = ko.observable();
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
        this.milestone(data.milestone || null);
        this.updateTriageFields(data.labels);
    };

    Issue.prototype.updateTriageFields = function(issueLabels) {
        var foundType = null,
            foundSeverity = null,
            foundAffected = null,
            unknownLabels = [];

        ko.utils.arrayForEach(issueLabels, function(label) {
            var found,
                labelText = label.name;

            if (found = findLabelByText(labelText, labels.type)) {
                foundType = found;
            } else if (found = findLabelByText(labelText, labels.severity)) {
                foundSeverity = found;
            } else if (found = findLabelByText(labelText, labels.affected)) {
                foundAffected = found;
            } else {
                unknownLabels.push({ text: labelText, color: '#' + label.color });
            }
        });

        this.type(foundType);
        this.severity(foundSeverity);
        this.affected(foundAffected);
        this.unknownLabels(unknownLabels);
        if (foundType && foundSeverity && foundAffected) {
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
