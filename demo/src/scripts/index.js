import BrowserInteractionTime from '../../../dist/browser-interaction-time.umd';

document.addEventListener( 'DOMContentLoaded', () => {
  var localKey = 'demoTab';

  setInterval( () => {
    document.getElementById( 'activeTime' ).innerHTML = ( msToTime( BrowserInteractionTime.getActiveTime( localKey ) ) ).toString();
    document.getElementById( 'idleTime' ).innerHTML = ( msToTime( BrowserInteractionTime.getIdleTime( localKey ) ) ).toString();
  }, 1 );

  // @ts-ignore
  function msToTime( duration ) {
    // @ts-ignore
    var milliseconds = parseInt( ( duration % 1000 ) / 100 ),
      seconds = Math.floor( ( duration / 1000 ) % 60 ),
      minutes = Math.floor( ( duration / ( 1000 * 60 ) ) % 60 ),
      hours = Math.floor( ( duration / ( 1000 * 60 * 60 ) ) % 24 );

    // @ts-ignore
    hours = ( hours < 10 ) ? "0" + hours : hours;
    // @ts-ignore
    minutes = ( minutes < 10 ) ? "0" + minutes : minutes;
    // @ts-ignore
    seconds = ( seconds < 10 ) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds + "." + milliseconds;
  }


  var bit = new BrowserInteractionTime( {
    timeIntervalEllapsedCallbacks: [{
      timeInMilliseconds: 1000,
      callback: BrowserInteractionTime.storageTime( localKey ),
      multiplier: x => x
    }],
    timeIntervalRemoteCallback: [{
      timeInMilliseconds: 0,
      callbackData: { method: 'POST' },
      multiplier: x => x + 100,
      timeout: 5000
    }],
    absoluteTimeEllapsedCallbacks: [],
    browserTabInactiveCallbacks: [],
    browserTabActiveCallbacks: [],
    idleTimeoutMs: 3000,
    times: BrowserInteractionTime.getActiveTime( localKey, BrowserInteractionTime.initTimer ),
    timesIdle: BrowserInteractionTime.getIdleTime( localKey, BrowserInteractionTime.initTimer ),
    localKey: localKey,
    targetUrl: '/',
    sourceUrl: 'https://next.json-generator.com/api/json/get/V1t7zQISD',
    service: { data: { service: 'demo', id: 1 }, response: { active: 'activeTime', idle: 'idleTime' } },
    // service: { data: { service: 'demo', id: 1 }, response: { active: 'activeTime', idle: 'idleTime' }, customUrl: 'https://next.json-generator.com/api/json/get/V1t7zQISD' },
  } );

  bit.initTimers().then( () => bit.startTimer() );
} );
