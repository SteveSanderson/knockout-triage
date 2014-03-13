define(["knockout"], function(ko) {
    function LoginStatusViewModel(params) {
        var authDataJson = localStorage.authDataJson,
            authData = authDataJson ? JSON.parse(authDataJson) : null;

        this.loginName = ko.observable(authData ? authData.user : null);
        this.displayMode = ko.unwrap(params.mode);
    }

    LoginStatusViewModel.prototype.signOut = function() {
        delete localStorage.authDataJson;
        this.loginName(null);
    };

    return LoginStatusViewModel;
});
