"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Thumbnail = (function () {
    function Thumbnail(data) {
        if (!data)
            throw new Error("Cannot instantiate the " + this.constructor.name + " class without data!");
        this._patch(data);
    }
    Thumbnail.prototype._patch = function (data) {
        if (!data)
            data = {};
        this.id = data.id || null;
        this.width = data.width || 0;
        this.height = data.height || 0;
        this.url = data.url || null;
    };
    Thumbnail.prototype.displayThumbnailURL = function (thumbnailType) {
        if (thumbnailType === void 0) { thumbnailType = "ultrares"; }
        if (!["default", "hqdefault", "mqdefault", "sddefault", "maxresdefault", "ultrares"].includes(thumbnailType))
            throw new Error("Invalid thumbnail type \"" + thumbnailType + "\"!");
        if (thumbnailType === "ultrares")
            return this.url;
        return "https://i3.ytimg.com/vi/" + this.id + "/" + thumbnailType + ".jpg";
    };
    Thumbnail.prototype.defaultThumbnailURL = function (id) {
        if (!id)
            id = "0";
        if (!["0", "1", "2", "3", "4"].includes(id))
            throw new Error("Invalid thumbnail id \"" + id + "\"!");
        return "https://i3.ytimg.com/vi/" + this.id + "/" + id + ".jpg";
    };
    Thumbnail.prototype.toString = function () {
        return this.url ? "" + this.url : "";
    };
    Thumbnail.prototype.toJSON = function () {
        return {
            id: this.id,
            width: this.width,
            height: this.height,
            url: this.url
        };
    };
    return Thumbnail;
}());
exports.default = Thumbnail;
