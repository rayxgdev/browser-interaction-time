interface BaseTimeEllapsedCallbackData {
  callback: (timeInMs: number, active: boolean) => void
  timeInMilliseconds: number
}

type BasicCallback = (timeInMs: number, active: boolean) => void

export interface TimeIntervalEllapsedCallbackData
  extends BaseTimeEllapsedCallbackData {
  multiplier: (time: number) => number
}

export interface AbsoluteTimeEllapsedCallbackData
  extends BaseTimeEllapsedCallbackData {
  pending: boolean
}

interface Settings {
  timeIntervalEllapsedCallbacks?: TimeIntervalEllapsedCallbackData[]
  absoluteTimeEllapsedCallbacks?: AbsoluteTimeEllapsedCallbackData[]
  browserTabInactiveCallbacks?: BasicCallback[]
  browserTabActiveCallbacks?: BasicCallback[]
  idleTimeoutMs?: number
  checkCallbacksIntervalMs?: number,
  times?: [],
  timesIdle?: [],
  localKey?: string,
  sourceUrl?: string,
  targetUrl?: string
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
  private checkCallbacksIntervalMs: number;
  private browserTabActiveCallbacks: BasicCallback[];
  private browserTabInactiveCallbacks: BasicCallback[];
  private timeIntervalEllapsedCallbacks: TimeIntervalEllapsedCallbackData[];
  private absoluteTimeEllapsedCallbacks: AbsoluteTimeEllapsedCallbackData[];
  private marks: Marks;
  private measures: Measures;
  private localKey: string;
  private guidKey: string;
  private guid: string;
  private sourceUrl: string | boolean;
  private targetUrl: string | boolean;

  constructor({
    timeIntervalEllapsedCallbacks,
    absoluteTimeEllapsedCallbacks,
    checkCallbacksIntervalMs,
    browserTabInactiveCallbacks,
    browserTabActiveCallbacks,
    times,
    timesIdle,
    localKey,
    idleTimeoutMs,
    sourceUrl,
    targetUrl
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

  private generateGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      /*eslint-disable*/
      let r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
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
    if (this.getCurrentGuid() == this.guid) {
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

      if (this.currentIdleTimeMs >= this.idleTimeoutMs && this.isRunning()) {
        this.idle = true;
        this.stopTimer();
      } else {
        this.currentIdleTimeMs += this.checkCallbacksIntervalMs;
      }
    }
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
        e.preventDefault();
        console.log(this.guid + ' <-- ADIOS')
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
    if (!this.isRunning() && this.guid == this.getCurrentGuid()) {
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

  public static initTimer(time: string) {
    return time == null ? [] : [{
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
