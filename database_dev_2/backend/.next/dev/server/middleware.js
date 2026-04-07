"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
(() => {
var exports = {};
exports.id = "proxy";
exports.ids = ["proxy"];
exports.modules = {

/***/ "(middleware)/./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=C%3A%5CUsers%5Csreer%5COneDrive%5CDesktop%5CDatabaseDev2FinalProject%5Cdatabase_dev_2%5Cbackend%5Csrc%5Cproxy.js&page=%2Fproxy&rootDir=C%3A%5CUsers%5Csreer%5COneDrive%5CDesktop%5CDatabaseDev2FinalProject%5Cdatabase_dev_2%5Cbackend&matchers=&preferredRegion=&middlewareConfig=e30%3D!":
/*!********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************!*\
  !*** ./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=C%3A%5CUsers%5Csreer%5COneDrive%5CDesktop%5CDatabaseDev2FinalProject%5Cdatabase_dev_2%5Cbackend%5Csrc%5Cproxy.js&page=%2Fproxy&rootDir=C%3A%5CUsers%5Csreer%5COneDrive%5CDesktop%5CDatabaseDev2FinalProject%5Cdatabase_dev_2%5Cbackend&matchers=&preferredRegion=&middlewareConfig=e30%3D! ***!
  \********************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (__WEBPACK_DEFAULT_EXPORT__),\n/* harmony export */   handler: () => (/* binding */ handler)\n/* harmony export */ });\n/* harmony import */ var next_dist_build_adapter_setup_node_env_external__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/dist/build/adapter/setup-node-env.external */ \"next/dist/build/adapter/setup-node-env.external\");\n/* harmony import */ var next_dist_build_adapter_setup_node_env_external__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(next_dist_build_adapter_setup_node_env_external__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! next/dist/server/web/globals */ \"(middleware)/./node_modules/next/dist/server/web/globals.js\");\n/* harmony import */ var next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! next/dist/server/web/adapter */ \"(middleware)/./node_modules/next/dist/server/web/adapter.js\");\n/* harmony import */ var next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_2__);\n/* harmony import */ var next_dist_server_lib_incremental_cache__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! next/dist/server/lib/incremental-cache */ \"(middleware)/./node_modules/next/dist/server/lib/incremental-cache/index.js\");\n/* harmony import */ var next_dist_server_lib_incremental_cache__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_lib_incremental_cache__WEBPACK_IMPORTED_MODULE_3__);\n/* harmony import */ var _src_proxy_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./src/proxy.js */ \"(middleware)/./src/proxy.js\");\n/* harmony import */ var next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! next/dist/client/components/is-next-router-error */ \"(middleware)/./node_modules/next/dist/client/components/is-next-router-error.js\");\n/* harmony import */ var next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_5__);\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! next/dist/server/web/utils */ \"(middleware)/./node_modules/next/dist/server/web/utils.js\");\n/* harmony import */ var next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_6__);\n\n\n\n\nconst incrementalCacheHandler = null\n// Import the userland code.\n;\n\n\n\nconst mod = {\n    ..._src_proxy_js__WEBPACK_IMPORTED_MODULE_4__\n};\nconst page = \"/proxy\";\nconst isProxy = page === '/proxy' || page === '/src/proxy';\nconst handlerUserland = (isProxy ? mod.proxy : mod.middleware) || mod.default;\nclass ProxyMissingExportError extends Error {\n    constructor(message){\n        super(message);\n        // Stack isn't useful here, remove it considering it spams logs during development.\n        this.stack = '';\n    }\n}\n// TODO: This spams logs during development. Find a better way to handle this.\n// Removing this will spam \"fn is not a function\" logs which is worse.\nif (typeof handlerUserland !== 'function') {\n    throw new ProxyMissingExportError(`The ${isProxy ? 'Proxy' : 'Middleware'} file \"${page}\" must export a function named \\`${isProxy ? 'proxy' : 'middleware'}\\` or a default function.`);\n}\n// Proxy will only sent out the FetchEvent to next server,\n// so load instrumentation module here and track the error inside proxy module.\nfunction errorHandledHandler(fn) {\n    return async (...args)=>{\n        try {\n            return await fn(...args);\n        } catch (err) {\n            // In development, error the navigation API usage in runtime,\n            // since it's not allowed to be used in proxy as it's outside of react component tree.\n            if (true) {\n                if ((0,next_dist_client_components_is_next_router_error__WEBPACK_IMPORTED_MODULE_5__.isNextRouterError)(err)) {\n                    err.message = `Next.js navigation API is not allowed to be used in ${isProxy ? 'Proxy' : 'Middleware'}.`;\n                    throw err;\n                }\n            }\n            const req = args[0];\n            const url = new URL(req.url);\n            const resource = url.pathname + url.search;\n            await (0,next_dist_server_web_globals__WEBPACK_IMPORTED_MODULE_1__.edgeInstrumentationOnRequestError)(err, {\n                path: resource,\n                method: req.method,\n                headers: Object.fromEntries(req.headers.entries())\n            }, {\n                routerKind: 'Pages Router',\n                routePath: '/proxy',\n                routeType: 'proxy',\n                revalidateReason: undefined\n            });\n            throw err;\n        }\n    };\n}\nconst internalHandler = (opts)=>{\n    return (0,next_dist_server_web_adapter__WEBPACK_IMPORTED_MODULE_2__.adapter)({\n        ...opts,\n        IncrementalCache: next_dist_server_lib_incremental_cache__WEBPACK_IMPORTED_MODULE_3__.IncrementalCache,\n        incrementalCacheHandler,\n        page,\n        handler: errorHandledHandler(handlerUserland)\n    });\n};\nasync function handler(request, ctx) {\n    const result = await internalHandler({\n        request: {\n            url: request.url,\n            method: request.method,\n            headers: (0,next_dist_server_web_utils__WEBPACK_IMPORTED_MODULE_6__.toNodeOutgoingHttpHeaders)(request.headers),\n            nextConfig: {\n                basePath: \"\",\n                i18n: \"\",\n                trailingSlash: Boolean(false),\n                experimental: {\n                    cacheLife: {\"default\":{\"stale\":300,\"revalidate\":900,\"expire\":4294967294},\"seconds\":{\"stale\":30,\"revalidate\":1,\"expire\":60},\"minutes\":{\"stale\":300,\"revalidate\":60,\"expire\":3600},\"hours\":{\"stale\":300,\"revalidate\":3600,\"expire\":86400},\"days\":{\"stale\":300,\"revalidate\":86400,\"expire\":604800},\"weeks\":{\"stale\":300,\"revalidate\":604800,\"expire\":2592000},\"max\":{\"stale\":300,\"revalidate\":2592000,\"expire\":31536000}},\n                    authInterrupts: Boolean(false),\n                    clientParamParsingOrigins: []\n                }\n            },\n            page: {\n                name: page\n            },\n            body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body ?? undefined : undefined,\n            waitUntil: ctx.waitUntil,\n            requestMeta: ctx.requestMeta,\n            signal: ctx.signal || new AbortController().signal\n        }\n    });\n    ctx.waitUntil == null ? void 0 : ctx.waitUntil.call(ctx, result.waitUntil);\n    return result.response;\n}\n// backwards compat\n/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (internalHandler);\n\n//# sourceMappingURL=middleware.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vbm9kZV9tb2R1bGVzL25leHQvZGlzdC9idWlsZC93ZWJwYWNrL2xvYWRlcnMvbmV4dC1taWRkbGV3YXJlLWxvYWRlci5qcz9hYnNvbHV0ZVBhZ2VQYXRoPUMlM0ElNUNVc2VycyU1Q3NyZWVyJTVDT25lRHJpdmUlNUNEZXNrdG9wJTVDRGF0YWJhc2VEZXYyRmluYWxQcm9qZWN0JTVDZGF0YWJhc2VfZGV2XzIlNUNiYWNrZW5kJTVDc3JjJTVDcHJveHkuanMmcGFnZT0lMkZwcm94eSZyb290RGlyPUMlM0ElNUNVc2VycyU1Q3NyZWVyJTVDT25lRHJpdmUlNUNEZXNrdG9wJTVDRGF0YWJhc2VEZXYyRmluYWxQcm9qZWN0JTVDZGF0YWJhc2VfZGV2XzIlNUNiYWNrZW5kJm1hdGNoZXJzPSZwcmVmZXJyZWRSZWdpb249Jm1pZGRsZXdhcmVDb25maWc9ZTMwJTNEISIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBeUQ7QUFDbkI7QUFDaUI7QUFDbUI7QUFDMUU7QUFDQTtBQUNBLENBQXVDO0FBQzBDO0FBQ0k7QUFDZDtBQUN2RTtBQUNBLE9BQU8sMENBQUk7QUFDWDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNkNBQTZDLGtDQUFrQyxRQUFRLEtBQUssbUNBQW1DLGlDQUFpQztBQUNoSztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsZ0JBQWdCLElBQXFDO0FBQ3JELG9CQUFvQixtR0FBaUI7QUFDckMseUZBQXlGLGlDQUFpQztBQUMxSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0IsK0ZBQWlDO0FBQ25EO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVyxxRUFBTztBQUNsQjtBQUNBLHdCQUF3QjtBQUN4QjtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCLHFGQUF5QjtBQUM5QztBQUNBLDBCQUEwQixFQUE0QjtBQUN0RCxzQkFBc0IsRUFBOEI7QUFDcEQsdUNBQXVDLEtBQWlDO0FBQ3hFO0FBQ0EsK0JBQStCLDJZQUE2QjtBQUM1RCw0Q0FBNEMsS0FBK0M7QUFDM0YsK0NBQStDLEVBQStDO0FBQzlGO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlFQUFlLGVBQWUsRUFBQzs7QUFFL0IiLCJzb3VyY2VzIjpbIiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgXCJuZXh0L2Rpc3QvYnVpbGQvYWRhcHRlci9zZXR1cC1ub2RlLWVudi5leHRlcm5hbFwiO1xuaW1wb3J0IFwibmV4dC9kaXN0L3NlcnZlci93ZWIvZ2xvYmFsc1wiO1xuaW1wb3J0IHsgYWRhcHRlciB9IGZyb20gXCJuZXh0L2Rpc3Qvc2VydmVyL3dlYi9hZGFwdGVyXCI7XG5pbXBvcnQgeyBJbmNyZW1lbnRhbENhY2hlIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvbGliL2luY3JlbWVudGFsLWNhY2hlXCI7XG5jb25zdCBpbmNyZW1lbnRhbENhY2hlSGFuZGxlciA9IG51bGxcbi8vIEltcG9ydCB0aGUgdXNlcmxhbmQgY29kZS5cbmltcG9ydCAqIGFzIF9tb2QgZnJvbSBcIi4vc3JjL3Byb3h5LmpzXCI7XG5pbXBvcnQgeyBlZGdlSW5zdHJ1bWVudGF0aW9uT25SZXF1ZXN0RXJyb3IgfSBmcm9tIFwibmV4dC9kaXN0L3NlcnZlci93ZWIvZ2xvYmFsc1wiO1xuaW1wb3J0IHsgaXNOZXh0Um91dGVyRXJyb3IgfSBmcm9tIFwibmV4dC9kaXN0L2NsaWVudC9jb21wb25lbnRzL2lzLW5leHQtcm91dGVyLWVycm9yXCI7XG5pbXBvcnQgeyB0b05vZGVPdXRnb2luZ0h0dHBIZWFkZXJzIH0gZnJvbSBcIm5leHQvZGlzdC9zZXJ2ZXIvd2ViL3V0aWxzXCI7XG5jb25zdCBtb2QgPSB7XG4gICAgLi4uX21vZFxufTtcbmNvbnN0IHBhZ2UgPSBcIi9wcm94eVwiO1xuY29uc3QgaXNQcm94eSA9IHBhZ2UgPT09ICcvcHJveHknIHx8IHBhZ2UgPT09ICcvc3JjL3Byb3h5JztcbmNvbnN0IGhhbmRsZXJVc2VybGFuZCA9IChpc1Byb3h5ID8gbW9kLnByb3h5IDogbW9kLm1pZGRsZXdhcmUpIHx8IG1vZC5kZWZhdWx0O1xuY2xhc3MgUHJveHlNaXNzaW5nRXhwb3J0RXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gICAgY29uc3RydWN0b3IobWVzc2FnZSl7XG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xuICAgICAgICAvLyBTdGFjayBpc24ndCB1c2VmdWwgaGVyZSwgcmVtb3ZlIGl0IGNvbnNpZGVyaW5nIGl0IHNwYW1zIGxvZ3MgZHVyaW5nIGRldmVsb3BtZW50LlxuICAgICAgICB0aGlzLnN0YWNrID0gJyc7XG4gICAgfVxufVxuLy8gVE9ETzogVGhpcyBzcGFtcyBsb2dzIGR1cmluZyBkZXZlbG9wbWVudC4gRmluZCBhIGJldHRlciB3YXkgdG8gaGFuZGxlIHRoaXMuXG4vLyBSZW1vdmluZyB0aGlzIHdpbGwgc3BhbSBcImZuIGlzIG5vdCBhIGZ1bmN0aW9uXCIgbG9ncyB3aGljaCBpcyB3b3JzZS5cbmlmICh0eXBlb2YgaGFuZGxlclVzZXJsYW5kICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgdGhyb3cgbmV3IFByb3h5TWlzc2luZ0V4cG9ydEVycm9yKGBUaGUgJHtpc1Byb3h5ID8gJ1Byb3h5JyA6ICdNaWRkbGV3YXJlJ30gZmlsZSBcIiR7cGFnZX1cIiBtdXN0IGV4cG9ydCBhIGZ1bmN0aW9uIG5hbWVkIFxcYCR7aXNQcm94eSA/ICdwcm94eScgOiAnbWlkZGxld2FyZSd9XFxgIG9yIGEgZGVmYXVsdCBmdW5jdGlvbi5gKTtcbn1cbi8vIFByb3h5IHdpbGwgb25seSBzZW50IG91dCB0aGUgRmV0Y2hFdmVudCB0byBuZXh0IHNlcnZlcixcbi8vIHNvIGxvYWQgaW5zdHJ1bWVudGF0aW9uIG1vZHVsZSBoZXJlIGFuZCB0cmFjayB0aGUgZXJyb3IgaW5zaWRlIHByb3h5IG1vZHVsZS5cbmZ1bmN0aW9uIGVycm9ySGFuZGxlZEhhbmRsZXIoZm4pIHtcbiAgICByZXR1cm4gYXN5bmMgKC4uLmFyZ3MpPT57XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gYXdhaXQgZm4oLi4uYXJncyk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgLy8gSW4gZGV2ZWxvcG1lbnQsIGVycm9yIHRoZSBuYXZpZ2F0aW9uIEFQSSB1c2FnZSBpbiBydW50aW1lLFxuICAgICAgICAgICAgLy8gc2luY2UgaXQncyBub3QgYWxsb3dlZCB0byBiZSB1c2VkIGluIHByb3h5IGFzIGl0J3Mgb3V0c2lkZSBvZiByZWFjdCBjb21wb25lbnQgdHJlZS5cbiAgICAgICAgICAgIGlmIChwcm9jZXNzLmVudi5OT0RFX0VOViAhPT0gJ3Byb2R1Y3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgaWYgKGlzTmV4dFJvdXRlckVycm9yKGVycikpIHtcbiAgICAgICAgICAgICAgICAgICAgZXJyLm1lc3NhZ2UgPSBgTmV4dC5qcyBuYXZpZ2F0aW9uIEFQSSBpcyBub3QgYWxsb3dlZCB0byBiZSB1c2VkIGluICR7aXNQcm94eSA/ICdQcm94eScgOiAnTWlkZGxld2FyZSd9LmA7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZXEgPSBhcmdzWzBdO1xuICAgICAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsKTtcbiAgICAgICAgICAgIGNvbnN0IHJlc291cmNlID0gdXJsLnBhdGhuYW1lICsgdXJsLnNlYXJjaDtcbiAgICAgICAgICAgIGF3YWl0IGVkZ2VJbnN0cnVtZW50YXRpb25PblJlcXVlc3RFcnJvcihlcnIsIHtcbiAgICAgICAgICAgICAgICBwYXRoOiByZXNvdXJjZSxcbiAgICAgICAgICAgICAgICBtZXRob2Q6IHJlcS5tZXRob2QsXG4gICAgICAgICAgICAgICAgaGVhZGVyczogT2JqZWN0LmZyb21FbnRyaWVzKHJlcS5oZWFkZXJzLmVudHJpZXMoKSlcbiAgICAgICAgICAgIH0sIHtcbiAgICAgICAgICAgICAgICByb3V0ZXJLaW5kOiAnUGFnZXMgUm91dGVyJyxcbiAgICAgICAgICAgICAgICByb3V0ZVBhdGg6ICcvcHJveHknLFxuICAgICAgICAgICAgICAgIHJvdXRlVHlwZTogJ3Byb3h5JyxcbiAgICAgICAgICAgICAgICByZXZhbGlkYXRlUmVhc29uOiB1bmRlZmluZWRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG4gICAgfTtcbn1cbmNvbnN0IGludGVybmFsSGFuZGxlciA9IChvcHRzKT0+e1xuICAgIHJldHVybiBhZGFwdGVyKHtcbiAgICAgICAgLi4ub3B0cyxcbiAgICAgICAgSW5jcmVtZW50YWxDYWNoZSxcbiAgICAgICAgaW5jcmVtZW50YWxDYWNoZUhhbmRsZXIsXG4gICAgICAgIHBhZ2UsXG4gICAgICAgIGhhbmRsZXI6IGVycm9ySGFuZGxlZEhhbmRsZXIoaGFuZGxlclVzZXJsYW5kKVxuICAgIH0pO1xufTtcbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKHJlcXVlc3QsIGN0eCkge1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGludGVybmFsSGFuZGxlcih7XG4gICAgICAgIHJlcXVlc3Q6IHtcbiAgICAgICAgICAgIHVybDogcmVxdWVzdC51cmwsXG4gICAgICAgICAgICBtZXRob2Q6IHJlcXVlc3QubWV0aG9kLFxuICAgICAgICAgICAgaGVhZGVyczogdG9Ob2RlT3V0Z29pbmdIdHRwSGVhZGVycyhyZXF1ZXN0LmhlYWRlcnMpLFxuICAgICAgICAgICAgbmV4dENvbmZpZzoge1xuICAgICAgICAgICAgICAgIGJhc2VQYXRoOiBwcm9jZXNzLmVudi5fX05FWFRfQkFTRV9QQVRILFxuICAgICAgICAgICAgICAgIGkxOG46IHByb2Nlc3MuZW52Ll9fTkVYVF9JMThOX0NPTkZJRyxcbiAgICAgICAgICAgICAgICB0cmFpbGluZ1NsYXNoOiBCb29sZWFuKHByb2Nlc3MuZW52Ll9fTkVYVF9UUkFJTElOR19TTEFTSCksXG4gICAgICAgICAgICAgICAgZXhwZXJpbWVudGFsOiB7XG4gICAgICAgICAgICAgICAgICAgIGNhY2hlTGlmZTogcHJvY2Vzcy5lbnYuX19ORVhUX0NBQ0hFX0xJRkUsXG4gICAgICAgICAgICAgICAgICAgIGF1dGhJbnRlcnJ1cHRzOiBCb29sZWFuKHByb2Nlc3MuZW52Ll9fTkVYVF9FWFBFUklNRU5UQUxfQVVUSF9JTlRFUlJVUFRTKSxcbiAgICAgICAgICAgICAgICAgICAgY2xpZW50UGFyYW1QYXJzaW5nT3JpZ2luczogcHJvY2Vzcy5lbnYuX19ORVhUX0NMSUVOVF9QQVJBTV9QQVJTSU5HX09SSUdJTlNcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGFnZToge1xuICAgICAgICAgICAgICAgIG5hbWU6IHBhZ2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBib2R5OiByZXF1ZXN0Lm1ldGhvZCAhPT0gJ0dFVCcgJiYgcmVxdWVzdC5tZXRob2QgIT09ICdIRUFEJyA/IHJlcXVlc3QuYm9keSA/PyB1bmRlZmluZWQgOiB1bmRlZmluZWQsXG4gICAgICAgICAgICB3YWl0VW50aWw6IGN0eC53YWl0VW50aWwsXG4gICAgICAgICAgICByZXF1ZXN0TWV0YTogY3R4LnJlcXVlc3RNZXRhLFxuICAgICAgICAgICAgc2lnbmFsOiBjdHguc2lnbmFsIHx8IG5ldyBBYm9ydENvbnRyb2xsZXIoKS5zaWduYWxcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGN0eC53YWl0VW50aWwgPT0gbnVsbCA/IHZvaWQgMCA6IGN0eC53YWl0VW50aWwuY2FsbChjdHgsIHJlc3VsdC53YWl0VW50aWwpO1xuICAgIHJldHVybiByZXN1bHQucmVzcG9uc2U7XG59XG4vLyBiYWNrd2FyZHMgY29tcGF0XG5leHBvcnQgZGVmYXVsdCBpbnRlcm5hbEhhbmRsZXI7XG5cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPW1pZGRsZXdhcmUuanMubWFwXG4iXSwibmFtZXMiOltdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(middleware)/./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=C%3A%5CUsers%5Csreer%5COneDrive%5CDesktop%5CDatabaseDev2FinalProject%5Cdatabase_dev_2%5Cbackend%5Csrc%5Cproxy.js&page=%2Fproxy&rootDir=C%3A%5CUsers%5Csreer%5COneDrive%5CDesktop%5CDatabaseDev2FinalProject%5Cdatabase_dev_2%5Cbackend&matchers=&preferredRegion=&middlewareConfig=e30%3D!\n");

