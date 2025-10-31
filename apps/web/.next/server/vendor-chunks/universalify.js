"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/universalify";
exports.ids = ["vendor-chunks/universalify"];
exports.modules = {

/***/ "(rsc)/../../node_modules/universalify/index.js":
/*!************************************************!*\
  !*** ../../node_modules/universalify/index.js ***!
  \************************************************/
/***/ ((__unused_webpack_module, exports) => {

eval("\nexports.fromCallback = function(fn) {\n    return Object.defineProperty(function(...args) {\n        if (typeof args[args.length - 1] === \"function\") fn.apply(this, args);\n        else {\n            return new Promise((resolve, reject)=>{\n                args.push((err, res)=>err != null ? reject(err) : resolve(res));\n                fn.apply(this, args);\n            });\n        }\n    }, \"name\", {\n        value: fn.name\n    });\n};\nexports.fromPromise = function(fn) {\n    return Object.defineProperty(function(...args) {\n        const cb = args[args.length - 1];\n        if (typeof cb !== \"function\") return fn.apply(this, args);\n        else {\n            args.pop();\n            fn.apply(this, args).then((r)=>cb(null, r), cb);\n        }\n    }, \"name\", {\n        value: fn.name\n    });\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHJzYykvLi4vLi4vbm9kZV9tb2R1bGVzL3VuaXZlcnNhbGlmeS9pbmRleC5qcyIsIm1hcHBpbmdzIjoiQUFBQTtBQUVBQSxvQkFBb0IsR0FBRyxTQUFVRSxFQUFFO0lBQ2pDLE9BQU9DLE9BQU9DLGNBQWMsQ0FBQyxTQUFVLEdBQUdDLElBQUk7UUFDNUMsSUFBSSxPQUFPQSxJQUFJLENBQUNBLEtBQUtDLE1BQU0sR0FBRyxFQUFFLEtBQUssWUFBWUosR0FBR0ssS0FBSyxDQUFDLElBQUksRUFBRUY7YUFDM0Q7WUFDSCxPQUFPLElBQUlHLFFBQVEsQ0FBQ0MsU0FBU0M7Z0JBQzNCTCxLQUFLTSxJQUFJLENBQUMsQ0FBQ0MsS0FBS0MsTUFBUSxPQUFRLE9BQVFILE9BQU9FLE9BQU9ILFFBQVFJO2dCQUM5RFgsR0FBR0ssS0FBSyxDQUFDLElBQUksRUFBRUY7WUFDakI7UUFDRjtJQUNGLEdBQUcsUUFBUTtRQUFFUyxPQUFPWixHQUFHYSxJQUFJO0lBQUM7QUFDOUI7QUFFQWYsbUJBQW1CLEdBQUcsU0FBVUUsRUFBRTtJQUNoQyxPQUFPQyxPQUFPQyxjQUFjLENBQUMsU0FBVSxHQUFHQyxJQUFJO1FBQzVDLE1BQU1ZLEtBQUtaLElBQUksQ0FBQ0EsS0FBS0MsTUFBTSxHQUFHLEVBQUU7UUFDaEMsSUFBSSxPQUFPVyxPQUFPLFlBQVksT0FBT2YsR0FBR0ssS0FBSyxDQUFDLElBQUksRUFBRUY7YUFDL0M7WUFDSEEsS0FBS2EsR0FBRztZQUNSaEIsR0FBR0ssS0FBSyxDQUFDLElBQUksRUFBRUYsTUFBTWMsSUFBSSxDQUFDQyxDQUFBQSxJQUFLSCxHQUFHLE1BQU1HLElBQUlIO1FBQzlDO0lBQ0YsR0FBRyxRQUFRO1FBQUVILE9BQU9aLEdBQUdhLElBQUk7SUFBQztBQUM5QiIsInNvdXJjZXMiOlsid2VicGFjazovL2J1aWxkcnVubmVyLXdlYi8uLi8uLi9ub2RlX21vZHVsZXMvdW5pdmVyc2FsaWZ5L2luZGV4LmpzP2QyYjMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydHMuZnJvbUNhbGxiYWNrID0gZnVuY3Rpb24gKGZuKSB7XG4gIHJldHVybiBPYmplY3QuZGVmaW5lUHJvcGVydHkoZnVuY3Rpb24gKC4uLmFyZ3MpIHtcbiAgICBpZiAodHlwZW9mIGFyZ3NbYXJncy5sZW5ndGggLSAxXSA9PT0gJ2Z1bmN0aW9uJykgZm4uYXBwbHkodGhpcywgYXJncylcbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIGFyZ3MucHVzaCgoZXJyLCByZXMpID0+IChlcnIgIT0gbnVsbCkgPyByZWplY3QoZXJyKSA6IHJlc29sdmUocmVzKSlcbiAgICAgICAgZm4uYXBwbHkodGhpcywgYXJncylcbiAgICAgIH0pXG4gICAgfVxuICB9LCAnbmFtZScsIHsgdmFsdWU6IGZuLm5hbWUgfSlcbn1cblxuZXhwb3J0cy5mcm9tUHJvbWlzZSA9IGZ1bmN0aW9uIChmbikge1xuICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KGZ1bmN0aW9uICguLi5hcmdzKSB7XG4gICAgY29uc3QgY2IgPSBhcmdzW2FyZ3MubGVuZ3RoIC0gMV1cbiAgICBpZiAodHlwZW9mIGNiICE9PSAnZnVuY3Rpb24nKSByZXR1cm4gZm4uYXBwbHkodGhpcywgYXJncylcbiAgICBlbHNlIHtcbiAgICAgIGFyZ3MucG9wKClcbiAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3MpLnRoZW4ociA9PiBjYihudWxsLCByKSwgY2IpXG4gICAgfVxuICB9LCAnbmFtZScsIHsgdmFsdWU6IGZuLm5hbWUgfSlcbn1cbiJdLCJuYW1lcyI6WyJleHBvcnRzIiwiZnJvbUNhbGxiYWNrIiwiZm4iLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImFyZ3MiLCJsZW5ndGgiLCJhcHBseSIsIlByb21pc2UiLCJyZXNvbHZlIiwicmVqZWN0IiwicHVzaCIsImVyciIsInJlcyIsInZhbHVlIiwibmFtZSIsImZyb21Qcm9taXNlIiwiY2IiLCJwb3AiLCJ0aGVuIiwiciJdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(rsc)/../../node_modules/universalify/index.js\n");

/***/ })

};
;