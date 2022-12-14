"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var Channel_1 = __importDefault(require("./Structures/Channel"));
var Playlist_1 = __importDefault(require("./Structures/Playlist"));
var Video_1 = __importDefault(require("./Structures/Video"));
var PLAYLIST_REGEX = /^https?:\/\/(www.)?youtube.com\/playlist\?list=((PL|UU|LL|RD|OL)[a-zA-Z0-9-_]{16,41})$/;
var PLAYLIST_ID = /(PL|UU|LL|RD|OL)[a-zA-Z0-9-_]{16,41}/;
var VIDEO_URL = /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/;
var VIDEO_ID = /^[a-zA-Z0-9-_]{11}$/;
var fetch = getFetch();
var DEFAULT_API_KEY = "AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8";
function getFetch() {
    if (typeof window !== "undefined")
        return window.fetch;
    return require("node-fetch").default;
}
var Util = (function () {
    function Util() {
        throw new Error("The " + this.constructor.name + " class may not be instantiated!");
    }
    Object.defineProperty(Util, "VideoRegex", {
        get: function () {
            return VIDEO_URL;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Util, "VideoIDRegex", {
        get: function () {
            return VIDEO_ID;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Util, "PlaylistURLRegex", {
        get: function () {
            return PLAYLIST_REGEX;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Util, "PlaylistIDRegex", {
        get: function () {
            return PLAYLIST_ID;
        },
        enumerable: false,
        configurable: true
    });
    Util.getHTML = function (url, requestOptions) {
        if (!requestOptions)
            requestOptions = {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; rv:78.0) Gecko/20100101 Firefox/78.0"
                }
            };
        return new Promise(function (resolve, reject) {
            fetch(url, requestOptions)
                .then(function (res) {
                if (!res.ok)
                    throw new Error("Rejected with status code: " + res.status);
                return res.text();
            })
                .then(function (html) { return resolve(html); })
                .catch(function (e) { return reject(e); });
        });
    };
    Util.parseDuration = function (duration) {
        duration !== null && duration !== void 0 ? duration : (duration = "0:00");
        var args = duration.split(":");
        var dur = 0;
        switch (args.length) {
            case 3:
                dur = parseInt(args[0]) * 60 * 60 * 1000 + parseInt(args[1]) * 60 * 1000 + parseInt(args[2]) * 1000;
                break;
            case 2:
                dur = parseInt(args[0]) * 60 * 1000 + parseInt(args[1]) * 1000;
                break;
            default:
                dur = parseInt(args[0]) * 1000;
        }
        return dur;
    };
    Util.parseSearchResult = function (html, options) {
        if (!html)
            throw new Error("Invalid raw data");
        if (!options)
            options = { type: "video", limit: 0 };
        if (!options.type)
            options.type = "video";
        var results = [];
        var details = [];
        var fetched = false;
        try {
            var data = html.split("ytInitialData = JSON.parse('")[1].split("');</script>")[0];
            html = data.replace(/\\x([0-9A-F]{2})/gi, function () {
                var items = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    items[_i] = arguments[_i];
                }
                return String.fromCharCode(parseInt(items[1], 16));
            });
        }
        catch (_a) {
        }
        try {
            details = JSON.parse(html.split('{"itemSectionRenderer":{"contents":')[html.split('{"itemSectionRenderer":{"contents":').length - 1].split(',"continuations":[{')[0]);
            fetched = true;
        }
        catch (_b) {
        }
        if (!fetched) {
            try {
                details = JSON.parse(html.split('{"itemSectionRenderer":')[html.split('{"itemSectionRenderer":').length - 1].split('},{"continuationItemRenderer":{')[0]).contents;
                fetched = true;
            }
            catch (_c) {
            }
        }
        if (!fetched)
            return [];
        for (var i = 0; i < details.length; i++) {
            if (typeof options.limit === "number" && options.limit > 0 && results.length >= options.limit)
                break;
            var data = details[i];
            var res = void 0;
            if (options.type === "all") {
                if (!!data.videoRenderer)
                    options.type = "video";
                else if (!!data.channelRenderer)
                    options.type = "channel";
                else if (!!data.playlistRenderer)
                    options.type = "playlist";
                else
                    continue;
            }
            if (options.type === "video") {
                var parsed = Util.parseVideo(data);
                if (!parsed)
                    continue;
                res = parsed;
            }
            else if (options.type === "channel") {
                var parsed = Util.parseChannel(data);
                if (!parsed)
                    continue;
                res = parsed;
            }
            else if (options.type === "playlist") {
                var parsed = Util.parsePlaylist(data);
                if (!parsed)
                    continue;
                res = parsed;
            }
            results.push(res);
        }
        return results;
    };
    Util.parseChannel = function (data) {
        var _a, _b;
        if (!data || !data.channelRenderer)
            return;
        var badge = data.channelRenderer.ownerBadges && data.channelRenderer.ownerBadges[0];
        var url = "https://www.youtube.com" + (data.channelRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl || data.channelRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url);
        var res = new Channel_1.default({
            id: data.channelRenderer.channelId,
            name: data.channelRenderer.title.simpleText,
            icon: data.channelRenderer.thumbnail.thumbnails[data.channelRenderer.thumbnail.thumbnails.length - 1],
            url: url,
            verified: Boolean((_b = (_a = badge === null || badge === void 0 ? void 0 : badge.metadataBadgeRenderer) === null || _a === void 0 ? void 0 : _a.style) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes("verified")),
            subscribers: data.channelRenderer.subscriberCountText.simpleText
        });
        return res;
    };
    Util.parseVideo = function (data) {
        var _a, _b, _c, _d, _e, _f, _g;
        if (!data || !data.videoRenderer)
            return;
        var badge = data.videoRenderer.ownerBadges && data.videoRenderer.ownerBadges[0];
        var res = new Video_1.default({
            id: data.videoRenderer.videoId,
            url: "https://www.youtube.com/watch?v=" + data.videoRenderer.videoId,
            title: data.videoRenderer.title.runs[0].text,
            description: data.videoRenderer.descriptionSnippet && data.videoRenderer.descriptionSnippet.runs[0] ? data.videoRenderer.descriptionSnippet.runs[0].text : "",
            duration: data.videoRenderer.lengthText ? Util.parseDuration(data.videoRenderer.lengthText.simpleText) : 0,
            duration_raw: data.videoRenderer.lengthText ? data.videoRenderer.lengthText.simpleText : null,
            thumbnail: {
                id: data.videoRenderer.videoId,
                url: data.videoRenderer.thumbnail.thumbnails[data.videoRenderer.thumbnail.thumbnails.length - 1].url,
                height: data.videoRenderer.thumbnail.thumbnails[data.videoRenderer.thumbnail.thumbnails.length - 1].height,
                width: data.videoRenderer.thumbnail.thumbnails[data.videoRenderer.thumbnail.thumbnails.length - 1].width
            },
            channel: {
                id: data.videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.browseId || null,
                name: data.videoRenderer.ownerText.runs[0].text || null,
                url: "https://www.youtube.com" + (data.videoRenderer.ownerText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl || data.videoRenderer.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url),
                icon: {
                    url: data.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].url,
                    width: data.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].width,
                    height: data.videoRenderer.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0].height
                },
                verified: Boolean((_b = (_a = badge === null || badge === void 0 ? void 0 : badge.metadataBadgeRenderer) === null || _a === void 0 ? void 0 : _a.style) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes("verified"))
            },
            uploadedAt: (_d = (_c = data.videoRenderer.publishedTimeText) === null || _c === void 0 ? void 0 : _c.simpleText) !== null && _d !== void 0 ? _d : null,
            views: (_g = (_f = (_e = data.videoRenderer.viewCountText) === null || _e === void 0 ? void 0 : _e.simpleText) === null || _f === void 0 ? void 0 : _f.replace(/[^0-9]/g, "")) !== null && _g !== void 0 ? _g : 0
        });
        return res;
    };
    Util.parsePlaylist = function (data) {
        if (!data.playlistRenderer)
            return;
        var res = new Playlist_1.default({
            id: data.playlistRenderer.playlistId,
            title: data.playlistRenderer.title.simpleText,
            thumbnail: {
                id: data.playlistRenderer.playlistId,
                url: data.playlistRenderer.thumbnails[0].thumbnails[data.playlistRenderer.thumbnails[0].thumbnails.length - 1].url,
                height: data.playlistRenderer.thumbnails[0].thumbnails[data.playlistRenderer.thumbnails[0].thumbnails.length - 1].height,
                width: data.playlistRenderer.thumbnails[0].thumbnails[data.playlistRenderer.thumbnails[0].thumbnails.length - 1].width
            },
            channel: {
                id: data.playlistRenderer.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                name: data.playlistRenderer.shortBylineText.runs[0].text,
                url: "https://www.youtube.com" + data.playlistRenderer.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url
            },
            videos: parseInt(data.playlistRenderer.videoCount.replace(/[^0-9]/g, ""))
        }, true);
        return res;
    };
    Util.getPlaylistVideos = function (data, limit) {
        var _a, _b, _c, _d;
        if (limit === void 0) { limit = Infinity; }
        var videos = [];
        for (var i = 0; i < data.length; i++) {
            if (limit === videos.length)
                break;
            var info = data[i].playlistVideoRenderer;
            if (!info || !info.shortBylineText)
                continue;
            videos.push(new Video_1.default({
                id: info.videoId,
                index: parseInt((_a = info.index) === null || _a === void 0 ? void 0 : _a.simpleText) || 0,
                duration: Util.parseDuration((_b = info.lengthText) === null || _b === void 0 ? void 0 : _b.simpleText) || 0,
                duration_raw: (_d = (_c = info.lengthText) === null || _c === void 0 ? void 0 : _c.simpleText) !== null && _d !== void 0 ? _d : "0:00",
                thumbnail: {
                    id: info.videoId,
                    url: info.thumbnail.thumbnails[info.thumbnail.thumbnails.length - 1].url,
                    height: info.thumbnail.thumbnails[info.thumbnail.thumbnails.length - 1].height,
                    width: info.thumbnail.thumbnails[info.thumbnail.thumbnails.length - 1].width
                },
                title: info.title.runs[0].text,
                channel: {
                    id: info.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId || null,
                    name: info.shortBylineText.runs[0].text || null,
                    url: "https://www.youtube.com" + (info.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl || info.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url),
                    icon: null
                }
            }));
        }
        return videos;
    };
    Util.getPlaylist = function (html, limit) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        if (!limit || typeof limit !== "number")
            limit = 100;
        if (limit <= 0)
            limit = Infinity;
        var parsed;
        var playlistDetails;
        try {
            var rawJSON = html.split('{"playlistVideoListRenderer":{"contents":')[1].split('}],"playlistId"')[0] + "}]";
            parsed = JSON.parse(rawJSON);
            playlistDetails = JSON.parse(html.split('{"playlistSidebarRenderer":')[1].split("}};</script>")[0]).items;
        }
        catch (_p) {
            return null;
        }
        var API_KEY = (_d = (_b = (_a = html.split('INNERTUBE_API_KEY":"')[1]) === null || _a === void 0 ? void 0 : _a.split('"')[0]) !== null && _b !== void 0 ? _b : (_c = html.split('innertubeApiKey":"')[1]) === null || _c === void 0 ? void 0 : _c.split('"')[0]) !== null && _d !== void 0 ? _d : DEFAULT_API_KEY;
        var videos = Util.getPlaylistVideos(parsed, limit);
        var data = playlistDetails[0].playlistSidebarPrimaryInfoRenderer;
        if (!data.title.runs || !data.title.runs.length)
            return null;
        var author = (_e = playlistDetails[1]) === null || _e === void 0 ? void 0 : _e.playlistSidebarSecondaryInfoRenderer.videoOwner;
        var views = data.stats.length === 3 ? data.stats[1].simpleText.replace(/[^0-9]/g, "") : 0;
        var lastUpdate = (_h = (_g = (_f = data.stats.find(function (x) { return "runs" in x && x["runs"].find(function (y) { return y.text.toLowerCase().includes("last update"); }); })) === null || _f === void 0 ? void 0 : _f.runs.pop()) === null || _g === void 0 ? void 0 : _g.text) !== null && _h !== void 0 ? _h : null;
        var videosCount = data.stats[0].runs[0].text.replace(/[^0-9]/g, "") || 0;
        var res = new Playlist_1.default({
            continuation: {
                api: API_KEY,
                token: Util.getContinuationToken(parsed),
                clientVersion: (_m = (_k = (_j = html.split('"INNERTUBE_CONTEXT_CLIENT_VERSION":"')[1]) === null || _j === void 0 ? void 0 : _j.split('"')[0]) !== null && _k !== void 0 ? _k : (_l = html.split('"innertube_context_client_version":"')[1]) === null || _l === void 0 ? void 0 : _l.split('"')[0]) !== null && _m !== void 0 ? _m : "<some version>"
            },
            id: data.title.runs[0].navigationEndpoint.watchEndpoint.playlistId,
            title: data.title.runs[0].text,
            videoCount: parseInt(videosCount) || 0,
            lastUpdate: lastUpdate,
            views: parseInt(views) || 0,
            videos: videos,
            url: "https://www.youtube.com/playlist?list=" + data.title.runs[0].navigationEndpoint.watchEndpoint.playlistId,
            link: "https://www.youtube.com" + data.title.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url,
            author: author
                ? {
                    name: author.videoOwnerRenderer.title.runs[0].text,
                    id: author.videoOwnerRenderer.title.runs[0].navigationEndpoint.browseEndpoint.browseId,
                    url: "https://www.youtube.com" + (author.videoOwnerRenderer.navigationEndpoint.commandMetadata.webCommandMetadata.url || author.videoOwnerRenderer.navigationEndpoint.browseEndpoint.canonicalBaseUrl),
                    icon: author.videoOwnerRenderer.thumbnail.thumbnails.length ? author.videoOwnerRenderer.thumbnail.thumbnails[author.videoOwnerRenderer.thumbnail.thumbnails.length - 1].url : null
                }
                : {},
            thumbnail: ((_o = data.thumbnailRenderer.playlistVideoThumbnailRenderer) === null || _o === void 0 ? void 0 : _o.thumbnail.thumbnails.length) ? data.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails[data.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail.thumbnails.length - 1].url : null
        });
        return res;
    };
    Util.getContinuationToken = function (ctx) {
        var _a, _b, _c;
        var continuationToken = (_c = (_b = (_a = ctx.find(function (x) { return Object.keys(x)[0] === "continuationItemRenderer"; })) === null || _a === void 0 ? void 0 : _a.continuationItemRenderer.continuationEndpoint) === null || _b === void 0 ? void 0 : _b.continuationCommand) === null || _c === void 0 ? void 0 : _c.token;
        return continuationToken;
    };
    Util.getVideo = function (html) {
        var _a, _b;
        var data, nextData = {};
        try {
            var parsed = JSON.parse(html.split("var ytInitialData = ")[1].split(";</script>")[0]);
            data = parsed.contents.twoColumnWatchNextResults.results.results.contents;
            try {
                nextData = parsed.contents.twoColumnWatchNextResults.secondaryResults.secondaryResults.results;
            }
            catch (_c) { }
        }
        catch (_d) {
            throw new Error("Could not parse video metadata!");
        }
        var raw = {
            primary: data[0].videoPrimaryInfoRenderer,
            secondary: data[1].videoSecondaryInfoRenderer
        };
        var info;
        try {
            info = JSON.parse(html.split("var ytInitialPlayerResponse = ")[1].split(";</script>")[0]).videoDetails;
        }
        catch (_e) {
            info = JSON.parse(html.split("var ytInitialPlayerResponse = ")[1].split(";var meta")[0]).videoDetails;
        }
        info = __assign(__assign(__assign({}, raw.primary), raw.secondary), { info: info });
        var payload = new Video_1.default({
            id: info.info.videoId,
            title: info.info.title,
            views: parseInt(info.info.viewCount) || 0,
            tags: info.info.keywords,
            private: info.info.isPrivate,
            live: info.info.isLiveContent,
            duration: parseInt(info.info.lengthSeconds) * 1000,
            duration_raw: Util.durationString(Util.parseMS(parseInt(info.info.lengthSeconds) * 1000 || 0)),
            channel: {
                name: info.info.author,
                id: info.info.channelId,
                url: "https://www.youtube.com" + info.owner.videoOwnerRenderer.title.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl,
                icon: info.owner.videoOwnerRenderer.thumbnail.thumbnails[0],
                subscribers: (_b = (_a = info.owner.videoOwnerRenderer.subscriberCountText) === null || _a === void 0 ? void 0 : _a.simpleText) === null || _b === void 0 ? void 0 : _b.replace(" subscribers", "")
            },
            description: info.info.shortDescription,
            thumbnail: __assign(__assign({}, info.info.thumbnail.thumbnails[info.info.thumbnail.thumbnails.length - 1]), { id: info.info.videoId }),
            uploadedAt: info.dateText.simpleText,
            ratings: {
                likes: parseInt(info.sentimentBar.sentimentBarRenderer.tooltip.split(" / ")[0].replace(/,/g, "")),
                dislikes: parseInt(info.sentimentBar.sentimentBarRenderer.tooltip.split(" / ")[1].replace(/,/g, ""))
            },
            videos: Util.getNext(nextData !== null && nextData !== void 0 ? nextData : {})
        });
        return payload;
    };
    Util.getNext = function (body, home) {
        var e_1, _a;
        var _b, _c, _d, _e, _f;
        if (home === void 0) { home = false; }
        var results = [];
        if (typeof body[Symbol.iterator] !== "function")
            return results;
        try {
            for (var body_1 = __values(body), body_1_1 = body_1.next(); !body_1_1.done; body_1_1 = body_1.next()) {
                var result = body_1_1.value;
                var details = home ? result : result.compactVideoRenderer;
                if (details) {
                    try {
                        var viewCount = details.viewCountText.simpleText;
                        viewCount = (/^\d/.test(viewCount) ? viewCount : "0").split(" ")[0];
                        results.push(new Video_1.default({
                            id: details.videoId,
                            title: (_b = details.title.simpleText) !== null && _b !== void 0 ? _b : (_c = details.title.runs[0]) === null || _c === void 0 ? void 0 : _c.text,
                            views: parseInt(viewCount.replace(/,/g, "")) || 0,
                            duration_raw: (_d = details.lengthText.simpleText) !== null && _d !== void 0 ? _d : details.lengthText.accessibility.accessibilityData.label,
                            duration: Util.parseDuration(details.lengthText.simpleText) / 1000,
                            channel: {
                                name: details.shortBylineText.runs[0].text,
                                id: details.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.browseId,
                                url: "https://www.youtube.com" + details.shortBylineText.runs[0].navigationEndpoint.browseEndpoint.canonicalBaseUrl,
                                icon: home ? details.channelThumbnailSupportedRenderers.channelThumbnailWithLinkRenderer.thumbnail.thumbnails[0] : details.channelThumbnail.thumbnails[0],
                                subscribers: "0",
                                verified: Boolean(details.ownerBadges[0].metadataBadgeRenderer.tooltip === "Verified")
                            },
                            thumbnail: __assign(__assign({}, details.thumbnail.thumbnails[details.thumbnail.thumbnails.length - 1]), { id: details.videoId }),
                            uploadedAt: details.publishedTimeText.simpleText,
                            ratings: {
                                likes: 0,
                                dislikes: 0
                            },
                            description: (_f = (_e = details.descriptionSnippet) === null || _e === void 0 ? void 0 : _e.runs[0]) === null || _f === void 0 ? void 0 : _f.text
                        }));
                    }
                    catch (_g) {
                        continue;
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (body_1_1 && !body_1_1.done && (_a = body_1.return)) _a.call(body_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return results;
    };
    Util.parseHomepage = function (html) {
        var contents;
        try {
            contents = html.split("var ytInitialData = ")[1].split(";</script>")[0];
            contents = JSON.parse(contents).contents.twoColumnBrowseResultsRenderer.tabs[0].tabRenderer.content.richGridRenderer.contents;
        }
        catch (_a) {
            return [];
        }
        if (!contents || !contents.length || !contents.find(function (x) { return Object.keys(x)[0] === "richItemRenderer"; }))
            return [];
        contents = contents.filter(function (a) { return Object.keys(a)[0] === "richItemRenderer"; }).map(function (m) { return m.richItemRenderer.content.videoRenderer; });
        return Util.getNext(contents, true);
    };
    Util.getPlaylistURL = function (url) {
        if (typeof url !== "string")
            return null;
        var group = PLAYLIST_ID.exec(url);
        if (!group)
            return null;
        var finalURL = "https://www.youtube.com/playlist?list=" + group[0];
        return finalURL;
    };
    Util.validatePlaylist = function (url) {
        if (typeof url === "string" && url.match(PLAYLIST_ID) !== null)
            return;
        throw new Error("Invalid playlist url");
    };
    Util.filter = function (ftype) {
        switch (ftype) {
            case "playlist":
                return "EgIQAw%253D%253D";
            case "video":
                return "EgIQAQ%253D%253D";
            case "channel":
                return "EgIQAg%253D%253D";
            default:
                throw new TypeError("Invalid filter type \"" + ftype + "\"!");
        }
    };
    Util.parseMS = function (milliseconds) {
        var roundTowardsZero = milliseconds > 0 ? Math.floor : Math.ceil;
        return {
            days: roundTowardsZero(milliseconds / 86400000),
            hours: roundTowardsZero(milliseconds / 3600000) % 24,
            minutes: roundTowardsZero(milliseconds / 60000) % 60,
            seconds: roundTowardsZero(milliseconds / 1000) % 60
        };
    };
    Util.durationString = function (data) {
        var items = Object.keys(data);
        var required = ["days", "hours", "minutes", "seconds"];
        var parsed = items.filter(function (x) { return required.includes(x); }).map(function (m) { return (data[m] > 0 ? data[m] : ""); });
        var final = parsed
            .filter(function (x) { return !!x; })
            .map(function (x) { return x.toString().padStart(2, "0"); })
            .join(":");
        return final.length <= 3 ? "0:" + (final.padStart(2, "0") || 0) : final;
    };
    Util.json = function (data) {
        try {
            return JSON.parse(data);
        }
        catch (_a) {
            return null;
        }
    };
    return Util;
}());
exports.default = Util;
