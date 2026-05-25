/**
 * Intentional logic bugs for testing application behaviors.
 */

// 1. Off-by-one bug: Returns elements beyond array length (returns undefined in the array list)
function getSliceWithOffByOne(items) {
  const result = [];
  // Should be i < items.length, but we do i <= items.length
  for (let i = 0; i <= items.length; i++) {
    result.push(items[i]);
  }
  return result;
}

// 2. Assignment instead of comparison bug: Always makes the user an admin
function checkPermissionAndModify(user) {
  // Intentional bug: using = instead of ===
  if (user.role = 'admin') {
    return { authorized: true, user };
  }
  return { authorized: false, user };
}

// 3. Division by zero resulting in Infinity/NaN
function calculateAverageRate(totalAmount, count) {
  // If count is 0, this returns Infinity or NaN instead of throwing/handling it
  return totalAmount / count;
}

// 4. Infinite loop to trigger timeouts (with a safety escape after 10 seconds to avoid locking the environment)
function blockCpuForever() {
  const start = Date.now();
  console.log("Entering infinite loop. CPU will be blocked!");
  while (true) {
    // Blocks the Node.js event loop
    if (Date.now() - start > 10000) {
      console.log("Emergency exit from infinite loop to prevent complete process freeze.");
      break;
    }
  }
}

module.exports = {
  getSliceWithOffByOne,
  checkPermissionAndModify,
  calculateAverageRate,
  blockCpuForever
};
