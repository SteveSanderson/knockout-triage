define(['knockout'], function(ko) {
    // Simple utility to get a view of an observable array that, when the underlying array
    // changes, the view is populated asynchronously in batches. This means you can add
    // vast arrays to the DOM without stalling the UI.
    //
    // The drawback is that you can lose the user's scroll position, so to mitigate this,
    // the batching is only applied when a large number of changes occur simultaneously.

    var batchSize = 50,
    	batchInterval = 100,
    	useBatchingSizeThreshold = 50;

    return function(inputArray) {
    	var outputArray = ko.observableArray(),
            timeout,
            showNextGroup = function() {
                var inputLength = inputArray().length,
                    outputLength = outputArray().length;
                if (outputLength < inputLength) {
                    outputArray.push.apply(outputArray, inputArray().slice(outputLength, outputLength + batchSize));
                    timeout = window.setTimeout(showNextGroup, batchInterval);
                }
            },
            previousContents = [];

        inputArray.subscribe(function(newContents) {
            window.clearTimeout(timeout);

            var diff = ko.utils.compareArrays(previousContents, newContents, { sparse: true });
            previousContents = newContents.slice(0);
            if (diff.length > useBatchingSizeThreshold) {
            	// It's a large change - emit it in batches
	            outputArray([]);
	            showNextGroup();
            } else {
            	// It's a small change - apply it in place
            	outputArray(previousContents);
            }
        });

        return outputArray;
    };
});
