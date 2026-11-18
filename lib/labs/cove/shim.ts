/**
 * A stand-in for the WebSocket the game opens to /cove. Vercel has no room server to answer that socket, so this
 * script, placed by app/walk/route.ts before the game's own script, gives the game an object with the same surface
 * (readyState and its constants, on* handlers and addEventListener, send, close, bufferedAmount) that talks to
 * POST /api/cove instead. Every other URL still gets the browser's real WebSocket.
 *
 * send() keeps the latest duck state and queues print orders. A loop posts every TICK_MS while the tab is visible
 * and every HIDDEN_MS while it is hidden, one request in flight at a time, and hands each answer to the game as a
 * message event shaped like the room server's broadcast {self, ducks, clock, porch}; a refused print arrives first
 * as its own {printDenied, reason} message, as the room server sends it. An unknown token (the visitor timed out)
 * or repeated failures close the socket, and the game's own reconnect joins again.
 *
 * The game smooths remote ducks toward each update (pos.lerp with 1 - exp(-12 dt)), which settles in about 0.25 s,
 * so 150 ms keeps walking ducks moving rather than stepping. Kept as plain ES2017 so it runs as written.
 */
const TICK_MS = 150;
const HIDDEN_MS = 1000;

export const COVE_SHIM = `(function () {
  var Real = window.WebSocket;
  if (!Real || !window.fetch) return;
  var API = "/api/cove", TICK_MS = ${TICK_MS}, HIDDEN_MS = ${HIDDEN_MS};
  var token = null, live = [];

  function isCove(url) {
    try { var u = new URL(String(url), location.href); return u.host === location.host && u.pathname === "/cove"; }
    catch (e) { return false; }
  }
  function post(body, keepalive) {
    return fetch(API, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
      credentials: "same-origin", cache: "no-store", keepalive: !!keepalive });
  }

  function CoveSocket(url) {
    this.url = String(url); this.readyState = 0; this.bufferedAmount = 0; this.protocol = ""; this.extensions = "";
    this.binaryType = "blob"; this.onopen = null; this.onmessage = null; this.onclose = null; this.onerror = null;
    this._on = {}; this._state = null; this._dirty = false; this._prints = []; this._timer = 0; this._fails = 0;
    var self = this;
    live.push(this);
    setTimeout(function () { self._join(); }, 0);
  }
  var P = CoveSocket.prototype;
  ["CONNECTING", "OPEN", "CLOSING", "CLOSED"].forEach(function (name, i) { CoveSocket[name] = i; P[name] = i; });
  P.addEventListener = function (type, fn) { (this._on[type] = this._on[type] || []).push(fn); };
  P.removeEventListener = function (type, fn) { var l = this._on[type] || []; var i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); };
  P.dispatchEvent = function (event) { this._emit(event.type, event); return true; };
  P._emit = function (type, event) {
    var handler = this["on" + type];
    try { if (typeof handler === "function") handler.call(this, event); } catch (e) { setTimeout(function () { throw e; }); }
    var list = (this._on[type] || []).slice();
    for (var i = 0; i < list.length; i++) {
      try { typeof list[i] === "function" ? list[i].call(this, event) : list[i].handleEvent(event); }
      catch (e) { setTimeout(function () { throw e; }); }
    }
  };
  P._deliver = function (message) {
    this._emit("message", new MessageEvent("message", { data: JSON.stringify(message), origin: location.origin }));
  };

  P._join = function () {
    var self = this;
    if (self.readyState !== 0) return;
    if (token) { self._open(); return; }
    post({ join: true }).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); }).then(function (d) {
      if (self.readyState !== 0) return;
      token = d.token;
      self._open();
    }).catch(function () { self._finish(1006); });
  };
  // A slow network can leave a visitor unheard for the server's six seconds. Rather than close the socket, which
  // makes the game drop every other duck and show "reconnecting", take a new token and carry on.
  P._rejoin = function () {
    var self = this;
    post({ join: true }).then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); }).then(function (d) {
      if (self.readyState !== 1) return;
      token = d.token;
      self._schedule(0);
    }).catch(function () { if (self.readyState === 1) self._finish(1006); });
  };
  P._open = function () {
    this.readyState = 1;
    this._emit("open", new Event("open"));
    this._schedule(0);
  };
  P._schedule = function (delay) {
    var self = this;
    clearTimeout(self._timer);
    if (self.readyState === 1) self._timer = setTimeout(function () { self._tick(); }, delay);
  };
  P._tick = function () {
    var self = this;
    if (self.readyState !== 1) return;
    // The page came back from the back-forward cache, or the server dropped this visitor: join again quietly.
    if (!token) { self._rejoin(); return; }
    var started = Date.now(), body = { t: token }, sentState = self._dirty, print = self._prints.shift();
    if (sentState) { body.s = self._state; self._dirty = false; }
    if (print) body.p = print;
    var next = function () {
      var wait = document.visibilityState === "hidden" ? HIDDEN_MS : TICK_MS;
      self._schedule(Math.max(0, wait - (Date.now() - started)));
    };
    var retry = function () {
      if (sentState && !self._dirty) self._dirty = true;
      if (print) self._prints.unshift(print);
    };
    post(body).then(function (r) {
      if (self.readyState !== 1) return;
      if (r.status === 404) { token = null; self._finish(1000); return; }
      if (r.status === 401) { token = null; retry(); self._dirty = self._state !== null; self._rejoin(); return; }
      if (r.status === 429) { retry(); next(); return; }
      if (r.status === 400) { next(); return; }
      if (!r.ok) throw r.status;
      return r.json().then(function (room) {
        if (self.readyState !== 1) return;
        self._fails = 0;
        if (room.denied) self._deliver({ printDenied: room.denied.printDenied, reason: room.denied.reason });
        self._deliver({ self: room.self, ducks: room.ducks, clock: room.clock, porch: room.porch });
        next();
      });
    }).catch(function () {
      if (self.readyState !== 1) return;
      retry();
      if (++self._fails >= 4) { self._emit("error", new Event("error")); self._finish(1006); return; }
      next();
    });
  };
  P.send = function (data) {
    if (this.readyState === 0) throw new DOMException("Still in CONNECTING state.", "InvalidStateError");
    if (this.readyState !== 1 || typeof data !== "string" || data.length > 512) return;
    var message;
    try { message = JSON.parse(data); } catch (e) { return; }
    if (!message || typeof message !== "object") return;
    if (message.type === "print") {
      if (this._prints.length < 4) this._prints.push({ id: message.id, design: message.design });
      this._schedule(0);
      return;
    }
    var first = this._state === null;
    this._state = message; this._dirty = true;
    if (first) this._schedule(0);
  };
  P.close = function () {
    if (this.readyState >= 2) return;
    this.readyState = 2;
    if (token) { post({ t: token, leave: true }, true).catch(function () {}); token = null; }
    this._finish(1000);
  };
  P._finish = function (code) {
    clearTimeout(this._timer);
    if (this.readyState === 3) return;
    this.readyState = 3;
    var i = live.indexOf(this); if (i >= 0) live.splice(i, 1);
    this._emit("close", new CloseEvent("close", { code: code, wasClean: code === 1000 }));
  };

  // Leave the room at once when the page goes away, instead of after the server's six-second timeout.
  addEventListener("pagehide", function () {
    if (token && live.length) { post({ t: token, leave: true }, true).catch(function () {}); token = null; }
  });

  function WebSocket(url, protocols) {
    if (isCove(url)) return new CoveSocket(url);
    return protocols === undefined ? new Real(url) : new Real(url, protocols);
  }
  WebSocket.prototype = Real.prototype;
  ["CONNECTING", "OPEN", "CLOSING", "CLOSED"].forEach(function (name, i) { WebSocket[name] = i; });
  window.WebSocket = WebSocket;
})();`;
