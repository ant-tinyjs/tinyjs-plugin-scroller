var global = typeof window === 'undefined' ? this : window;
var time = Date.now ||
  function() {
    return +new Date();
  };
var desiredFrames = 60;
var millisecondsPerSecond = 1000;
var running = {};
var counter = 1;

/**
 * A requestAnimationFrame wrapper / polyfill.
 *
 * @param {function} callback - The callback to be invoked before the next repaint.
 * @param {HTMLElement} root - The root element for the repaint
 */
exports.requestAnimationFrame = (function() {
  // Check for request animation Frame support
  var requestFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame;
  var isNative = !!requestFrame;

  if (requestFrame && !/requestAnimationFrame\(\)\s*\{\s*\[native code\]\s*\}/i.test(requestFrame.toString())) { // eslint-disable-line
    isNative = false;
  }

  if (isNative) {
    return function(callback, root) {
      requestFrame(callback, root);
    };
  }

  var TARGET_FPS = 60;
  var requests = {};
  var requestCount = 0; //eslint-disable-line
  var rafHandle = 1;
  var intervalHandle = null;
  var lastActive = +new Date();

  return function(callback, root) {
    var callbackHandle = rafHandle++;

    // Store callback
    requests[callbackHandle] = callback;
    requestCount++;

    // Create timeout at first request
    if (intervalHandle === null) {
      intervalHandle = setInterval(function() {
        var time = +new Date();
        var currentRequests = requests;

        // Reset data structure before executing callbacks
        requests = {};
        requestCount = 0;

        for (var key in currentRequests) {
          if (currentRequests.hasOwnProperty(key)) {
            currentRequests[key](time);
            lastActive = time;
          }
        }

        // Disable the timeout when nothing happens for a certain
        // period of time
        if (time - lastActive > 2500) {
          clearInterval(intervalHandle);
          intervalHandle = null;
        }
      }, 1000 / TARGET_FPS);
    }

    return callbackHandle;
  };
})();

/**
 * Stops the given animation.
 *
 * @param {number} id - Unique animation ID
 * @return {boolean} Whether the animation was stopped (aka, was running before)
 */
exports.stop = function(id) {
  var cleared = (running[id] !== null);
  if (cleared) {
    running[id] = null;
  }

  return cleared;
};

/**
 * Whether the given animation is still running.
 *
 * @param {number} id - Unique animation ID
 * @return {boolean} Whether the animation is still running
 */
exports.isRunning = function(id) {
  return running[id] !== null;
};

/**
 * Start the animation.
 *
 * @param {function} stepCallback - Pointer to function which is executed on every step. Signature of the method should be `function(percent, now, virtual) { return continueWithAnimation; }`
 * @param {function} verifyCallback - Executed before every animation step. Signature of the method should be `function() { return continueWithAnimation; }`
 * @param {function} completedCallback - Signature of the method should be `function(droppedFrames, finishedAnimation, optional wasFinished) {}`
 * @param {number} duration - Milliseconds to run the animation
 * @param {function} easingMethod - Pointer to easing function Signature of the method should be `function(percent) { return modifiedValue; }`
 * @param {Element} root - Render root. Used for internal usage of requestAnimationFrame.
 * @return {number} Identifier of animation. Can be used to stop it any time.
 */
exports.start = function(stepCallback, verifyCallback, completedCallback, duration, easingMethod, root) {
  var start = time();
  var lastFrame = start;
  var percent = 0;
  var dropCounter = 0;
  var id = counter++;

  // Compacting running db automatically every few new animations
  if (id % 20 === 0) {
    var newRunning = {};
    for (var usedId in running) {
      newRunning[usedId] = true;
    }
    running = newRunning;
  }

  // This is the internal step method which is called every few milliseconds
  var step = function(virtual) {
    // Normalize virtual value
    var render = virtual !== true;

    // Get current time
    var now = time();

    // Verification is executed before next animation step
    if (!running[id] || (verifyCallback && !verifyCallback(id))) {
      running[id] = null;
      completedCallback(desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)), id, false);
      return;
    }

    // For the current rendering to apply let's update omitted steps in memory.
    // This is important to bring internal state variables up-to-date with progress in time.
    if (render) {
      var droppedFrames = Math.round((now - lastFrame) / (millisecondsPerSecond / desiredFrames)) - 1;
      for (var j = 0; j < Math.min(droppedFrames, 4); j++) {
        step(true);
        dropCounter++;
      }
    }

    // Compute percent value
    if (duration) {
      percent = (now - start) / duration;
      if (percent > 1) {
        percent = 1;
      }
    }

    // Execute step callback, then...
    var value = easingMethod ? easingMethod(percent) : percent;
    if ((stepCallback(value, now, render) === false || percent === 1) && render) {
      running[id] = null;
      completedCallback(desiredFrames - (dropCounter / ((now - start) / millisecondsPerSecond)), id, percent === 1 || duration === undefined);
    } else if (render) {
      lastFrame = now;
      exports.requestAnimationFrame(step, root);
    }
  };

  // Mark as running
  running[id] = true;

  // Init first step
  exports.requestAnimationFrame(step, root);

  // Return unique animation ID
  return id;
};
