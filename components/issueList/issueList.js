define(["module", "knockout", "knockout-batch", "js/data/githubApi", "components/issueList/filterModel", "js/authData"], function(module, ko, batch, githubApi, FilterModel, authData) {
    ko.components.register("issue-list-toolbar", {
        template: { require: "text!" + ko.components.relativeUrl(module.uri, "issueListToolbar/issueListToolbar.html") }
    });

    function IssueListViewModel(params) {
        // Private
        this._githubApi = githubApi;

        // Public
        this.allIssues = githubApi.issues;
        this.loading = githubApi.loading;
        this.filter = new FilterModel(this.allIssues, githubApi.hasLoaded, params.triaged);
        this.loadingPercentage = githubApi.loadingPercentage;
        this.selectedIssue = ko.observable();
        this.canEdit = authData.canEdit;

        this.sortedFilteredIssues = batch(ko.computed(function() {
            var issues = this.filter.output().slice(0);
            issues.sort(function(a, b) {
                return a.score() > b.score() ? -1
                     : a.score() < b.score() ? +1
                     : a.number  > b.number  ? -1
                     : 1;
            });
            return issues;
        }, this));

        this.selectIssue = this.selectIssue.bind(this);

        // Init
        this.refresh();
    }

    IssueListViewModel.prototype.selectIssue = function(issue) {
        this.selectedIssue(issue);
    }

    IssueListViewModel.prototype.refresh = function () {
        this._githubApi.refreshIssues();
    };

    IssueListViewModel.prototype.dispose = function() {
        this.filter.dispose();
    };

    return IssueListViewModel;
});
