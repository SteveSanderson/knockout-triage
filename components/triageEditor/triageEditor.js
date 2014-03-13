define(["module", "knockout", "js/data/githubApi", "js/data/issue"], function(module, ko, githubApi, Issue) {
    ko.components.register("label-selector", {
        template: { require: "text!" + ko.components.relativeUrl(module.uri, "labelSelector.html") }
    });

    function TriageEditorViewModel(params) {
        this.issue = params.issue;
        this.selectedType = ko.observable();
        this.selectedSeverity = ko.observable();
        this.selectedAffected = ko.observable();
        this.selectedOtherApi = ko.observable();
        this.selectedOtherBreaking = ko.observable();
        this.selectedMeta = ko.computed(function() {
            return this.selectedType() === Issue.labels.type.meta;
        }, this);

        // When the selected issue changes, reinitialise the form to describe it
        this.issueChangedReactor = ko.computed(function() {
            var issue = this.issue();
            if (issue) {
                this.selectedType(issue.type());
                this.selectedSeverity(issue.severity());
                this.selectedAffected(issue.affected());
                this.selectedOtherApi(issueHasOtherLabel(issue, 'api'));
                this.selectedOtherBreaking(issueHasOtherLabel(issue, 'breaking'));
            }
        }, this);

        this.typeChoices = makeComputedArrayOfChoices(Issue.labels.type, this.selectedType);
        this.severityChoices = makeComputedArrayOfChoices(Issue.labels.severity, this.selectedSeverity);
        this.affectedChoices = makeComputedArrayOfChoices(Issue.labels.affected, this.selectedAffected);
        this.otherChoices = ko.computed(function() {
            return [
                { uniqueId: 'api-choice', label: 'api', text: 'Affects API surface', checked: this.selectedOtherApi },
                { uniqueId: 'breaking-choice', label: 'breaking', text: 'Breaking change', checked: this.selectedOtherBreaking }
            ];
        }, this);
    }

    TriageEditorViewModel.prototype.save = function() {
        // Start saving, and close the modal immediately
        githubApi.applyTriageLabels(this.issue(), {
            type: this.selectedType() ? this.selectedType().text : null,
            severity: this.selectedSeverity() ? this.selectedSeverity().text : null,
            affected: this.selectedAffected() ? this.selectedAffected().text : null,
            api: this.selectedOtherApi(),
            breaking: this.selectedOtherBreaking()
        });
        this.issue(null);
    };

    TriageEditorViewModel.prototype.dispose = function() {
        this.issueChangedReactor.dispose();
        this.typeChoices.dispose();
        this.severityChoices.dispose();
        this.affectedChoices.dispose();
        this.otherChoices.dispose();
    };

    function makeComputedArrayOfChoices(choicesHash, selectedChoice) {
        return ko.computed(function() {
            return hashToArray(choicesHash, function(key, value) {
                var isSelected = selectedChoice() === value;
                return {
                    isSelected: isSelected,
                    labelText: value.shortText,
                    backColor: isSelected && value.backColor,
                    foreColor: isSelected && value.foreColor,
                    select: function() {
                        selectedChoice(value);
                    }
                };
            });
        });
    }

    function hashToArray(hash, map) {
        var result = [];
        for (var key in hash) {
            if (hash.hasOwnProperty(key)) {
                result.push(map(key, hash[key]));
            }
        }
        return result;
    }

    function issueHasOtherLabel(issue, labelText) {
        var labels = issue.unknownLabels();
        for (var i = 0; i < labels.length; i++) {
            if (labels[i].text === labelText) {
                return true;
            }
        }
        return false;
    }

    return TriageEditorViewModel;
});
