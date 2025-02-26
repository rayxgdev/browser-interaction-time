interface BaseTimeEllapsedCallbackData {
  callback: (timeInMs: number, active: boolean) => void
  timeInMilliseconds: number
}

interface RemoteCallBackData {
  method?: string,
  customUrl?: string,
  data?: any
}

interface RemoteServiceData {
  data: { service?: string, id?: number },
  response: { active: string, idle: string },
  customUrl?: string
}
interface RemoteTimeCallbackData {
  callbackData?: {},
  timeInMilliseconds: number,
  timeout: number
}

type BasicCallback = (timeInMs: number, active: boolean) => void

export interface TimeIntervalEllapsedCallbackData
  extends BaseTimeEllapsedCallbackData {
  multiplier: (time: number) => number
}

export interface TimeIntervalRemoteCallback
  extends RemoteTimeCallbackData {
  multiplier: (time: number) => number
}

export interface AbsoluteTimeEllapsedCallbackData
  extends BaseTimeEllapsedCallbackData {
  pending: boolean
}

interface Settings {
  timeIntervalEllapsedCallbacks?: TimeIntervalEllapsedCallbackData[],
  timeIntervalRemoteCallback?: TimeIntervalRemoteCallback[],
  absoluteTimeEllapsedCallbacks?: AbsoluteTimeEllapsedCallbackData[],
  browserTabInactiveCallbacks?: BasicCallback[],
  browserTabActiveCallbacks?: BasicCallback[],
  idleTimeoutMs?: number,
  checkCallbacksIntervalMs?: number,
  times?: [],
  timesIdle?: [],
  localKey?: string,
  sourceUrl?: string,
  targetUrl?: string,
  service?: RemoteServiceData
}
interface Times {
  start: number
  stop: number | null
}

interface Mark {
  time: number
}

interface Marks {
  [key: string]: Mark[]
}

interface Measure {
  name: string
  startTime: number
  duration: number
}

interface Measures {
  [key: string]: Measure[]
}
const windowIdleEvents = ['scroll', 'resize']
const documentIdleEvents = [
  'wheel',
  'keydown',
  'keyup',
  'mousedown',
  'mousemove',
  'touchstart',
  'touchmove',
  'click',
  'contextmenu'
]

export default class BrowserInteractionTime {
  private running: boolean;
  private times: Times[];
  private timesIdle: Times[];
  private idle: boolean;
  private checkCallbackIntervalId?: number;
  private currentIdleTimeMs: number;

  private idleTimeoutMs: number;
  private remoteTimeout: number;
  private checkCallbacksIntervalMs: number;
  private browserTabActiveCallbacks: BasicCallback[];
  private browserTabInactiveCallbacks: BasicCallback[];
  private timeIntervalEllapsedCallbacks: TimeIntervalEllapsedCallbackData[];
  private timeIntervalRemoteCallback: TimeIntervalRemoteCallback[];
  private absoluteTimeEllapsedCallbacks: AbsoluteTimeEllapsedCallbackData[];
  private marks: Marks;
  private measures: Measures;
  private localKey: string;
  private guidKey: string;
  private guid: string;
  private sourceUrl: string | boolean;
  private targetUrl: string | boolean;
  private serviceData: RemoteServiceData | boolean;