/***/ }),

/***/ "(middleware)/./src/proxy.js":
/*!**********************!*\
  !*** ./src/proxy.js ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   config: () => (/* binding */ config),\n/* harmony export */   proxy: () => (/* binding */ proxy)\n/* harmony export */ });\n/* harmony import */ var next_server__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! next/server */ \"(middleware)/./node_modules/next/dist/api/server.js\");\n\nconst AUTH_COOKIE_NAME = \"auth_token\";\nconst DEFAULT_ALLOWED_ORIGINS = [\n    \"http://localhost:3000\",\n    \"http://localhost:3001\"\n];\nconst PUBLIC_API_PATHS = new Set([\n    \"/api/auth/login\",\n    \"/api/auth/logout\"\n]);\nfunction getAllowedOrigins() {\n    const fromEnv = process.env.CORS_ALLOWED_ORIGINS;\n    if (!fromEnv) return DEFAULT_ALLOWED_ORIGINS;\n    return fromEnv.split(\",\").map((entry)=>entry.trim()).filter(Boolean);\n}\nfunction applyCorsHeaders(request, response) {\n    const origin = request.headers.get(\"origin\");\n    const allowedOrigins = getAllowedOrigins();\n    response.headers.set(\"Access-Control-Allow-Methods\", \"GET, POST, PUT, PATCH, DELETE, OPTIONS\");\n    response.headers.set(\"Access-Control-Allow-Headers\", \"Content-Type, Authorization\");\n    response.headers.set(\"Access-Control-Allow-Credentials\", \"true\");\n    response.headers.set(\"Vary\", \"Origin\");\n    if (origin && allowedOrigins.includes(origin)) {\n        response.headers.set(\"Access-Control-Allow-Origin\", origin);\n    }\n    return response;\n}\nfunction unauthorized(request) {\n    const response = next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.json({\n        success: false,\n        error: \"Unauthorized\"\n    }, {\n        status: 401\n    });\n    return applyCorsHeaders(request, response);\n}\nfunction proxy(request) {\n    const { pathname } = request.nextUrl;\n    if (!pathname.startsWith(\"/api/\")) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.next();\n    }\n    // Let route handlers answer CORS preflight.\n    if (request.method === \"OPTIONS\") {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.next();\n    }\n    if (PUBLIC_API_PATHS.has(pathname)) {\n        return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.next();\n    }\n    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;\n    if (!token) {\n        return unauthorized(request);\n    }\n    return next_server__WEBPACK_IMPORTED_MODULE_0__.NextResponse.next();\n}\nconst config = {\n    matcher: [\n        \"/api/:path*\"\n    ]\n};\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKG1pZGRsZXdhcmUpLy4vc3JjL3Byb3h5LmpzIiwibWFwcGluZ3MiOiI7Ozs7OztBQUEyQztBQUUzQyxNQUFNQyxtQkFBbUI7QUFDekIsTUFBTUMsMEJBQTBCO0lBQUM7SUFBeUI7Q0FBd0I7QUFDbEYsTUFBTUMsbUJBQW1CLElBQUlDLElBQUk7SUFBQztJQUFtQjtDQUFtQjtBQUV4RSxTQUFTQztJQUNQLE1BQU1DLFVBQVVDLFFBQVFDLEdBQUcsQ0FBQ0Msb0JBQW9CO0lBQ2hELElBQUksQ0FBQ0gsU0FBUyxPQUFPSjtJQUVyQixPQUFPSSxRQUNKSSxLQUFLLENBQUMsS0FDTkMsR0FBRyxDQUFDLENBQUNDLFFBQVVBLE1BQU1DLElBQUksSUFDekJDLE1BQU0sQ0FBQ0M7QUFDWjtBQUVBLFNBQVNDLGlCQUFpQkMsT0FBTyxFQUFFQyxRQUFRO0lBQ3pDLE1BQU1DLFNBQVNGLFFBQVFHLE9BQU8sQ0FBQ0MsR0FBRyxDQUFDO0lBQ25DLE1BQU1DLGlCQUFpQmpCO0lBRXZCYSxTQUFTRSxPQUFPLENBQUNHLEdBQUcsQ0FBQyxnQ0FBZ0M7SUFDckRMLFNBQVNFLE9BQU8sQ0FBQ0csR0FBRyxDQUFDLGdDQUFnQztJQUNyREwsU0FBU0UsT0FBTyxDQUFDRyxHQUFHLENBQUMsb0NBQW9DO0lBQ3pETCxTQUFTRSxPQUFPLENBQUNHLEdBQUcsQ0FBQyxRQUFRO0lBRTdCLElBQUlKLFVBQVVHLGVBQWVFLFFBQVEsQ0FBQ0wsU0FBUztRQUM3Q0QsU0FBU0UsT0FBTyxDQUFDRyxHQUFHLENBQUMsK0JBQStCSjtJQUN0RDtJQUVBLE9BQU9EO0FBQ1Q7QUFFQSxTQUFTTyxhQUFhUixPQUFPO0lBQzNCLE1BQU1DLFdBQVdsQixxREFBWUEsQ0FBQzBCLElBQUksQ0FBQztRQUFFQyxTQUFTO1FBQU9DLE9BQU87SUFBZSxHQUFHO1FBQUVDLFFBQVE7SUFBSTtJQUM1RixPQUFPYixpQkFBaUJDLFNBQVNDO0FBQ25DO0FBRU8sU0FBU1ksTUFBTWIsT0FBTztJQUMzQixNQUFNLEVBQUVjLFFBQVEsRUFBRSxHQUFHZCxRQUFRZSxPQUFPO0lBRXBDLElBQUksQ0FBQ0QsU0FBU0UsVUFBVSxDQUFDLFVBQVU7UUFDakMsT0FBT2pDLHFEQUFZQSxDQUFDa0MsSUFBSTtJQUMxQjtJQUVBLDRDQUE0QztJQUM1QyxJQUFJakIsUUFBUWtCLE1BQU0sS0FBSyxXQUFXO1FBQ2hDLE9BQU9uQyxxREFBWUEsQ0FBQ2tDLElBQUk7SUFDMUI7SUFFQSxJQUFJL0IsaUJBQWlCaUMsR0FBRyxDQUFDTCxXQUFXO1FBQ2xDLE9BQU8vQixxREFBWUEsQ0FBQ2tDLElBQUk7SUFDMUI7SUFFQSxNQUFNRyxRQUFRcEIsUUFBUXFCLE9BQU8sQ0FBQ2pCLEdBQUcsQ0FBQ3BCLG1CQUFtQnNDO0lBQ3JELElBQUksQ0FBQ0YsT0FBTztRQUNWLE9BQU9aLGFBQWFSO0lBQ3RCO0lBRUEsT0FBT2pCLHFEQUFZQSxDQUFDa0MsSUFBSTtBQUMxQjtBQUVPLE1BQU1NLFNBQVM7SUFDcEJDLFNBQVM7UUFBQztLQUFjO0FBQzFCLEVBQUUiLCJzb3VyY2VzIjpbIkM6XFxVc2Vyc1xcc3JlZXJcXE9uZURyaXZlXFxEZXNrdG9wXFxEYXRhYmFzZURldjJGaW5hbFByb2plY3RcXGRhdGFiYXNlX2Rldl8yXFxiYWNrZW5kXFxzcmNcXHByb3h5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IE5leHRSZXNwb25zZSB9IGZyb20gXCJuZXh0L3NlcnZlclwiO1xyXG5cclxuY29uc3QgQVVUSF9DT09LSUVfTkFNRSA9IFwiYXV0aF90b2tlblwiO1xyXG5jb25zdCBERUZBVUxUX0FMTE9XRURfT1JJR0lOUyA9IFtcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMFwiLCBcImh0dHA6Ly9sb2NhbGhvc3Q6MzAwMVwiXTtcclxuY29uc3QgUFVCTElDX0FQSV9QQVRIUyA9IG5ldyBTZXQoW1wiL2FwaS9hdXRoL2xvZ2luXCIsIFwiL2FwaS9hdXRoL2xvZ291dFwiXSk7XHJcblxyXG5mdW5jdGlvbiBnZXRBbGxvd2VkT3JpZ2lucygpIHtcclxuICBjb25zdCBmcm9tRW52ID0gcHJvY2Vzcy5lbnYuQ09SU19BTExPV0VEX09SSUdJTlM7XHJcbiAgaWYgKCFmcm9tRW52KSByZXR1cm4gREVGQVVMVF9BTExPV0VEX09SSUdJTlM7XHJcblxyXG4gIHJldHVybiBmcm9tRW52XHJcbiAgICAuc3BsaXQoXCIsXCIpXHJcbiAgICAubWFwKChlbnRyeSkgPT4gZW50cnkudHJpbSgpKVxyXG4gICAgLmZpbHRlcihCb29sZWFuKTtcclxufVxyXG5cclxuZnVuY3Rpb24gYXBwbHlDb3JzSGVhZGVycyhyZXF1ZXN0LCByZXNwb25zZSkge1xyXG4gIGNvbnN0IG9yaWdpbiA9IHJlcXVlc3QuaGVhZGVycy5nZXQoXCJvcmlnaW5cIik7XHJcbiAgY29uc3QgYWxsb3dlZE9yaWdpbnMgPSBnZXRBbGxvd2VkT3JpZ2lucygpO1xyXG5cclxuICByZXNwb25zZS5oZWFkZXJzLnNldChcIkFjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHNcIiwgXCJHRVQsIFBPU1QsIFBVVCwgUEFUQ0gsIERFTEVURSwgT1BUSU9OU1wiKTtcclxuICByZXNwb25zZS5oZWFkZXJzLnNldChcIkFjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnNcIiwgXCJDb250ZW50LVR5cGUsIEF1dGhvcml6YXRpb25cIik7XHJcbiAgcmVzcG9uc2UuaGVhZGVycy5zZXQoXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiLCBcInRydWVcIik7XHJcbiAgcmVzcG9uc2UuaGVhZGVycy5zZXQoXCJWYXJ5XCIsIFwiT3JpZ2luXCIpO1xyXG5cclxuICBpZiAob3JpZ2luICYmIGFsbG93ZWRPcmlnaW5zLmluY2x1ZGVzKG9yaWdpbikpIHtcclxuICAgIHJlc3BvbnNlLmhlYWRlcnMuc2V0KFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luXCIsIG9yaWdpbik7XHJcbiAgfVxyXG5cclxuICByZXR1cm4gcmVzcG9uc2U7XHJcbn1cclxuXHJcbmZ1bmN0aW9uIHVuYXV0aG9yaXplZChyZXF1ZXN0KSB7XHJcbiAgY29uc3QgcmVzcG9uc2UgPSBOZXh0UmVzcG9uc2UuanNvbih7IHN1Y2Nlc3M6IGZhbHNlLCBlcnJvcjogXCJVbmF1dGhvcml6ZWRcIiB9LCB7IHN0YXR1czogNDAxIH0pO1xyXG4gIHJldHVybiBhcHBseUNvcnNIZWFkZXJzKHJlcXVlc3QsIHJlc3BvbnNlKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHByb3h5KHJlcXVlc3QpIHtcclxuICBjb25zdCB7IHBhdGhuYW1lIH0gPSByZXF1ZXN0Lm5leHRVcmw7XHJcblxyXG4gIGlmICghcGF0aG5hbWUuc3RhcnRzV2l0aChcIi9hcGkvXCIpKSB7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLm5leHQoKTtcclxuICB9XHJcblxyXG4gIC8vIExldCByb3V0ZSBoYW5kbGVycyBhbnN3ZXIgQ09SUyBwcmVmbGlnaHQuXHJcbiAgaWYgKHJlcXVlc3QubWV0aG9kID09PSBcIk9QVElPTlNcIikge1xyXG4gICAgcmV0dXJuIE5leHRSZXNwb25zZS5uZXh0KCk7XHJcbiAgfVxyXG5cclxuICBpZiAoUFVCTElDX0FQSV9QQVRIUy5oYXMocGF0aG5hbWUpKSB7XHJcbiAgICByZXR1cm4gTmV4dFJlc3BvbnNlLm5leHQoKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHRva2VuID0gcmVxdWVzdC5jb29raWVzLmdldChBVVRIX0NPT0tJRV9OQU1FKT8udmFsdWU7XHJcbiAgaWYgKCF0b2tlbikge1xyXG4gICAgcmV0dXJuIHVuYXV0aG9yaXplZChyZXF1ZXN0KTtcclxuICB9XHJcblxyXG4gIHJldHVybiBOZXh0UmVzcG9uc2UubmV4dCgpO1xyXG59XHJcblxyXG5leHBvcnQgY29uc3QgY29uZmlnID0ge1xyXG4gIG1hdGNoZXI6IFtcIi9hcGkvOnBhdGgqXCJdLFxyXG59O1xyXG4iXSwibmFtZXMiOlsiTmV4dFJlc3BvbnNlIiwiQVVUSF9DT09LSUVfTkFNRSIsIkRFRkFVTFRfQUxMT1dFRF9PUklHSU5TIiwiUFVCTElDX0FQSV9QQVRIUyIsIlNldCIsImdldEFsbG93ZWRPcmlnaW5zIiwiZnJvbUVudiIsInByb2Nlc3MiLCJlbnYiLCJDT1JTX0FMTE9XRURfT1JJR0lOUyIsInNwbGl0IiwibWFwIiwiZW50cnkiLCJ0cmltIiwiZmlsdGVyIiwiQm9vbGVhbiIsImFwcGx5Q29yc0hlYWRlcnMiLCJyZXF1ZXN0IiwicmVzcG9uc2UiLCJvcmlnaW4iLCJoZWFkZXJzIiwiZ2V0IiwiYWxsb3dlZE9yaWdpbnMiLCJzZXQiLCJpbmNsdWRlcyIsInVuYXV0aG9yaXplZCIsImpzb24iLCJzdWNjZXNzIiwiZXJyb3IiLCJzdGF0dXMiLCJwcm94eSIsInBhdGhuYW1lIiwibmV4dFVybCIsInN0YXJ0c1dpdGgiLCJuZXh0IiwibWV0aG9kIiwiaGFzIiwidG9rZW4iLCJjb29raWVzIiwidmFsdWUiLCJjb25maWciLCJtYXRjaGVyIl0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(middleware)/./src/proxy.js\n");

