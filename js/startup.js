requirejs.config({
    baseUrl: "",
    paths: {
        "jquery":       "bower_components/jquery/dist/jquery",
        "bootstrap":    "bower_components/components-bootstrap/js/bootstrap.min",
        "crossroads":   "bower_components/crossroads/dist/crossroads.min",
        "hasher":       "bower_components/hasher/dist/js/hasher.min",
        "signals":      "bower_components/js-signals/dist/signals.min",

        "text": "js/lib/require.text",
        "knockout": "js/lib/knockout-latest",
        "knockout-customElements": "js/lib/knockout-customElements",
        "knockout-mapping": "js/lib/knockout.mapping-latest",
        "knockout-batch": "js/lib/knockout-batch",
    },
    shim: {
        "bootstrap": { deps: ["jquery"] }
    }
});

define(["jquery", "knockout", "js/router", "js/bindings", "knockout-customElements", "bootstrap"], function($, ko, router) {
    ko.components.register("nav-bar", { require: "components/navBar/navBar" });
    ko.components.register("login-status", { require: "components/loginStatus/loginStatus" });
    ko.components.register("triage-editor", { require: "components/triageEditor/triageEditor" });
    ko.components.register("issue-list", { require: "components/issueList/issueList" });
    ko.components.register("progress-panel", {
        template: { require: "text!components/progressPanel/progressPanel.html" }
    });

    // Start the application
    ko.applyBindings({ route: router.currentRoute });
});