  constructor({
    timeIntervalEllapsedCallbacks,
    timeIntervalRemoteCallback,
    absoluteTimeEllapsedCallbacks,
    checkCallbacksIntervalMs,
    browserTabInactiveCallbacks,
    browserTabActiveCallbacks,
    times,
    timesIdle,
    localKey,
    idleTimeoutMs,
    sourceUrl,
    targetUrl,
    service,
  }: Settings) {
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
    this.idleTimeoutMs = idleTimeoutMs || 3000 // 3s;
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

  private initTimers = async () => {
    let activeTime = BrowserInteractionTime.getActiveTime(this.localKey);
    let idleTime = BrowserInteractionTime.getIdleTime(this.localKey);
    let responseActiveTime = 0;
    let responseIdleTime = 0;
    if (this.serviceData) {
      await this.remoteCallback({ method: 'GET' })
        .then((res: any) => {
          let responseData = res.data;
          if (responseData) {
            if (responseData.hasOwnProperty((this.serviceData as RemoteServiceData).response.active)) {
              responseActiveTime = responseData[(this.serviceData as RemoteServiceData).response.active];
            }
            if (responseData.hasOwnProperty((this.serviceData as RemoteServiceData).response.idle)) {
              responseIdleTime = responseData[(this.serviceData as RemoteServiceData).response.idle];
            }

            let finalActiveTime = activeTime > this.getTimeInMilliseconds() ? (activeTime > responseActiveTime ? activeTime : responseActiveTime) : (this.getTimeInMilliseconds() > responseActiveTime ? this.getTimeInMilliseconds() : responseActiveTime);
            this.times = BrowserInteractionTime.initTimer(finalActiveTime);
            this.storageTimesObject(this.localKey, this.times, true);
            let finalIdleTime = idleTime > this.getIdleTimeInMilliseconds() ? (idleTime > responseIdleTime ? idleTime : responseIdleTime) : (this.getIdleTimeInMilliseconds() > responseIdleTime ? this.getIdleTimeInMilliseconds() : responseIdleTime);
            this.timesIdle = BrowserInteractionTime.initTimer(finalIdleTime);
            this.storageTimesObject(this.localKey, this.timesIdle, false);
          }
        })
    }
  }

  private generateGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      /*eslint-disable*/
      let r = Math.random() * 16 | 0;
      let v = c === 'x' ? r : (r & 0x3 | 0x8);
      /*eslint-enable*/
      return v.toString(16);
    });
  }

  private onBrowserTabInactive = (event: Event) => {
    // if running pause timer
    if (this.isRunning()) {
      this.stopTimer();
    }

    this.browserTabInactiveCallbacks.forEach(fn =>
      fn(this.getTimeInMillisecondsOf(BrowserInteractionTime.getIdleTimesObject(this.localKey)), false)
    )
  }

  private onBrowserTabActive = (event: Event) => {
    setTimeout(() => {
      // if not running start timer
      if (!this.isRunning()) {
        this.running = true
        if (this.getCurrentGuid() !== this.guid) {
          this.setCurrentGuid();
          this.timesIdle = BrowserInteractionTime.getIdleTimesObject(this.localKey, (times: any) => JSON.parse(times));
          this.timesIdle[this.timesIdle.length - 1].stop = this.timesIdle[this.timesIdle.length - 1].start;
          this.stopTimer(false);
        }
        this.startTimer();
      } else if (this.isRunning() && this.guid !== this.getCurrentGuid()) {
        this.setCurrentGuid();
        this.timesIdle = BrowserInteractionTime.getIdleTimesObject(this.localKey, (times: any) => JSON.parse(times));
        this.startTimer();
      }

      this.browserTabActiveCallbacks.forEach(fn => {
        fn(this.getTimeInMillisecondsOf(BrowserInteractionTime.getActiveTimesObject(this.localKey)), true)
      }
      )
    }, 100);
  }

  private onTimePassed = () => {
    let timesActiveStoraged = BrowserInteractionTime.getActiveTimesObject(this.localKey);
    let timesIdleStoraged = BrowserInteractionTime.getIdleTimesObject(this.localKey);

    if (timesActiveStoraged == null) {
      this.storageTimesObject(this.localKey, this.times, true);
    }

    if (timesIdleStoraged == null) {
      this.storageTimesObject(this.localKey, this.timesIdle, false);
    }

    if (this.guid !== this.getCurrentGuid()) {
      this.times = BrowserInteractionTime.getActiveTimesObject(this.localKey, (time: string) => JSON.parse(time));
      this.timesIdle = BrowserInteractionTime.getIdleTimesObject(this.localKey, (timeIdle: string) => JSON.parse(timeIdle));
    }
    // check all callbacks time and if passed execute callback
    if (this.getCurrentGuid() === this.guid) {
      this.absoluteTimeEllapsedCallbacks.forEach(
        ({ callback, pending, timeInMilliseconds }, index) => {
          if (pending && timeInMilliseconds <= this.getTimeInMillisecondsOf(BrowserInteractionTime.getActiveTimesObject(this.localKey))) {
            if (!this.running) {
              callback(this.getTimeInMillisecondsOf(BrowserInteractionTime.getIdleTimesObject(this.localKey)), false);
            } else {
              callback(this.getTimeInMillisecondsOf(BrowserInteractionTime.getActiveTimesObject(this.localKey)), true);
            }
            this.absoluteTimeEllapsedCallbacks[index].pending = false
          }
        }
      )

      this.timeIntervalEllapsedCallbacks.forEach(
        ({ callback, timeInMilliseconds, multiplier }, index) => {
          if (timeInMilliseconds <= this.getTimeInMillisecondsOf(BrowserInteractionTime.getActiveTimesObject(this.localKey))) {
            if (!this.running) {
              callback(this.getTimeInMillisecondsOf(BrowserInteractionTime.getIdleTimesObject(this.localKey)), false);
            } else if (this.running && !this.idle) {
              callback(this.getTimeInMillisecondsOf(BrowserInteractionTime.getActiveTimesObject(this.localKey)), true);
            }
            this.timeIntervalEllapsedCallbacks[
              index
            ].timeInMilliseconds = multiplier(timeInMilliseconds)
          }
        }
      )

      this.timeIntervalRemoteCallback.forEach(
        ({ callbackData, timeInMilliseconds, multiplier, timeout }, index) => {
          if (timeInMilliseconds >= timeout) {
            if (!this.serviceData) {
              console.error('You cannot use function remoteCallBack() without declare service at BrowserInteractionTime constructor\'s');
              this.timeIntervalRemoteCallback[index].timeout = Infinity; // Set timeout to Infinity to stop fetchService
            } else {
              this.remoteCallback(callbackData as RemoteCallBackData).then().catch();
              this.timeIntervalRemoteCallback[index].timeInMilliseconds = 0;
            }
          } else {
            this.timeIntervalRemoteCallback[index].timeInMilliseconds = multiplier(timeInMilliseconds);
          }

        }
      )

      if (this.currentIdleTimeMs >= this.idleTimeoutMs && this.isRunning()) {
        this.idle = true;
        this.stopTimer();
      } else {
        this.currentIdleTimeMs += this.checkCallbacksIntervalMs;
      }
    }
  }

  private remoteCallback = (data: RemoteCallBackData) => {
    return new Promise((resolve, reject) => {
      let extraData = typeof (this.serviceData as RemoteServiceData).customUrl === 'string' ? { customUrl: (this.serviceData as RemoteServiceData).customUrl } : {}
      data = { ...data, ...extraData };
      let hasCustomUrl: boolean = data.hasOwnProperty('customUrl') && ['undefined', 'boolean'].indexOf(typeof data.customUrl) === -1;
      let method: string = data.hasOwnProperty('method') ? data.method as string : 'GET';
      let timesObject = {
        timeActive: this.getTimeInMillisecondsOf(BrowserInteractionTime.getActiveTimesObject(this.localKey)),
        timeIdle: this.getTimeInMillisecondsOf(BrowserInteractionTime.getIdleTimesObject(this.localKey))
      };
      let dataToSend: any = { ...(this.serviceData as RemoteServiceData).data, ...timesObject };
      if (data.hasOwnProperty('data')) {
        dataToSend = { ...dataToSend, ...data.data };
      }
      if (hasCustomUrl || this.targetUrl || this.sourceUrl) {
        let request: RequestInit = {
          method: method
        };
        let url = hasCustomUrl ? data.customUrl as string : (method === 'GET' && this.sourceUrl ? this.sourceUrl as string : this.targetUrl as string);
        if (method === 'GET') {
          let params = url.indexOf('?') !== -1 ? '&' : '?';
          Object.keys(dataToSend).forEach(dataKey => {
            params += dataKey + '=' + dataToSend[dataKey] + '&';
          });
          url += params.slice(0, params.length - 1);
        } else {
          request.body = JSON.stringify(dataToSend);
        }

        fetch(url, request)
          .then(res => resolve(res.json())).catch();
      } else {
        resolve(false);
      }
    });
  }

  private resetIdleTime = () => {
    if (this.idle) {
      this.startTimer()
    }
    this.idle = false
    this.currentIdleTimeMs = 0
  }

  private registerEventListeners = () => {
    const documentListenerOptions = { passive: true }
    const windowListenerOptions = { ...documentListenerOptions, capture: true }

    window.addEventListener(
      'blur',
      this.onBrowserTabInactive,
      windowListenerOptions
    )
    window.addEventListener(
      'focusout',
      this.onBrowserTabInactive,
      windowListenerOptions
    )
    window.addEventListener(
      'focus',
      this.onBrowserTabActive,
      windowListenerOptions
    )
    window.addEventListener(
      'beforeunload',
      (e) => {
        if (this.serviceData) {
          this.remoteCallback({ method: 'POST' } as RemoteCallBackData).then().catch();
        }
      },
      windowListenerOptions
    )

    const throttleResetIdleTime = () => setTimeout(this.resetIdleTime, 100);

    windowIdleEvents.forEach(event => {
      window.addEventListener(
        event,
        throttleResetIdleTime,
        windowListenerOptions
      )
    })

    documentIdleEvents.forEach(event =>
      document.addEventListener(
        event,
        throttleResetIdleTime,
        documentListenerOptions
      )
    )
  }

  private unregisterEventListeners = () => {
    window.removeEventListener('blur', this.onBrowserTabInactive)
    window.removeEventListener('focus', this.onBrowserTabActive)
    windowIdleEvents.forEach(event =>
      window.removeEventListener(event, this.resetIdleTime)
    )

    documentIdleEvents.forEach(event =>
      document.removeEventListener(event, this.resetIdleTime)
    )
  }

  private checkCallbacksOnInterval = () => {
    this.checkCallbackIntervalId = window.setInterval(() => {
      this.onTimePassed()
    }, this.checkCallbacksIntervalMs)
  }

  private getCurrentGuid = () => {
    return localStorage.getItem(this.guidKey);
  }

  private setCurrentGuid() {
    localStorage.setItem(this.guidKey, this.guid);
  }

  public static getActiveTimesObject(key: string, cb?: Function) {
    let activeTime = localStorage.getItem('browserTimeActiveObject-' + key);
    if (cb) {
      return cb(activeTime);
    } else {
      return activeTime;
    }
  }

  public static getIdleTimesObject(key: string, cb?: Function) {
    let idleTime = localStorage.getItem('browserTimeIdleObject-' + key);
    if (cb) {
      return cb(idleTime);
    } else {
      return idleTime;
    }
  }

  public startTimer = () => {
    if (!this.isRunning() && this.guid === this.getCurrentGuid()) {
      this.running = true
    }
    if (!this.checkCallbackIntervalId) {
      this.checkCallbacksOnInterval()
    }

    const last = this.times[this.times.length - 1]
    if (last && last.stop === null) {
      return
    }

    if (this.timesIdle.length > 1) {
      if (performance.now() < this.timesIdle[this.timesIdle.length - 1].start) {
        this.timesIdle[this.timesIdle.length - 1].stop = this.timesIdle[this.timesIdle.length - 1].start;
      } else {
        this.timesIdle[this.timesIdle.length - 1].stop = performance.now();
      }
      this.storageTimesObject(this.localKey, this.timesIdle, false);
    }

    this.times.push({
      start: performance.now(),
      stop: null
    });

    this.storageTimesObject(this.localKey, this.times, true);
  }

  public stopTimer = (stopTimeActive: boolean = true) => {
    if (!this.times.length) {
      return;
    }
    this.running = false;

    const last = this.timesIdle[this.timesIdle.length - 1]
    if (last && last.stop === null) {
      return
    }

    if (stopTimeActive) {
      this.times[this.times.length - 1].stop = performance.now();
      this.storageTimesObject(this.localKey, this.times, true);
    }
    this.timesIdle.push({
      start: performance.now(),
      stop: null
    });
    this.storageTimesObject(this.localKey, this.timesIdle, false);

  }

  public addTimeIntervalEllapsedCallback = (
    timeIntervalEllapsedCallback: TimeIntervalEllapsedCallbackData
  ) => {
    this.timeIntervalEllapsedCallbacks.push(timeIntervalEllapsedCallback)
  }

  public addAbsoluteTimeEllapsedCallback = (
    absoluteTimeEllapsedCallback: AbsoluteTimeEllapsedCallbackData
  ) => {
    this.absoluteTimeEllapsedCallbacks.push(absoluteTimeEllapsedCallback)
  }

  public addBrowserTabInactiveCallback = (
    browserTabInactiveCallback: BasicCallback
  ) => {
    this.browserTabInactiveCallbacks.push(browserTabInactiveCallback)
  }

  public addBrowserTabActiveCallback = (
    browserTabActiveCallback: BasicCallback
  ) => {
    this.browserTabActiveCallbacks.push(browserTabActiveCallback)
  }

  public getTimeInMilliseconds = (): number => {
    return this.times.reduce((acc, current) => {
      if (current.stop) {
        acc = acc + (current.stop - current.start)
      } else {
        acc = acc + (performance.now() - current.start)
      }
      return acc
    }, 0)
  }

  public getTimeInMillisecondsOf = (times: any): number => {
    if (times == null) {
      times = '[{}]';
    }
    return JSON.parse(times).reduce((acc: any, current: any) => {
      if (current.stop) {
        acc = acc + (current.stop - current.start)
      } else {
        acc = acc + (performance.now() - current.start)
      }
      return acc
    }, 0)
  }

  public getIdleTimeInMilliseconds = (): number => {
    return this.timesIdle.reduce((acc, current) => {
      if (current.stop) {
        acc = acc + (current.stop - current.start)
      } else {
        acc = acc + (performance.now() - current.start)
      }
      return acc
    }, 0)
  }

  public isRunning = () => {
    return this.running
  }

  public reset = () => {
    this.times = []
  }

  public destroy = () => {
    this.unregisterEventListeners()
    if (this.checkCallbackIntervalId) {
      window.clearInterval(this.checkCallbackIntervalId)
    }
  }

  public mark(key: string) {
    if (!this.marks[key]) {
      this.marks[key] = []
    }
    this.marks[key].push({ time: this.getTimeInMillisecondsOf(BrowserInteractionTime.getActiveTimesObject(this.localKey)) })
  }

  public getMarks(name: string) {
    if (this.marks[name].length < 1) {
      return
    }

    return this.marks[name]
  }

  public measure(name: string, startMarkName: string, endMarkName: string) {
    const startMarks = this.marks[startMarkName]
    const startMark = startMarks[startMarks.length - 1]
    const endMarks = this.marks[endMarkName]
    const endMark = endMarks[endMarks.length - 1]

    if (!this.measures[name]) {
      this.measures[name] = []
    }

    this.measures[name].push({
      name,
      startTime: startMark.time,
      duration: endMark.time - startMark.time
    })
  }

  public getMeasures(name: string) {
    if (!this.measures[name] && this.measures[name].length < 1) {
      return
    }

    return this.measures[name]
  }

  public static storageTime = (key: string) => (time: any, active: any) => {
    if (active) {
      localStorage.setItem('browserTimeActive-' + key, (time).toString());
    } else if (!active) {
      localStorage.setItem('browserTimeIdle-' + key, (time).toString());
    }
  };

  public storageTimesObject = (key: string, times: any, active: boolean = true) => {
    if (active) {
      localStorage.setItem('browserTimeActiveObject-' + key, JSON.stringify(times));
    } else if (!active) {
      localStorage.setItem('browserTimeIdleObject-' + key, JSON.stringify(times));
    }
  };

  public static initTimer(time: string | null) {
    return (time === null) ? [] : [{
      start: performance.now(),
      stop: (parseFloat(time))
    }];
  }

  public static getActiveTime = (key: string, cb?: Function) => {
    let activeTime = localStorage.getItem('browserTimeActive-' + key);
    if (cb) {
      return cb(activeTime);
    } else {
      return activeTime;
    }
  }

  public static getIdleTime = (key: string, cb?: Function) => {
    let idleTime = localStorage.getItem('browserTimeIdle-' + key);
    if (cb) {
      return cb(idleTime);
    } else {
      return idleTime;
    }
  }
}