/***/ }),

/***/ "../app-render/after-task-async-storage.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/app-render/after-task-async-storage.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/after-task-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-async-storage.external":
/*!*****************************************************************************!*\
  !*** external "next/dist/server/app-render/work-async-storage.external.js" ***!
  \*****************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/work-async-storage.external.js");

/***/ }),

/***/ "../app-render/work-unit-async-storage.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/app-render/work-unit-async-storage.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/app-render/work-unit-async-storage.external.js");

/***/ }),

/***/ "./memory-cache.external":
/*!**********************************************************************************!*\
  !*** external "next/dist/server/lib/incremental-cache/memory-cache.external.js" ***!
  \**********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/lib/incremental-cache/memory-cache.external.js");

/***/ }),

/***/ "./shared-cache-controls.external":
/*!*******************************************************************************************!*\
  !*** external "next/dist/server/lib/incremental-cache/shared-cache-controls.external.js" ***!
  \*******************************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/lib/incremental-cache/shared-cache-controls.external.js");

/***/ }),

/***/ "./tags-manifest.external":
/*!***********************************************************************************!*\
  !*** external "next/dist/server/lib/incremental-cache/tags-manifest.external.js" ***!
  \***********************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/server/lib/incremental-cache/tags-manifest.external.js");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("crypto");

/***/ }),

