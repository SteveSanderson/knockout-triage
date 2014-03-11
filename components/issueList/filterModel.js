define(["knockout", "js/data/issue"], function(ko, Issue) {
    function FilterModel(allIssues, loading, triageStatus) {
        // Private
        this._allMatchingTriageStatus = filterObservableArray(allIssues, function(issue) {
            return issue.isTriaged() === triageStatus();
        });
        this._loading = loading;

        // Public
        this.selectedIssueType = ko.observable();
        this.issueTypes = [
            this._makeIssueTypeOption("All types", function(issue) { return issue.type() !== Issue.labels.type.meta; }),
            this._makeIssueTypeOption("Bugs", function(issue) { return issue.type() === Issue.labels.type.bug; }),
            this._makeIssueTypeOption("Features", function(issue) { return issue.type() === Issue.labels.type.feature; })
        ];
        this.selectedIssueType(this.issueTypes[0]);

        this.output = ko.computed(function() {
            return this.selectedIssueType().matchingIssues();
        }, this);
    }

    FilterModel.prototype._makeIssueTypeOption = function(text, predicate) {
        var issuesToConsider = this._allMatchingTriageStatus,
            matchingIssues = predicate ? filterObservableArray(issuesToConsider, predicate) : issuesToConsider,
            selectedIssueType = this.selectedIssueType;
        return {
            text: ko.computed(function() { return text + (this._loading() ? '' : ' (' + matchingIssues().length + ')'); }, this),
            predicate: predicate,
            matchingIssues: matchingIssues,
            select: function() { selectedIssueType(this); }
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

    return FilterModel;
});
