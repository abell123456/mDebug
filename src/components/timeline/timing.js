export default {
    /**
     * Outputs extended measurements using Navigation Timing API
     * @param  Object opts Options (simple (bool) - opts out of full data view)
     * @return Object      measurements
     */
    getTimes: function(opts) {
        var performance = window.performance || window.webkitPerformance || window.msPerformance || window.mozPerformance;

        if (performance === undefined) {
            return false;
        }

        var timing = performance.timing;
        var api = {};
        opts = opts || {};

        if (timing) {
            if (opts && !opts.simple) {
                for (var k in timing) {
                    if (timing.hasOwnProperty(k)) {
                        api[k] = timing[k];
                    }
                }
            }


            // Time to first paint
            if (api.firstPaint === undefined) {
                // All times are relative times to the start time within the
                // same objects
                var firstPaint = 0;

                // Chrome
                if (window.chrome && window.chrome.loadTimes) {
                    // Convert to ms
                    firstPaint = window.chrome.loadTimes().firstPaintTime * 1000;
                    api.firstPaintTime = firstPaint - (window.chrome.loadTimes().startLoadTime * 1000);
                }
                // IE
                else if (typeof window.performance.timing.msFirstPaint === 'number') {
                    firstPaint = window.performance.timing.msFirstPaint;
                    api.firstPaintTime = firstPaint - window.performance.timing.navigationStart;
                }

                if (opts && !opts.simple) {
                    api.firstPaint = firstPaint;
                }
            }

            // Total time from start to load
            api.loadTime = timing.loadEventEnd - timing.fetchStart;
            // Time spent constructing the DOM tree
            api.domReadyTime = timing.domComplete - timing.domInteractive;
            // Time consumed preparing the new page
            api.readyStart = timing.fetchStart - timing.navigationStart;
            // Time spent during redirection
            api.redirectTime = timing.redirectEnd - timing.redirectStart;
            // AppCache
            api.appcacheTime = timing.domainLookupStart - timing.fetchStart;
            // Time spent unloading documents
            api.unloadEventTime = timing.unloadEventEnd - timing.unloadEventStart;
            // DNS query time
            api.lookupDomainTime = timing.domainLookupEnd - timing.domainLookupStart;
            // TCP connection time
            api.connectTime = timing.connectEnd - timing.connectStart;
            // Time spent during the request
            api.requestTime = timing.responseEnd - timing.requestStart;
            // Request to completion of the DOM loading
            api.initDomTreeTime = timing.domInteractive - timing.responseEnd;
            // Load event time
            api.loadEventTime = timing.loadEventEnd - timing.loadEventStart;

            if(Math.abs(api.initDomTreeTime) > 1304136942) {
                api.initDomTreeTime = 0;
            }

            if(Math.abs(api.loadTime) > 1304136942) {
                api.loadTime = 0;
            }
        }

        return api;
    },
    /**
     * Uses console.table() to print a complete table of timing information
     * @param  Object opts Options (simple (bool) - opts out of full data view)
     */
    printTable: function(opts) {
        var table = {};
        var data = this.getTimes(opts) || {};
        Object.keys(data).sort().forEach(function(k) {
            table[k] = {
                k: k,
                ms: data[k],
                s: +((data[k] / 1000).toFixed(2))
            };
        });
        return data;
    },
    /**
     * Uses console.table() to print a summary table of timing information
     */
    printSimpleTable: function() {
        return this.printTable({
            simple: true
        });
    }
};