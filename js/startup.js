requirejs.config({
    baseUrl: "",
    paths: {
        "jquery":       "bower_components/jquery/dist/jquery",
        "bootstrap":    "bower_components/components-bootstrap/js/bootstrap.min",
        "crossroads":   "bower_components/crossroads/dist/crossroads.min",
        "hasher":       "bower_components/hasher/dist/js/hasher.min",
        "signals":      "bower_components/js-signals/dist/signals.min",

        "text": "js/lib/require.text",
        "knockout": "js/lib/knockout-3.1.0",
        "knockout-components": "js/lib/knockout-components",
        "knockout-customElements": "js/lib/knockout-customElements",
        "knockout-mapping": "js/lib/knockout.mapping-latest",
        "knockout-batch": "js/lib/knockout-batch",
    },
    shim: {
        "bootstrap": { deps: ["jquery"] }
    }
});

define(["jquery", "knockout", "js/router", "js/bindings", "knockout-customElements", "bootstrap"], function($, ko, router) {
    ko.components.register("nav-bar", {
        template: { require: "text!components/navBar/navBar.html" }
    });

    ko.components.register("login-status", {
        viewModel: { require: "components/loginStatus/loginStatus" },
        template: { require: "text!components/loginStatus/loginStatus.html" }
    });

    ko.components.register("triage-editor", {
        viewModel: { require: "components/triageEditor/triageEditor" },
        template: { require: "text!components/triageEditor/triageEditor.html" }
    });

    ko.components.register("issue-list", {
        template: { require: "text!components/issueList/issueList.html" },
        viewModel: { require: "components/issueList/issueList" }
    });

    ko.components.register("progress-panel", {
        template: { require: "text!components/progressPanel/progressPanel.html" }
    });

    // Start the application
    ko.applyBindings({ route: router.currentRoute });
});
