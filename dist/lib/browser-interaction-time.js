"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
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
        var timeIntervalEllapsedCallbacks = _a.timeIntervalEllapsedCallbacks, timeIntervalRemoteCallback = _a.timeIntervalRemoteCallback, absoluteTimeEllapsedCallbacks = _a.absoluteTimeEllapsedCallbacks, checkCallbacksIntervalMs = _a.checkCallbacksIntervalMs, browserTabInactiveCallbacks = _a.browserTabInactiveCallbacks, browserTabActiveCallbacks = _a.browserTabActiveCallbacks, times = _a.times, timesIdle = _a.timesIdle, localKey = _a.localKey, idleTimeoutMs = _a.idleTimeoutMs, sourceUrl = _a.sourceUrl, targetUrl = _a.targetUrl, service = _a.service;
        this.initTimers = function () { return __awaiter(_this, void 0, void 0, function () {
            var activeTime, idleTime, responseActiveTime, responseIdleTime;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        activeTime = BrowserInteractionTime.getActiveTime(this.localKey);
                        idleTime = BrowserInteractionTime.getIdleTime(this.localKey);
                        responseActiveTime = 0;
                        responseIdleTime = 0;
                        if (!this.serviceData) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.remoteCallback({ method: 'GET' })
                                .then(function (res) {
                                var responseData = res.data;
                                if (responseData) {
                                    if (responseData.hasOwnProperty(_this.serviceData.response.active)) {
                                        responseActiveTime = responseData[_this.serviceData.response.active];
                                    }
                                    if (responseData.hasOwnProperty(_this.serviceData.response.idle)) {
                                        responseIdleTime = responseData[_this.serviceData.response.idle];
                                    }
                                    var finalActiveTime = activeTime > _this.getTimeInMilliseconds() ? (activeTime > responseActiveTime ? activeTime : responseActiveTime) : (_this.getTimeInMilliseconds() > responseActiveTime ? _this.getTimeInMilliseconds() : responseActiveTime);
                                    _this.times = BrowserInteractionTime.initTimer(finalActiveTime);
                                    _this.storageTimesObject(_this.localKey, _this.times, true);
                                    var finalIdleTime = idleTime > _this.getIdleTimeInMilliseconds() ? (idleTime > responseIdleTime ? idleTime : responseIdleTime) : (_this.getIdleTimeInMilliseconds() > responseIdleTime ? _this.getIdleTimeInMilliseconds() : responseIdleTime);
                                    _this.timesIdle = BrowserInteractionTime.initTimer(finalIdleTime);
                                    _this.storageTimesObject(_this.localKey, _this.timesIdle, false);
                                }
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        }); };
        this.generateGuid = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                /*eslint-disable*/
                var r = Math.random() * 16 | 0;
                var v = c === 'x' ? r : (r & 0x3 | 0x8);
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
            if (_this.getCurrentGuid() === _this.guid) {
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
                _this.timeIntervalRemoteCallback.forEach(function (_a, index) {
                    var callbackData = _a.callbackData, timeInMilliseconds = _a.timeInMilliseconds, multiplier = _a.multiplier, timeout = _a.timeout;
                    if (timeInMilliseconds >= timeout) {
                        if (!_this.serviceData) {
                            console.error('You cannot use function remoteCallBack() without declare service at BrowserInteractionTime constructor\'s');
                            _this.timeIntervalRemoteCallback[index].timeout = Infinity; // Set timeout to Infinity to stop fetchService
                        }
                        else {
                            _this.remoteCallback(callbackData).then().catch();
                            _this.timeIntervalRemoteCallback[index].timeInMilliseconds = 0;
                        }
                    }
                    else {
                        _this.timeIntervalRemoteCallback[index].timeInMilliseconds = multiplier(timeInMilliseconds);
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
        this.remoteCallback = function (data) {
            return new Promise(function (resolve, reject) {
                var extraData = typeof _this.serviceData.customUrl === 'string' ? { customUrl: _this.serviceData.customUrl } : {};
                data = __assign({}, data, extraData);
                var hasCustomUrl = data.hasOwnProperty('customUrl') && ['undefined', 'boolean'].indexOf(typeof data.customUrl) === -1;
                var method = data.hasOwnProperty('method') ? data.method : 'GET';
                var timesObject = {
                    timeActive: _this.getTimeInMillisecondsOf(BrowserInteractionTime.getActiveTimesObject(_this.localKey)),
                    timeIdle: _this.getTimeInMillisecondsOf(BrowserInteractionTime.getIdleTimesObject(_this.localKey))
                };
                var dataToSend = __assign({}, _this.serviceData.data, timesObject);
                if (data.hasOwnProperty('data')) {
                    dataToSend = __assign({}, dataToSend, data.data);
                }
                if (hasCustomUrl || _this.targetUrl || _this.sourceUrl) {
                    var request = {
                        method: method
                    };
                    var url = hasCustomUrl ? data.customUrl : (method === 'GET' && _this.sourceUrl ? _this.sourceUrl : _this.targetUrl);
                    if (method === 'GET') {
                        var params_1 = url.indexOf('?') !== -1 ? '&' : '?';
                        Object.keys(dataToSend).forEach(function (dataKey) {
                            params_1 += dataKey + '=' + dataToSend[dataKey] + '&';
                        });
                        url += params_1.slice(0, params_1.length - 1);
                    }
                    else {
                        request.body = JSON.stringify(dataToSend);
                    }
                    fetch(url, request)
                        .then(function (res) { return resolve(res.json()); }).catch();
                }
                else {
                    resolve(false);
                }
            });
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
                if (_this.serviceData) {
                    _this.remoteCallback({ method: 'POST' }).then().catch();
                }
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
            if (!_this.isRunning() && _this.guid === _this.getCurrentGuid()) {
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
            if (times == null) {
                times = '[{}]';
            }
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
        this.remoteTimeout = 0;
        this.timeIntervalEllapsedCallbacks = timeIntervalEllapsedCallbacks || [];
        this.timeIntervalRemoteCallback = timeIntervalRemoteCallback || [];
        this.absoluteTimeEllapsedCallbacks = absoluteTimeEllapsedCallbacks || [];
        this.localKey = localKey || 'XXXX';
        this.guidKey = 'browserTabGuid-' + this.localKey;
        this.guid = this.generateGuid();
        this.sourceUrl = sourceUrl || false;
        this.targetUrl = targetUrl || false;
        this.serviceData = service || false;
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
        return (time === null) ? [] : [{
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
exports.default = BrowserInteractionTime;
//# sourceMappingURL=browser-interaction-time.js.map