(function () {
    var api;
    htmx.defineExtension("call", {
        init: function (htmx_api) {
            api = htmx_api;
        },
        onEvent: function (evt_type, evt) {
            switch (evt_type) {
                case "htmx:beforeProcessNode":
                    const parent = evt.target;

                    queryAttributeOnThisOrChildren(parent, "hx-bind").forEach(elt => {
                        addBindTriggers(elt);
                    });
            }
        }
    })

    function addBindTriggers(elt) {
        api.getTriggerSpecs(elt).forEach(function (ts) {
            api.addTriggerHandler(elt, ts, api.getInternalData(elt), function (elt, evt) {
                const bind = api.getAttributeValue(elt, "hx-call");

                if (!bind || !globalThis.hasOwnProperty(bind)) {
                    api.triggerErrorEvent(elt, 'htmx:bindCallError', { error: "bind function is not defined", target: elt, trigger: evt });
                    return;
                }

                var func = globalThis[bind];
                if (!api.triggerEvent(elt, 'htmx:beforeCall', { target: elt, function: func, trigger: evt })) {
                    return;
                }

                function after(result) {
                    if (!api.triggerEvent(elt, 'htmx:beforeOnCallLoad', { target: elt, result }) || !result) {
                        return;
                    }

                    if (result["hx-trigger"]) {
                      htmx.trigger(target, result["hx-trigger"]);
                    }

                    var target = api.getTarget(elt);

                    if (result["hx-retarget"]) {
                      if (result["hx-retarget"] == "this") {
                        target = elt;
                      } else {
                        target = api.find(result["hx-retarget"]);
                      }
                    }

                    const swap = api.getSwapSpecification(elt, result["hx-reswap"] || undefined);
                    const select = api.getAttributeValue(elt, "hx-call-content") || "content";
                    const content = typeof result == "string" ? result : result[select];
                    const settle = api.makeSettleInfo(elt);

                    if (!api.triggerEvent(elt, 'htmx:beforeCallSwap', { target: elt, result })) {
                        return;
                    }

                    api.selectAndSwap(swap.swapStyle, target, elt, content, settle);

                    if (!api.triggerEvent(elt, 'htmx:beforeCallSettle', { target: elt, result })) {
                        return;
                    }

                    if (result["hx-trigger-after-swap"]) {
                      htmx.trigger(elt, result["hx-trigger-after-swap"]);
                    }

                    settle.tasks.forEach(function (task) {
                        task.call();
                    });
                    settle.elts.forEach(function (elt) {
                        api.triggerEvent(elt, 'htmx:afterCallSettle', { target: target, result });
                    });

                    if (result["hx-trigger-after-settle"]) {
                      htmx.trigger(elt, result["hx-trigger-after-settle"]);
                    }
                }

                const args = api.mergeObjects(api.getExpressionVars(elt), api.getInputValues(elt))

                Promise.resolve(func(args))
                    .then(after)
                    .catch(function (e) { api.triggerErrorEvent(elt, 'htmx:bindCallError', { error: e, target: elt }) });
            });
        });
    }

    function queryAttributeOnThisOrChildren(elt, attributeName) {
        const result = [];

        if (api.hasAttribute(elt, attributeName)) {
            result.push(elt);
        }

        api.findAll(elt, "[" + attributeName + "], [data-" + attributeName + "]").forEach(function (node) {
            result.push(node);
        })

        return result;
    }
})()
