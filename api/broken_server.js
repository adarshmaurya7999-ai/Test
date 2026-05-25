const http = require('http');
const url = require('url');
const logicError = require('./logic_error');
const runtimeError = require('./runtime_error');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // CORS Headers to allow direct requests from any frontend web app
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight options requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // JSON Response Helper
  const sendJSON = (statusCode, payload) => {
    res.writeHead(statusCode, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(payload));
  };

  // Plain Text Response Helper
  const sendText = (statusCode, text) => {
    res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
    res.end(text);
  };

  try {
    // Router
    if (path === '/' && req.method === 'GET') {
      // Home: List of all broken endpoints
      return sendJSON(200, {
        name: "Broken API Suite for Web Application Testing",
        endpoints: {
          "/api/syntax": "GET - Attempts to dynamically load a file with syntax errors. Returns 500 containing the parse error.",
          "/api/logic/off-by-one": "GET - Returns an array slice with an off-by-one error (contains trailing undefined element).",
          "/api/logic/permission": "POST - Demonstrates a logic bug where checkPermissionAndModify always converts user role to admin.",
          "/api/logic/divide-by-zero": "GET - Divides by zero, returning a mathematically invalid result (Infinity/NaN).",
          "/api/logic/hang": "GET - Enters an infinite loop blocking Node event loop for 10 seconds.",
          "/api/runtime/type-error": "GET - Triggers a TypeError (reading property of undefined) causing a crash/500.",
          "/api/runtime/unhandled-rejection": "GET - Rejects a promise without a catch block.",
          "/api/runtime/leak": "GET - Appends a large chunk of dummy data to a global store, causing memory bloat.",
          "/api/status-bug": "DELETE - Deletes a resource but returns 500 status code despite success, or vice-versa."
        }
      });
    }

    if (path === '/api/syntax' && req.method === 'GET') {
      // Dynamically load syntax_error.js inside try/catch so server does not die permanently
      try {
        require('./syntax_error');
      } catch (err) {
        return sendJSON(500, {
          error: "SyntaxError simulation",
          message: err.message,
          stack: err.stack
        });
      }
      return sendJSON(200, { message: "Loaded successfully (should not happen)" });
    }

    if (path === '/api/logic/off-by-one' && req.method === 'GET') {
      const items = ['apple', 'banana', 'cherry'];
      const sliceResult = logicError.getSliceWithOffByOne(items);
      return sendJSON(200, {
        original: items,
        slicedWithOffByOne: sliceResult
      });
    }

    if (path === '/api/logic/permission' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const user = JSON.parse(body || '{}');
          const result = logicError.checkPermissionAndModify(user);
          return sendJSON(200, result);
        } catch (e) {
          return sendJSON(400, { error: "Invalid JSON format" });
        }
      });
      return;
    }

    if (path === '/api/logic/divide-by-zero' && req.method === 'GET') {
      const amount = 100;
      const count = 0;
      const rate = logicError.calculateAverageRate(amount, count);
      return sendJSON(200, {
        totalAmount: amount,
        count: count,
        calculatedRate: rate // This will be Infinity
      });
    }

    if (path === '/api/logic/hang' && req.method === 'GET') {
      logicError.blockCpuForever();
      return sendJSON(200, { message: "Finished blocking CPU. The response was delayed." });
    }

    if (path === '/api/runtime/type-error' && req.method === 'GET') {
      const val = runtimeError.triggerTypeError();
      return sendJSON(200, { result: val });
    }

    if (path === '/api/runtime/unhandled-rejection' && req.method === 'GET') {
      runtimeError.triggerUnhandledRejection();
      return sendJSON(202, { message: "Unhandled promise rejection triggered in background." });
    }

    if (path === '/api/runtime/leak' && req.method === 'GET') {
      const leakInfo = runtimeError.leakMemory();
      return sendJSON(200, leakInfo);
    }

    if (path === '/api/status-bug' && req.method === 'DELETE') {
      // Logic runs fine, but API returns 500 error status code instead of 200/204
      return sendJSON(500, {
        status: "success",
        message: "Resource deleted successfully, but server returned 500 Internal Server Error status code by mistake!"
      });
    }

    // Default 404 Route
    return sendJSON(404, { error: "Not Found" });

  } catch (err) {
    // Catch-all for runtime errors triggered by controllers (e.g. triggerTypeError)
    return sendJSON(500, {
      error: "Internal Server Error",
      name: err.name,
      message: err.message,
      stack: err.stack
    });
  }
});

// Capture process events to print when they occur, useful for testing unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('\n⚠️ [PROCESS EVENT: unhandledRejection] Caught in server process:');
  console.error(reason);
});

server.listen(PORT, () => {
  console.log(`🚀 Broken API Server running at http://localhost:${PORT}`);
  console.log(`Press Ctrl+C to stop.\n`);
});
