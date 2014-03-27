define(["knockout", "text!./loginStatus.html", "js/authData"], function(ko, template, authData) {
    function LoginStatusViewModel(params) {
        this.loginName = ko.observable(authData ? authData.user : null);
        this.displayMode = ko.unwrap(params.mode);
    }

    LoginStatusViewModel.prototype.signOut = function() {
        delete localStorage.authDataJson;
        location.reload();
    };

    return { viewModel: LoginStatusViewModel, template: template };
});
