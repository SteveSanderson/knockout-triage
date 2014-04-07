// ------------------------------------------------------------------------------
// The following custom elements module is a PROTOTYPE. It is not heavily tested.
// ------------------------------------------------------------------------------

(function(global, undefined) {
    function attachToKo(ko) {
        ko.components.getComponentNameFromNode = function(node) {
            if (node && node.nodeType === 1) {
                var tagNameLower = node.tagName.toLowerCase();
                return ko.components.isRegistered(tagNameLower) ? tagNameLower : null;
            }

            return null;
        };

        ko.componentBindingProvider = function(providerToWrap) {
            this._providerToWrap = providerToWrap;
            this._nativeBindingProvider = new ko.bindingProvider();
        };

        ko.componentBindingProvider.prototype.nodeHasBindings = function(node) {
            if (ko.components.getComponentNameFromNode(node)) {
                return true;
            }

            return this._providerToWrap.nodeHasBindings.apply(this._providerToWrap, arguments);
        };

        ko.componentBindingProvider.prototype.getBindingAccessors = function(node, bindingContext) {
            var bindings = this._providerToWrap.getBindingAccessors.apply(this._providerToWrap, arguments),
                componentName = ko.components.getComponentNameFromNode(node);

            if (componentName) {
                bindings = bindings || {};
                if (bindings.component) {
                    throw new Error("Disallowed binding 'component' on custom element " + node);
                }

                // Wrap the data extraction inside a ko.computed purely to suppress dependency detection.
                // We don't want the component to be torn down and rebuilt whenever any of the observables
                // read to supply its data changes. Instead we wrap any such observables and pass them
                // onto the component itself, so it can react to changes without being completely replaced.
                // **Disabling this because I don't think it's necessary any more, now this has switched
                // to evaluating 'params' attributes inside computeds anyway**
                //ko.computed(function() {
                    var valueForComponentBindingHandler = {
                        name: componentName,
                        params: this._getComponentDataObjectFromAttributes(node, bindingContext)
                    };
                    bindings.component = function () { return valueForComponentBindingHandler; };
                //}, this);
            }

            return bindings;
        };

        ko.componentBindingProvider.prototype._getComponentDataObjectFromAttributes = function(elem, bindingContext) {
            var result = {},
                paramsAttribute = elem.getAttribute('params');

            if (paramsAttribute) {
                var params = this._nativeBindingProvider.parseBindingsString(paramsAttribute, bindingContext, elem, { valueAccessors: true });
                ko.utils.objectForEach(params, function(paramName, paramValue) {
                    // If the parameter *evaluation* involves some observable that might later change,
                    // supply it as a read-only computed. Otherwise pass through the value directly.
                    var computed = ko.computed(paramValue, null, { disposeWhenNodeIsRemoved: elem });
                    result[paramName] = computed.isActive() ? computed : computed();
                });
            }

            return result;
        };

        ko.bindingProvider.instance = new ko.componentBindingProvider(ko.bindingProvider.instance);

        supportOldIE();
    }

    // Note that since refactoring to build on KO's native components feature, none of the
    // following old-IE code has been tested or even run on an old IE instance, so might
    // have stopped working. The real implementation will be tested properly, of course.
    function supportOldIE() {
        var oldIeVersion = document && (function() {
            var version = 3,
                div = document.createElement('div'),
                iElems = div.getElementsByTagName('i');

            // Keep constructing conditional HTML blocks until we hit one that resolves to an empty fragment
            while (
                div.innerHTML = '<!--[if gt IE ' + (++version) + ']><i></i><![endif]-->',
                iElems[0]
            ) {}
            return version > 4 ? version : undefined;
        }());

        if (oldIeVersion < 9) {
            // Support old IE by patching ko.components.register to ensure that we have called
            // document.createElement(componentName) at least once before trying to parse any
            // markup that might use a custom element with that name
            var allCustomComponentNames = [];
            ko.components.register = (function(underlyingRegisterFunc) {
                return function(componentName) {
                    allCustomComponentNames.push(componentName);
                    underlyingRegisterFunc.apply(this, arguments);
                    document.createElement(componentName);
                };
            })(ko.components.register);

            // Also to enable custom elements on old IE, we have to call document.createElement(name)
            // on every document fragment that ever gets created. This is especially important
            // if you're also using jQuery, because its parseHTML code works by setting .innerHTML
            // on some element inside a temporary document fragment.
            // It would be nicer if jQuery exposed some API for registering custom element names,
            // but it doesn't.
            document.createDocumentFragment = (function(originalDocumentCreateDocumentFragment) {
                return function() {
                    // Note that you *can't* do originalDocumentCreateDocumentFragment.apply(this, arguments)
                    // because IE6/7 complain "object doesn't support this method". Fortunately the function
                    // doesn't take any parameters, and doesn't need a "this" value.
                    var docFrag = originalDocumentCreateDocumentFragment();
                    ko.utils.arrayForEach(allCustomComponentNames, docFrag.createElement.bind(docFrag));
                    return docFrag;
                };
            })(document.createDocumentFragment);
        }
    }

    // Determines which module loading scenario we're in, grabs dependencies, and attaches to KO
    function prepareExports() {
        if (typeof define === 'function' && define.amd) {
            // AMD anonymous module
            define(["knockout"], attachToKo);
        } else if ('ko' in global) {
            // Non-module case - attach to the global instance, and assume
            // knockout-components.js is already loaded.
            attachToKo(global.ko);
        } else {
            throw new Error('Couldn\'t find an instance of ko to attach to');
        }
    }

    prepareExports();
})(this);