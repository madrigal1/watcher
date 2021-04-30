#!/usr/bin/env node 
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = __importDefault(require("child_process"));
var path_1 = __importDefault(require("path"));
var tree_kill_1 = __importDefault(require("tree-kill"));
var chokidar_1 = __importDefault(require("chokidar"));
var Watcher = /** @class */ (function () {
    function Watcher() {
        var _this = this;
        this.processExited = true;
        this.pathsToWatch = [
            path_1.default.join(process.cwd(), "/***.js"),
            path_1.default.join(process.cwd(), "/**/*.json"),
            path_1.default.join(process.cwd(), "/**/*.env.*"),
        ];
        this.init = function () { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.startProcess()];
                    case 1:
                        _a.nodeProcess = _b.sent();
                        this.watchFiles();
                        process.once("SIGINT", function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.exitHandler("SIGINT")];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); });
                        process.once("SIGTERM", function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.exitHandler("SIGTERM")];
                                case 1: return [2 /*return*/, _a.sent()];
                            }
                        }); }); });
                        process.stdin.on("data", function (chunk) { return __awaiter(_this, void 0, void 0, function () {
                            var str;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        str = chunk.toString();
                                        if (!(str === "rs\n")) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this.reload("Manual reload")];
                                    case 1:
                                        _a.sent();
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        }); };
        this.startProcess = function () {
            var nodeProcess = child_process_1.default.spawn("node", [process.argv[2]], {
                stdio: ["pipe", process.stdout, process.stderr]
            });
            _this.processExited = false;
            process.stdin.pipe(nodeProcess.stdin);
            nodeProcess.stdin.on("close", function () {
                process.stdin.unpipe(nodeProcess.stdin);
                process.stdin.resume();
            });
            nodeProcess.on("close", function (code, signal) {
                _this.processExited = true;
                console.log("child process has closed ");
                _this.print('log', "Process " + process.argv[2] + " exited with " + (code ? "code " + code : "signal " + signal));
            });
            nodeProcess.on("error", function (err) {
                _this.processExited = true;
                _this.print("log", "Failed to start process " + process.argv[2]);
            });
            return nodeProcess;
        };
        this.print = function (type, message) {
            console[type]("[WATCHER]: " + message);
        };
        this.watchFiles = function () {
            chokidar_1.default
                .watch(_this.pathsToWatch, {
                ignored: "**/node_modules/*",
                ignoreInitial: true,
            }).on("all", function () { return __awaiter(_this, void 0, void 0, function () {
                var timeoutKey;
                var _this = this;
                return __generator(this, function (_a) {
                    timeoutKey = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (this.previousReload)
                                        clearTimeout(this.previousReload);
                                    return [4 /*yield*/, this.reload("File change")];
                                case 1:
                                    _a.sent();
                                    return [2 /*return*/];
                            }
                        });
                    }); }, 1000);
                    this.previousReload = timeoutKey;
                    return [2 /*return*/];
                });
            }); });
        };
        this.reload = function (event) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.print("info", event + " detected . Restarting process");
                        return [4 /*yield*/, this.stopProcess()];
                    case 1:
                        _b.sent();
                        _a = this;
                        return [4 /*yield*/, this.startProcess()];
                    case 2:
                        _a.nodeProcess = _b.sent();
                        return [2 /*return*/];
                }
            });
        }); };
        this.stopProcess = function () {
            if (_this.processExited)
                return true;
            return new Promise(function (resolve, reject) {
                tree_kill_1.default(_this.nodeProcess.pid, "SIGTERM", function (err) {
                    if (err)
                        tree_kill_1.default(_this.nodeProcess.pid, "SIGKILL", function () { });
                });
                var key = setInterval(function () {
                    if (_this.processExited) {
                        clearInterval(key);
                        resolve(true);
                    }
                }, 500);
            });
        };
        this.exitHandler = function (signal) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.print("debug", "Detected signal " + signal + ". Exiting ...");
                        return [4 /*yield*/, this.stopProcess()];
                    case 1:
                        _a.sent();
                        process.exit();
                        return [2 /*return*/];
                }
            });
        }); };
        // console.log(process.argv);
        // console.log(process.cwd())
        if (process.argv.length != 3) {
            console.error("Expected 1 argument, recieved " + (process.argv.length - 2) + " arguments");
        }
        else {
            this.init();
        }
    }
    return Watcher;
}());
new Watcher();
