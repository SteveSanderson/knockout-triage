var require = {
    baseUrl: ".",
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
};
