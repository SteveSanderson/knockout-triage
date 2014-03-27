define(["knockout", "jquery"], function(ko, $) {
    
    ko.bindingHandlers.showModal = {
        init: function(elem, valueAccessor) {
            // When closed, clear selection
            $(elem).on('hidden.bs.modal', function (e) {
                var modelValue = valueAccessor();
                if (ko.isWriteableObservable(modelValue)) {
                    modelValue(null);
                }
            });
        },
        update: function(elem, valueAccessor) {
            // React to selection changes by opening/closing
            var shouldShow = ko.unwrap(valueAccessor());
            $(elem).modal(shouldShow ? 'show' : 'hide');
        }
    }

    ko.bindingHandlers.triageLabel = {
        update: function(elem, valueAccessor) {
            var label = ko.unwrap(valueAccessor());
            if (label) {
                $(elem).show()
                    .text(label.shortText)
                    .css({ backgroundColor: label.backColor, color: label.foreColor });
            } else {
                $(elem).hide();
            }
        }
    }

});
