define(["module", "knockout", "text!./triageEditor.html", "text!./labelSelector.html", "js/data/githubApi", "js/data/issue"], function(module, ko, triageEditorTemplate, labelSelectorTemplate, githubApi, Issue) {
    ko.components.register("label-selector", {
        template: labelSelectorTemplate
    });

    function TriageEditorViewModel(params) {
        this.issue = params.issue;
        this.selectedType = ko.observable();
        this.selectedSeverity = ko.observable();
        this.selectedAffected = ko.observable();
        this.selectableOtherLabels = [
            { uniqueId: 'api-choice', label: 'api', text: 'Affects API surface', selected: ko.observable() },
            { uniqueId: 'breaking-choice', label: 'breaking', text: 'Breaking change', selected: ko.observable() },
            { uniqueId: 'waiting-choice', label: 'waiting', text: 'Waiting for info', selected: ko.observable() },
            { uniqueId: 'close-choice', label: 'close', text: 'Should close', selected: ko.observable() }
        ];
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

                ko.utils.arrayForEach(this.selectableOtherLabels, function(otherLabel) {
                    otherLabel.selected(issueHasOtherLabel(issue, otherLabel.label));
                });
            }
        }, this);

        this.typeChoices = makeComputedArrayOfChoices(Issue.labels.type, this.selectedType);
        this.severityChoices = makeComputedArrayOfChoices(Issue.labels.severity, this.selectedSeverity);
        this.affectedChoices = makeComputedArrayOfChoices(Issue.labels.affected, this.selectedAffected);
    }

    TriageEditorViewModel.prototype.save = function() {
        // Start saving, and close the modal immediately
        githubApi.applyTriageLabels(this.issue(), {
            type: this.selectedType() ? this.selectedType().text : null,
            severity: this.selectedSeverity() ? this.selectedSeverity().text : null,
            affected: this.selectedAffected() ? this.selectedAffected().text : null,
            api: this.isOtherLabelSelected('api'),
            breaking: this.isOtherLabelSelected('breaking'),
            waiting: this.isOtherLabelSelected('waiting'),
            close: this.isOtherLabelSelected('close')
        });
        this.issue(null);
    };

    TriageEditorViewModel.prototype.isOtherLabelSelected = function(label) {
        var labelObject = ko.utils.arrayFilter(this.selectableOtherLabels, function(l) { return l.label === label; })[0];
        return labelObject.selected();
    };

    TriageEditorViewModel.prototype.dispose = function() {
        this.issueChangedReactor.dispose();
        this.typeChoices.dispose();
        this.severityChoices.dispose();
        this.affectedChoices.dispose();
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

    return { viewModel: TriageEditorViewModel, template: triageEditorTemplate };
});
