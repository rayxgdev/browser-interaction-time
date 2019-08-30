interface BaseTimeEllapsedCallbackData {
    callback: (timeInMs: number, active: boolean) => void;
    timeInMilliseconds: number;
}
declare type BasicCallback = (timeInMs: number, active: boolean) => void;
export interface TimeIntervalEllapsedCallbackData extends BaseTimeEllapsedCallbackData {
    multiplier: (time: number) => number;
}
export interface AbsoluteTimeEllapsedCallbackData extends BaseTimeEllapsedCallbackData {
    pending: boolean;
}
interface Settings {
    timeIntervalEllapsedCallbacks?: TimeIntervalEllapsedCallbackData[];
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
    private checkCallbacksIntervalMs;
    private browserTabActiveCallbacks;
    private browserTabInactiveCallbacks;
    private timeIntervalEllapsedCallbacks;
    private absoluteTimeEllapsedCallbacks;
    private marks;
    private measures;
    private localKey;
    private guidKey;
    private guid;
    private sourceUrl;
    private targetUrl;
    constructor({ timeIntervalEllapsedCallbacks, absoluteTimeEllapsedCallbacks, checkCallbacksIntervalMs, browserTabInactiveCallbacks, browserTabActiveCallbacks, times, timesIdle, localKey, idleTimeoutMs, sourceUrl, targetUrl }: Settings);
    private generateGuid;
    private onBrowserTabInactive;
    private onBrowserTabActive;
    private onTimePassed;
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
