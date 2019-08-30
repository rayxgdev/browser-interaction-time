import BrowserInteractionTime from '../../../dist/browser-interaction-time.umd';

document.addEventListener( 'DOMContentLoaded', () => {
  var localKey = 'demoTab';

  setInterval( () => {
    document.getElementById( 'activeTime' ).innerHTML = ( parseFloat( BrowserInteractionTime.getActiveTime( localKey ) ) * 0.001 ).toString();
    document.getElementById( 'idleTime' ).innerHTML = ( parseFloat( BrowserInteractionTime.getIdleTime( localKey ) ) * 0.001 ).toString();
  }, 1 );


  var bit = new BrowserInteractionTime( {
    timeIntervalEllapsedCallbacks: [{
      timeInMilliseconds: 1000,
      callback: BrowserInteractionTime.storageTime( localKey ),
      multiplier: x => x
    }],
    absoluteTimeEllapsedCallbacks: [],
    browserTabInactiveCallbacks: [/*BrowserInteractionTime.toggleActive( localKey, false )*/],
    browserTabActiveCallbacks: [/*BrowserInteractionTime.toggleActive( localKey, true )*/],
    pauseOnMouseMovement: false,
    pauseOnScroll: false,
    idleTimeoutMs: 3000,
    times: BrowserInteractionTime.getActiveTime( localKey, BrowserInteractionTime.initTimer ),
    timesIdle: BrowserInteractionTime.getIdleTime( localKey, BrowserInteractionTime.initTimer ),
    localKey: localKey
  } );

  bit.startTimer();
} );
