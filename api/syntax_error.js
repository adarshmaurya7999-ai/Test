// This file intentionally contains syntax errors to test parsing/compilation failures.

const syntaxErrorDemo = {
  message: "This file has syntax errors"
  // Missing comma here will trigger SyntaxError
  details: "It will fail during compilation"
};

// Missing closing parentheses in function parameters
function brokenFunction( {
  return "Oops";
}

module.exports = {
  syntaxErrorDemo,
  brokenFunction
};
