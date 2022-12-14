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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var Util_1 = __importDefault(require("../Util"));
var BASE_API = "https://www.youtube.com/youtubei/v1/browse?key=";
var Playlist = (function () {
    function Playlist(data, searchResult) {
        if (data === void 0) { data = {}; }
        if (searchResult === void 0) { searchResult = false; }
        this._continuation = {};
        if (!data)
            throw new Error("Cannot instantiate the " + this.constructor.name + " class without data!");
        if (!!searchResult)
            this._patchSearch(data);
        else
            this._patch(data);
    }
    Playlist.prototype._patch = function (data) {
        var _a, _b, _c, _d, _e, _f;
        this.id = data.id || null;
        this.title = data.title || null;
        this.videoCount = data.videoCount || 0;
        this.lastUpdate = data.lastUpdate || null;
        this.views = data.views || 0;
        this.url = data.url || null;
        this.link = data.link || null;
        this.channel = data.author || null;
        this.thumbnail = data.thumbnail || null;
        this.videos = data.videos || [];
        this._continuation.api = (_b = (_a = data.continuation) === null || _a === void 0 ? void 0 : _a.api) !== null && _b !== void 0 ? _b : null;
        this._continuation.token = (_d = (_c = data.continuation) === null || _c === void 0 ? void 0 : _c.token) !== null && _d !== void 0 ? _d : null;
        this._continuation.clientVersion = (_f = (_e = data.continuation) === null || _e === void 0 ? void 0 : _e.clientVersion) !== null && _f !== void 0 ? _f : "<important data>";
    };
    Playlist.prototype._patchSearch = function (data) {
        this.id = data.id || null;
        this.title = data.title || null;
        this.thumbnail = data.thumbnail || null;
        this.channel = data.channel || null;
        this.videos = [];
        this.videoCount = data.videos || 0;
        this.url = this.id ? "https://www.youtube.com/playlist?list=" + this.id : null;
        this.link = null;
        this.lastUpdate = null;
        this.views = 0;
    };
    Playlist.prototype.next = function (limit) {
        var _a, _b, _c;
        if (limit === void 0) { limit = Infinity; }
        return __awaiter(this, void 0, void 0, function () {
            var nextPage, contents, partial;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this._continuation || !this._continuation.token)
                            return [2, []];
                        return [4, Util_1.default.getHTML("" + BASE_API + this._continuation.api, {
                                method: "POST",
                                body: JSON.stringify({
                                    continuation: this._continuation.token,
                                    context: {
                                        client: {
                                            utcOffsetMinutes: 0,
                                            gl: "US",
                                            hl: "en",
                                            clientName: "WEB",
                                            clientVersion: this._continuation.clientVersion
                                        },
                                        user: {},
                                        request: {}
                                    }
                                })
                            })];
                    case 1:
                        nextPage = _d.sent();
                        contents = (_c = (_b = (_a = Util_1.default.json(nextPage)) === null || _a === void 0 ? void 0 : _a.onResponseReceivedActions[0]) === null || _b === void 0 ? void 0 : _b.appendContinuationItemsAction) === null || _c === void 0 ? void 0 : _c.continuationItems;
                        if (!contents)
                            return [2, []];
                        partial = Util_1.default.getPlaylistVideos(contents, limit);
                        this._continuation.token = Util_1.default.getContinuationToken(contents);
                        this.videos = __spreadArray(__spreadArray([], __read(this.videos), false), __read(partial), false);
                        return [2, partial];
                }
            });
        });
    };
    Playlist.prototype.fetch = function (max) {
        if (max === void 0) { max = Infinity; }
        return __awaiter(this, void 0, void 0, function () {
            var ctn, res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ctn = this._continuation.token;
                        if (!ctn)
                            return [2, this];
                        if (max < 1)
                            max = Infinity;
                        _a.label = 1;
                    case 1:
                        if (!(typeof this._continuation.token === "string" && this._continuation.token.length)) return [3, 3];
                        if (this.videos.length >= max)
                            return [3, 3];
                        return [4, this.next()];
                    case 2:
                        res = _a.sent();
                        if (!res.length)
                            return [3, 3];
                        return [3, 1];
                    case 3: return [2, this];
                }
            });
        });
    };
    Object.defineProperty(Playlist.prototype, "type", {
        get: function () {
            return "playlist";
        },
        enumerable: false,
        configurable: true
    });
    Playlist.prototype[Symbol.iterator] = function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [5, __values(this.videos)];
                case 1:
                    _a.sent();
                    return [2];
            }
        });
    };
    Playlist.prototype.toJSON = function () {
        return {
            id: this.id,
            title: this.title,
            thumbnail: this.thumbnail.toJSON(),
            channel: {
                name: this.channel.name,
                id: this.channel.id,
                icon: this.channel.iconURL()
            },
            url: this.url,
            videos: this.videos
        };
    };
    return Playlist;
}());
exports.default = Playlist;
