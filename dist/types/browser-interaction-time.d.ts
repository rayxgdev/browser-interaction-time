interface BaseTimeEllapsedCallbackData {
    callback: (timeInMs: number, active: boolean) => void;
    timeInMilliseconds: number;
}
interface RemoteServiceData {
    data: {
        service?: string;
        id?: number;
    };
    response: {
        active: string;
        idle: string;
    };
    customUrl?: string;
}
interface RemoteTimeCallbackData {
    callbackData?: {};
    timeInMilliseconds: number;
    timeout: number;
}
declare type BasicCallback = (timeInMs: number, active: boolean) => void;
export interface TimeIntervalEllapsedCallbackData extends BaseTimeEllapsedCallbackData {
    multiplier: (time: number) => number;
}
export interface TimeIntervalRemoteCallback extends RemoteTimeCallbackData {
    multiplier: (time: number) => number;
}
export interface AbsoluteTimeEllapsedCallbackData extends BaseTimeEllapsedCallbackData {
    pending: boolean;
}
interface Settings {
    timeIntervalEllapsedCallbacks?: TimeIntervalEllapsedCallbackData[];
    timeIntervalRemoteCallback?: TimeIntervalRemoteCallback[];
    absoluteTimeEllapsedCallbacks?: AbsoluteTimeEllapsedCallbackData[];
    browserTabInactiveCallbacks?: BasicCallback[];
    browserTabActiveCallbacks?: BasicCallback[];
    idleTimeoutMs?: number;
    checkCallbacksIntervalMs?: number;
    times?: [];
    timesIdle?: [];
    localKey?: string;
    sourceUrl?: string;
    targetUrl?: string;
    service?: RemoteServiceData;
}
interface Mark {
    time: number;
}
interface Measure {
    name: string;
    startTime: number;
    duration: number;
}
export default class BrowserInteractionTime {
    private running;
    private times;
    private timesIdle;
    private idle;
    private checkCallbackIntervalId?;
    private currentIdleTimeMs;
    private idleTimeoutMs;
    private remoteTimeout;
    private checkCallbacksIntervalMs;
    private browserTabActiveCallbacks;
    private browserTabInactiveCallbacks;
    private timeIntervalEllapsedCallbacks;
    private timeIntervalRemoteCallback;
    private absoluteTimeEllapsedCallbacks;
    private marks;
    private measures;
    private localKey;
    private guidKey;
    private guid;
    private sourceUrl;
    private targetUrl;
    private serviceData;
    constructor({ timeIntervalEllapsedCallbacks, timeIntervalRemoteCallback, absoluteTimeEllapsedCallbacks, checkCallbacksIntervalMs, browserTabInactiveCallbacks, browserTabActiveCallbacks, times, timesIdle, localKey, idleTimeoutMs, sourceUrl, targetUrl, service, }: Settings);
    private initTimers;
    private generateGuid;
    private onBrowserTabInactive;
    private onBrowserTabActive;
    private onTimePassed;
    private remoteCallback;
    private resetIdleTime;
    private registerEventListeners;
    private unregisterEventListeners;
    private checkCallbacksOnInterval;
    private getCurrentGuid;
    private setCurrentGuid;
    static getActiveTimesObject(key: string, cb?: Function): any;
    static getIdleTimesObject(key: string, cb?: Function): any;
    startTimer: () => void;
    stopTimer: (stopTimeActive?: boolean) => void;
    addTimeIntervalEllapsedCallback: (timeIntervalEllapsedCallback: TimeIntervalEllapsedCallbackData) => void;
    addAbsoluteTimeEllapsedCallback: (absoluteTimeEllapsedCallback: AbsoluteTimeEllapsedCallbackData) => void;
    addBrowserTabInactiveCallback: (browserTabInactiveCallback: BasicCallback) => void;
    addBrowserTabActiveCallback: (browserTabActiveCallback: BasicCallback) => void;
    getTimeInMilliseconds: () => number;
    getTimeInMillisecondsOf: (times: any) => number;
    getIdleTimeInMilliseconds: () => number;
    isRunning: () => boolean;
    reset: () => void;
    destroy: () => void;
    mark(key: string): void;
    getMarks(name: string): Mark[] | undefined;
    measure(name: string, startMarkName: string, endMarkName: string): void;
    getMeasures(name: string): Measure[] | undefined;
    static storageTime: (key: string) => (time: any, active: any) => void;
    storageTimesObject: (key: string, times: any, active?: boolean) => void;
    static initTimer(time: string): {
        start: number;
        stop: number;
    }[];
    static getActiveTime: (key: string, cb?: Function | undefined) => any;
    static getIdleTime: (key: string, cb?: Function | undefined) => any;
}
export {};