/***/ "next/dist/build/adapter/setup-node-env.external":
/*!******************************************************************!*\
  !*** external "next/dist/build/adapter/setup-node-env.external" ***!
  \******************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/build/adapter/setup-node-env.external");

/***/ }),

/***/ "next/dist/compiled/next-server/app-page.runtime.dev.js":
/*!*************************************************************************!*\
  !*** external "next/dist/compiled/next-server/app-page.runtime.dev.js" ***!
  \*************************************************************************/
/***/ ((module) => {

module.exports = require("next/dist/compiled/next-server/app-page.runtime.dev.js");

/***/ }),

/***/ "node:async_hooks":
/*!***********************************!*\
  !*** external "node:async_hooks" ***!
  \***********************************/
/***/ ((module) => {

module.exports = require("node:async_hooks");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("path");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("./webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, ["vendor-chunks/next","vendor-chunks/@swc"], () => (__webpack_exec__("(middleware)/./node_modules/next/dist/build/webpack/loaders/next-middleware-loader.js?absolutePagePath=C%3A%5CUsers%5Csreer%5COneDrive%5CDesktop%5CDatabaseDev2FinalProject%5Cdatabase_dev_2%5Cbackend%5Csrc%5Cproxy.js&page=%2Fproxy&rootDir=C%3A%5CUsers%5Csreer%5COneDrive%5CDesktop%5CDatabaseDev2FinalProject%5Cdatabase_dev_2%5Cbackend&matchers=&preferredRegion=&middlewareConfig=e30%3D!")));
module.exports = __webpack_exports__;

})();