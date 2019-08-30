/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var windowIdleEvents = ['scroll', 'resize'];
var documentIdleEvents = [
    'wheel',
    'keydown',
    'keyup',
    'mousedown',
    'mousemove',
    'touchstart',
    'touchmove',
    'click',
    'contextmenu'
];
var BrowserInteractionTime = /** @class */ (function () {
    function BrowserInteractionTime(_a) {
        var _this = this;
        var timeIntervalEllapsedCallbacks = _a.timeIntervalEllapsedCallbacks, absoluteTimeEllapsedCallbacks = _a.absoluteTimeEllapsedCallbacks, checkCallbacksIntervalMs = _a.checkCallbacksIntervalMs, browserTabInactiveCallbacks = _a.browserTabInactiveCallbacks, browserTabActiveCallbacks = _a.browserTabActiveCallbacks, times = _a.times, timesIdle = _a.timesIdle, localKey = _a.localKey, idleTimeoutMs = _a.idleTimeoutMs, sourceUrl = _a.sourceUrl, targetUrl = _a.targetUrl;
        this.generateGuid = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                /*eslint-disable*/
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                /*eslint-enable*/
                return v.toString(16);
            });
        };
        this.onBrowserTabInactive = function (event) {
            // if running pause timer
            if (_this.isRunning()) {
                _this.stopTimer();
            }
            _this.browserTabInactiveCallbacks.forEach(function (fn) {
                return fn(_this.getTimeInMillisecondsOf(BrowserInteractionTime.getIdleTimesObject(_this.localKey)), false);
            });
        };
        this.onBrowserTabActive = function (event) {
            setTimeout(function () {
                // if not running start timer
                if (!_this.isRunning()) {
                    _this.running = true;
                    if (_this.getCurrentGuid() !== _this.guid) {
                        _this.setCurrentGuid();
                        _this.timesIdle = BrowserInteractionTime.getIdleTimesObject(_this.localKey, function (times) { return JSON.parse(times); });
                        _this.timesIdle[_this.timesIdle.length - 1].stop = _this.timesIdle[_this.timesIdle.length - 1].start;
                        _this.stopTimer(false);
                    }
                    _this.startTimer();
                }
                else if (_this.isRunning() && _this.guid !== _this.getCurrentGuid()) {
                    _this.setCurrentGuid();
                    _this.timesIdle = BrowserInteractionTime.getIdleTimesObject(_this.localKey, function (times) { return JSON.parse(times); });
                    _this.startTimer();
                }
                _this.browserTabActiveCallbacks.forEach(function (fn) {
                    fn(_this.getTimeInMillisecondsOf(BrowserInteractionTime.getActiveTimesObject(_this.localKey)), true);
                });
            }, 100);
        };
        this.onTimePassed = function () {
            var timesActiveStoraged = BrowserInteractionTime.getActiveTimesObject(_this.localKey);
            var timesIdleStoraged = BrowserInteractionTime.getIdleTimesObject(_this.localKey);
            if (timesActiveStoraged == null) {
                _this.storageTimesObject(_this.localKey, _this.times, true);
            }
            if (timesIdleStoraged == null) {
                _this.storageTimesObject(_this.localKey, _this.timesIdle, false);
            }
            if (_this.guid !== _this.getCurrentGuid()) {
                _this.times = BrowserInteractionTime.getActiveTimesObject(_this.localKey, function (time) { return JSON.parse(time); });
                _this.timesIdle = BrowserInteractionTime.getIdleTimesObject(_this.localKey, function (timeIdle) { return JSON.parse(timeIdle); });
            }
            // check all callbacks time and if passed execute callback
            if (_this.getCurrentGuid() == _this.guid) {
                _this.absoluteTimeEllapsedCallbacks.forEach(function (_a, index) {
                    var callback = _a.callback, pending = _a.pending, timeInMilliseconds = _a.timeInMilliseconds;
                    if (pending && timeInMilliseconds <= _this.getTimeInMillisecondsOf(BrowserInteractionTime.getActiveTimesObject(_this.localKey))) {
                        if (!_this.running) {
                            callback(_this.getTimeInMillisecondsOf(BrowserInteractionTime.getIdleTimesObject(_this.localKey)), false);
                        }
                        else {
                            callback(_this.getTimeInMillisecondsOf(BrowserInteractionTime.getActiveTimesObject(_this.localKey)), true);
                        }
                        _this.absoluteTimeEllapsedCallbacks[index].pending = false;
                    }
                });
                _this.timeIntervalEllapsedCallbacks.forEach(function (_a, index) {
                    var callback = _a.callback, timeInMilliseconds = _a.timeInMilliseconds, multiplier = _a.multiplier;
                    if (timeInMilliseconds <= _this.getTimeInMillisecondsOf(BrowserInteractionTime.getActiveTimesObject(_this.localKey))) {
                        if (!_this.running) {
                            callback(_this.getTimeInMillisecondsOf(BrowserInteractionTime.getIdleTimesObject(_this.localKey)), false);
                        }
                        else if (_this.running && !_this.idle) {
                            callback(_this.getTimeInMillisecondsOf(BrowserInteractionTime.getActiveTimesObject(_this.localKey)), true);
                        }
                        _this.timeIntervalEllapsedCallbacks[index].timeInMilliseconds = multiplier(timeInMilliseconds);
                    }
                });
                if (_this.currentIdleTimeMs >= _this.idleTimeoutMs && _this.isRunning()) {
                    _this.idle = true;
                    _this.stopTimer();
                }
                else {
                    _this.currentIdleTimeMs += _this.checkCallbacksIntervalMs;
                }
            }
        };
        this.resetIdleTime = function () {
            if (_this.idle) {
                _this.startTimer();
            }
            _this.idle = false;
            _this.currentIdleTimeMs = 0;
        };
        this.registerEventListeners = function () {
            var documentListenerOptions = { passive: true };
            var windowListenerOptions = __assign({}, documentListenerOptions, { capture: true });
            window.addEventListener('blur', _this.onBrowserTabInactive, windowListenerOptions);
            window.addEventListener('focusout', _this.onBrowserTabInactive, windowListenerOptions);
            window.addEventListener('focus', _this.onBrowserTabActive, windowListenerOptions);
            window.addEventListener('beforeunload', function (e) {
                e.preventDefault();
                console.log(_this.guid + ' <-- ADIOS');
            }, windowListenerOptions);
            var throttleResetIdleTime = function () { return setTimeout(_this.resetIdleTime, 100); };
            windowIdleEvents.forEach(function (event) {
                window.addEventListener(event, throttleResetIdleTime, windowListenerOptions);
            });
            documentIdleEvents.forEach(function (event) {
                return document.addEventListener(event, throttleResetIdleTime, documentListenerOptions);
            });
        };
        this.unregisterEventListeners = function () {
            window.removeEventListener('blur', _this.onBrowserTabInactive);
            window.removeEventListener('focus', _this.onBrowserTabActive);
            windowIdleEvents.forEach(function (event) {
                return window.removeEventListener(event, _this.resetIdleTime);
            });
            documentIdleEvents.forEach(function (event) {
                return document.removeEventListener(event, _this.resetIdleTime);
            });
        };
        this.checkCallbacksOnInterval = function () {
            _this.checkCallbackIntervalId = window.setInterval(function () {
                _this.onTimePassed();
            }, _this.checkCallbacksIntervalMs);
        };
        this.getCurrentGuid = function () {
            return localStorage.getItem(_this.guidKey);
        };
        this.startTimer = function () {
            if (!_this.isRunning() && _this.guid == _this.getCurrentGuid()) {
                _this.running = true;
            }
            if (!_this.checkCallbackIntervalId) {
                _this.checkCallbacksOnInterval();
            }
            var last = _this.times[_this.times.length - 1];
            if (last && last.stop === null) {
                return;
            }
            if (_this.timesIdle.length > 1) {
                if (performance.now() < _this.timesIdle[_this.timesIdle.length - 1].start) {
                    _this.timesIdle[_this.timesIdle.length - 1].stop = _this.timesIdle[_this.timesIdle.length - 1].start;
                }
                else {
                    _this.timesIdle[_this.timesIdle.length - 1].stop = performance.now();
                }
                _this.storageTimesObject(_this.localKey, _this.timesIdle, false);
            }
            _this.times.push({
                start: performance.now(),
                stop: null
            });
            _this.storageTimesObject(_this.localKey, _this.times, true);
        };
        this.stopTimer = function (stopTimeActive) {
            if (stopTimeActive === void 0) { stopTimeActive = true; }
            if (!_this.times.length) {
                return;
            }
            _this.running = false;
            var last = _this.timesIdle[_this.timesIdle.length - 1];
            if (last && last.stop === null) {
                return;
            }
            if (stopTimeActive) {
                _this.times[_this.times.length - 1].stop = performance.now();
                _this.storageTimesObject(_this.localKey, _this.times, true);
            }
            _this.timesIdle.push({
                start: performance.now(),
                stop: null
            });
            _this.storageTimesObject(_this.localKey, _this.timesIdle, false);
        };
        this.addTimeIntervalEllapsedCallback = function (timeIntervalEllapsedCallback) {
            _this.timeIntervalEllapsedCallbacks.push(timeIntervalEllapsedCallback);
        };
        this.addAbsoluteTimeEllapsedCallback = function (absoluteTimeEllapsedCallback) {
            _this.absoluteTimeEllapsedCallbacks.push(absoluteTimeEllapsedCallback);
        };
        this.addBrowserTabInactiveCallback = function (browserTabInactiveCallback) {
            _this.browserTabInactiveCallbacks.push(browserTabInactiveCallback);
        };
        this.addBrowserTabActiveCallback = function (browserTabActiveCallback) {
            _this.browserTabActiveCallbacks.push(browserTabActiveCallback);
        };
        this.getTimeInMilliseconds = function () {
            return _this.times.reduce(function (acc, current) {
                if (current.stop) {
                    acc = acc + (current.stop - current.start);
                }
                else {
                    acc = acc + (performance.now() - current.start);
                }
                return acc;
            }, 0);
        };
        this.getTimeInMillisecondsOf = function (times) {
            return JSON.parse(times).reduce(function (acc, current) {
                if (current.stop) {
                    acc = acc + (current.stop - current.start);
                }
                else {
                    acc = acc + (performance.now() - current.start);
                }
                return acc;
            }, 0);
        };
        this.getIdleTimeInMilliseconds = function () {
            return _this.timesIdle.reduce(function (acc, current) {
                if (current.stop) {
                    acc = acc + (current.stop - current.start);
                }
                else {
                    acc = acc + (performance.now() - current.start);
                }
                return acc;
            }, 0);
        };
        this.isRunning = function () {
            return _this.running;
        };
        this.reset = function () {
            _this.times = [];
        };
        this.destroy = function () {
            _this.unregisterEventListeners();
            if (_this.checkCallbackIntervalId) {
                window.clearInterval(_this.checkCallbackIntervalId);
            }
        };
        this.storageTimesObject = function (key, times, active) {
            if (active === void 0) { active = true; }
            if (active) {
                localStorage.setItem('browserTimeActiveObject-' + key, JSON.stringify(times));
            }
            else if (!active) {
                localStorage.setItem('browserTimeIdleObject-' + key, JSON.stringify(times));
            }
        };
        this.running = false;
        this.times = times || [];
        this.timesIdle = timesIdle || [];
        this.idle = false;
        this.currentIdleTimeMs = 0;
        this.marks = {};
        this.measures = {};
        this.browserTabActiveCallbacks = browserTabActiveCallbacks || [];
        this.browserTabInactiveCallbacks = browserTabInactiveCallbacks || [];
        this.checkCallbacksIntervalMs = checkCallbacksIntervalMs || 100;
        this.idleTimeoutMs = idleTimeoutMs || 3000; // 3s;
        this.timeIntervalEllapsedCallbacks = timeIntervalEllapsedCallbacks || [];
        this.absoluteTimeEllapsedCallbacks = absoluteTimeEllapsedCallbacks || [];
        this.localKey = localKey || 'XXXX';
        this.guidKey = 'browserTabGuid-' + this.localKey;
        this.guid = this.generateGuid();
        this.sourceUrl = sourceUrl || false;
        this.targetUrl = targetUrl || false;
        this.registerEventListeners();
        this.setCurrentGuid();
    }
    BrowserInteractionTime.prototype.setCurrentGuid = function () {
        localStorage.setItem(this.guidKey, this.guid);
    };
    BrowserInteractionTime.getActiveTimesObject = function (key, cb) {
        var activeTime = localStorage.getItem('browserTimeActiveObject-' + key);
        if (cb) {
            return cb(activeTime);
        }
        else {
            return activeTime;
        }
    };
    BrowserInteractionTime.getIdleTimesObject = function (key, cb) {
        var idleTime = localStorage.getItem('browserTimeIdleObject-' + key);
        if (cb) {
            return cb(idleTime);
        }
        else {
            return idleTime;
        }
    };
    BrowserInteractionTime.prototype.mark = function (key) {
        if (!this.marks[key]) {
            this.marks[key] = [];
        }
        this.marks[key].push({ time: this.getTimeInMillisecondsOf(BrowserInteractionTime.getActiveTimesObject(this.localKey)) });
    };
    BrowserInteractionTime.prototype.getMarks = function (name) {
        if (this.marks[name].length < 1) {
            return;
        }
        return this.marks[name];
    };
    BrowserInteractionTime.prototype.measure = function (name, startMarkName, endMarkName) {
        var startMarks = this.marks[startMarkName];
        var startMark = startMarks[startMarks.length - 1];
        var endMarks = this.marks[endMarkName];
        var endMark = endMarks[endMarks.length - 1];
        if (!this.measures[name]) {
            this.measures[name] = [];
        }
        this.measures[name].push({
            name: name,
            startTime: startMark.time,
            duration: endMark.time - startMark.time
        });
    };
    BrowserInteractionTime.prototype.getMeasures = function (name) {
        if (!this.measures[name] && this.measures[name].length < 1) {
            return;
        }
        return this.measures[name];
    };
    BrowserInteractionTime.initTimer = function (time) {
        return time == null ? [] : [{
                start: performance.now(),
                stop: (parseFloat(time))
            }];
    };
    BrowserInteractionTime.storageTime = function (key) { return function (time, active) {
        if (active) {
            localStorage.setItem('browserTimeActive-' + key, (time).toString());
        }
        else if (!active) {
            localStorage.setItem('browserTimeIdle-' + key, (time).toString());
        }
    }; };
    BrowserInteractionTime.getActiveTime = function (key, cb) {
        var activeTime = localStorage.getItem('browserTimeActive-' + key);
        if (cb) {
            return cb(activeTime);
        }
        else {
            return activeTime;
        }
    };
    BrowserInteractionTime.getIdleTime = function (key, cb) {
        var idleTime = localStorage.getItem('browserTimeIdle-' + key);
        if (cb) {
            return cb(idleTime);
        }
        else {
            return idleTime;
        }
    };
    return BrowserInteractionTime;
}());
//# sourceMappingURL=browser-interaction-time.js.map

export default BrowserInteractionTime;
//# sourceMappingURL=browser-interaction-time.es5.js.map
