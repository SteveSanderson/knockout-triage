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
