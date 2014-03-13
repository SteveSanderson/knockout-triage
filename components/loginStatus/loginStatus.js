define(["knockout", "js/authData"], function(ko, authData) {
    function LoginStatusViewModel(params) {
        this.loginName = ko.observable(authData ? authData.user : null);
        this.displayMode = ko.unwrap(params.mode);
    }

    LoginStatusViewModel.prototype.signOut = function() {
        delete localStorage.authDataJson;
        location.reload();
    };

    return LoginStatusViewModel;
});
