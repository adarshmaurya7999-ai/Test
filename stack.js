/**
 * A simple Stack implementation.
 */
class Stack {
  constructor() {
    this.items = [];
  }

  /**
   * Pushes an element onto the stack.
   * @param {*} element - The element to push.
   * @returns {number} The new size of the stack.
   */
  push(element) {
    if (element === undefined || element === null) {
      throw new Error("Cannot push undefined or null values to the stack.");
    }
    this.items.push(element);
    return this.size();
  }

  /**
   * Removes and returns the top element of the stack.
   * @returns {*} The popped element.
   */
  pop() {
    if (this.isEmpty()) {
      throw new Error("Stack underflow: Cannot pop from an empty stack.");
    }
    return this.items.pop();
  }

  /**
   * Returns the top element without removing it.
   * @returns {*} The top element.
   */
  peek() {
    if (this.isEmpty()) {
      return null;
    }
    return this.items[this.items.length - 1];
  }

  /**
   * Checks if the stack is empty.
   * @returns {boolean} True if empty, false otherwise.
   */
  isEmpty() {
    return this.items.length === 0;
  }

  /**
   * Returns the size of the stack.
   * @returns {number} The number of elements in the stack.
   */
  size() {
    return this.items.length;
  }

  /**
   * Clears the stack.
   */
  clear() {
    this.items = [];
  }
}

module.exports = Stack;
