/**
 * Intentional runtime exceptions and bad behavior for testing error boundaries and monitoring.
 */

// Global memory leak cache
const globalMemoryLeakStore = [];

/**
 * 1. TypeError: Access property of undefined
 * Throws a synchronous TypeError.
 */
function triggerTypeError() {
  const data = {};
  // Accessing property on undefined throws a TypeError
  return data.nonExistentObject.someProperty;
}

/**
 * 2. Unhandled Promise Rejection
 * Rejects a promise without a catch handler, which will trigger the process 'unhandledRejection' event.
 */
function triggerUnhandledRejection() {
  new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error("This is an intentional unhandled rejection from the API!"));
    }, 50);
  });
}

/**
 * 3. Memory Leak
 * Pushes a large array into global scope on each execution, eating memory.
 */
function leakMemory() {
  const chunk = new Array(100000).fill("LEAK_DATA");
  globalMemoryLeakStore.push(chunk);
  return {
    leakStoreSize: globalMemoryLeakStore.length,
    estimatedLeakedElements: globalMemoryLeakStore.length * 100000
  };
}

module.exports = {
  triggerTypeError,
  triggerUnhandledRejection,
  leakMemory
};
