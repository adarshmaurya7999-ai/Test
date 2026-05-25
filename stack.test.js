const { describe, it } = require('node:test');
const assert = require('node:assert');
const Stack = require('./stack');

describe('Stack - push()', () => {
  it('should successfully push a single element and return the new size', () => {
    const stack = new Stack();
    const size = stack.push('first');
    
    assert.strictEqual(size, 1);
    assert.strictEqual(stack.size(), 1);
    assert.strictEqual(stack.peek(), 'first');
  });

  it('should successfully push multiple elements in order', () => {
    const stack = new Stack();
    stack.push('first');
    stack.push('second');
    const size = stack.push('third');

    assert.strictEqual(size, 3);
    assert.strictEqual(stack.size(), 3);
    assert.strictEqual(stack.peek(), 'third');
  });

  it('should maintain LIFO order when elements are pushed and then popped', () => {
    const stack = new Stack();
    stack.push(1);
    stack.push(2);
    
    assert.strictEqual(stack.pop(), 2);
    assert.strictEqual(stack.pop(), 1);
    assert.strictEqual(stack.isEmpty(), true);
  });

  it('should throw an error when pushing null or undefined', () => {
    const stack = new Stack();

    assert.throws(() => {
      stack.push(null);
    }, /Cannot push undefined or null values/);

    assert.throws(() => {
      stack.push(undefined);
    }, /Cannot push undefined or null values/);
  });
});
