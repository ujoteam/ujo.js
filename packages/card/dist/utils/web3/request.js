"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = requestJson;
exports.postJson = postJson;
exports.request = request;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _objectSpread2 = _interopRequireDefault(require("@babel/runtime/helpers/objectSpread"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

function requestJson(_x, _x2) {
  return _requestJson.apply(this, arguments);
}

function _requestJson() {
  _requestJson = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(url, options) {
    var res;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return request(url, (0, _objectSpread2.default)({}, options, {
              method: options && options.method || 'GET',
              credentials: 'include',
              mode: 'cors'
            }));

          case 2:
            res = _context.sent;
            return _context.abrupt("return", res.json());

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));
  return _requestJson.apply(this, arguments);
}

function postJson(url, body, options) {
  var opts = (0, _objectSpread2.default)({}, options, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (body) {
    opts.body = JSON.stringify(body);
  }

  return requestJson(url, opts);
}

function request(_x3, _x4) {
  return _request.apply(this, arguments);
}

function _request() {
  _request = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee2(url, options) {
    var res;
    return _regenerator.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return fetch(url, options);

          case 2:
            res = _context2.sent;

            if (!(res.status < 200 || res.status > 299)) {
              _context2.next = 5;
              break;
            }

            throw new Error("Failed to fetch URL: ".concat(url, ". Got status: ").concat(res.status));

          case 5:
            return _context2.abrupt("return", res);

          case 6:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _request.apply(this, arguments);
}
//# sourceMappingURL=request.js.map