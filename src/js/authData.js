// Provides an object with zero to all of the following properties:
// {
//     user: <GitHub login name>,
//     timestamp: <Timestamp when last logged in>,
//     hmac: <token that must be included in server requests if editing>,
//     canEdit: <boolean>
// }
define([], function() {
	if (window.localStorage && localStorage.authDataJson) {
		return JSON.parse(localStorage.authDataJson);
	} else {
		return {};
	}
});
