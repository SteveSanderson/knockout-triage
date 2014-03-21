define(["knockout", "text!./navBar.html", "js/data/githubApi"], function(ko, template, githubApi) {
    function NavBarViewModel(params) {
        this.route = params.route;
        this.triagedText = ko.computed(function() {
            return 'Triaged ' + getCountByTriageStatusText(true);
        });
        this.untriagedText = ko.computed(function() {
            return 'Untriaged ' + getCountByTriageStatusText(false);
        });
    }

    NavBarViewModel.prototype.dispose = function() {
        this.triagedText.dispose();
        this.untriagedText.dispose();
    };

    function getCountByTriageStatusText(triageStatus) {
        if (githubApi.hasLoaded()) {
            var matching = ko.utils.arrayFilter(githubApi.issues(), function(issue) {
                return !issue.isMeta() && issue.isTriaged() === triageStatus;
            });
            return '(' + matching.length + ')';
        } else {
            return '';
        }
    }

    return { viewModel: NavBarViewModel, template: template };
});
