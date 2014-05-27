define(["knockout", "js/data/issue"], function(ko, Issue) {
    function FilterModel(allIssues, hasLoaded, triageStatus) {
        // Private
        this._allMatchingTriageStatus = filterObservableArray(allIssues, function(issue) {
            return issue.isTriaged() === triageStatus();
        });
        this._hasLoaded = hasLoaded;

        // Public
        this.selectedIssueType = ko.observable();
        this.issueTypes = [
            this._makeIssueTypeOption("All types", function(issue) { return issue.type() !== Issue.labels.type.meta; }),
            this._makeIssueTypeOption("Bugs", function(issue) { return issue.type() === Issue.labels.type.bug; }),
            this._makeIssueTypeOption("Features", function(issue) { return issue.type() === Issue.labels.type.feature; })
        ];
        this.selectedIssueType(this.issueTypes[0]);

        // Maintain an observable list of distinct milestones
        this.selectedMilestone = ko.observable(null);
        var milestones = ko.computed(function() {
            // The preceding 'null' is the choice for 'no milestone filter'
            return [null].concat(getAllDistinctMilestones(allIssues()));
        });
        this.milestoneChoices = ko.computed(function() {
            return ko.utils.arrayMap(milestones(), function(milestone) {
                var predicate = milestone ? function(issue) { return issue.milestone() && issue.milestone().title === milestone; } : null;
                return this._makeMilestoneOption(milestone, milestone || "All milestones", predicate);
            }.bind(this));
        }, this);

        // Whenever the set of milestone choices changes, try to preserve selection by looking
        // for a new one with the same title as the old one
        this.milestoneChoices.subscribe(function(newMilestoneChoices) {
            var previousSelectedMilestoneText = this.selectedMilestone() ? this.selectedMilestone().title : null,
                correspondingNewMilestone = ko.utils.arrayFilter(newMilestoneChoices, function(m) {
                    return m && m.title === previousSelectedMilestoneText;
                })[0];
            this.selectedMilestone(correspondingNewMilestone || newMilestoneChoices[0]);
        }, this);
        this.selectedMilestone(this.milestoneChoices()[0]);
        
        this.output = ko.computed(function() {
            return this.selectedMilestone().matchingIssues();
        }, this);
    }

    FilterModel.prototype._makeIssueTypeOption = function(text, predicate) {
        var issuesToConsider = this._allMatchingTriageStatus,
            matchingIssues = predicate ? filterObservableArray(issuesToConsider, predicate) : issuesToConsider,
            selectedIssueType = this.selectedIssueType;
        return {
            text: ko.computed(function() { return text + (this._hasLoaded() ? ' (' + matchingIssues().length + ')' : ''); }, this),
            predicate: predicate,
            matchingIssues: matchingIssues,
            select: function() { selectedIssueType(this); }
        };
    };

    FilterModel.prototype._makeMilestoneOption = function(title, text, predicate) {
        // Note that "issuesToConsider" is the output from the "selectedIssueType" filter.
        // This is how the two filters are chained together.
        var issuesToConsider = this.selectedIssueType().matchingIssues,
            matchingIssues = predicate ? filterObservableArray(issuesToConsider, predicate) : issuesToConsider,
            selectedMilestone = this.selectedMilestone;
        return {
            title: title,
            text: ko.computed(function() { return text + (this._hasLoaded() ? ' (' + matchingIssues().length + ')' : ''); }, this),
            predicate: predicate,
            matchingIssues: matchingIssues,
            select: function() { selectedMilestone(this); }
        };
    };

    FilterModel.prototype.dispose = function() {
        // Ensure no external objects are still referencing this instance
        this.output.dispose();
        ko.utils.arrayForEach(this.issueTypes, function(issueType) {
            issueType.text.dispose();
            issueType.matchingIssues.dispose();
        });
    };

    function filterObservableArray(observableArray, predicate) {
        return ko.computed(function() {
            return ko.utils.arrayFilter(observableArray(), predicate);
        });
    }

    function getAllDistinctMilestones(allIssues) {
        var result = [];
        for(var i = 0; i < allIssues.length; i++) {
            var milestoneTitle = allIssues[i].milestone() ? allIssues[i].milestone().title : null;
            if (milestoneTitle && result.indexOf(milestoneTitle) < 0) {
                result.push(milestoneTitle);
            }
        }
        return result.sort();
    }

    return FilterModel;
});
