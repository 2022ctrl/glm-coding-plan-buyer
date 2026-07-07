// ==UserScript==
// @name         GLM Coding Smart Buyer
// @namespace    local.codex.bigmodel
// @version      4.3.3
// @description  Human-in-loop watcher for BigModel GLM Coding plans. Can click buy/subscribe, but CAPTCHA/payment stay manual.
// @match        https://bigmodel.cn/glm-coding*
// @match        https://www.bigmodel.cn/glm-coding*
// @grant        GM_notification
// @run-at       document-idle
// ==/UserScript==

(function () {
  'use strict';

  const isTargetPage = /(^|\.)bigmodel\.cn$/i.test(location.hostname) &&
    location.pathname.startsWith('/glm-coding');
  if (!isTargetPage) return;

  const CONFIG_KEY = 'glm-smart-buyer-config-v4';
  const LOG_KEY = 'glm-smart-buyer-logs-v4';
  const CLICK_LOCK_KEY = 'glm-smart-buyer-clicked-at-v4';
  const SERVER_SYNC_KEY = 'glm-smart-buyer-server-sync-v4';
  const HEARTBEAT_KEY = 'glm-smart-buyer-heartbeats-v4';
  const PANEL_ID = 'glm-smart-buyer-panel';
  const VERSION = '4.3.3';
  const MULTI_TAB_COUNT = 5;
  const TAB_ID = getTabId();

  const TEXT = {
    title: 'GLM \u62a2\u8d2d\u52a9\u624b v4.3.3',
    start: '\u5f00\u59cb\u76d1\u63a7',
    stop: '\u505c\u6b62\u76d1\u63a7',
    rushStart: '\u5f00\u542f\u51b2\u523a\u5237\u65b0',
    rushStop: '\u5173\u95ed\u51b2\u523a\u5237\u65b0',
    manualRefresh: '\u624b\u52a8\u5237\u65b0',
    calibrate: '\u6821\u51c6\u65f6\u95f4',
    multiOpen: '\u4e00\u952e\u591a\u5f00 5 \u9875',
    tabLabel: '\u9875\u9762',
    locked: '\u5176\u5b83\u9875\u9762\u5df2\u8fdb\u5165\u4e0b\u5355\uff0c\u672c\u9875\u5df2\u505c\u6b62',
    targetPackage: '\u76ee\u6807\u5957\u9910',
    targetPeriod: '\u8ba2\u9605\u5468\u671f',
    autoClick: '\u81ea\u52a8\u70b9\u8ba2\u9605',
    autoPopup: '\u81ea\u52a8\u5173\u95ed\u5e38\u89c1\u5f39\u7a97',
    sound: '\u58f0\u97f3\u63d0\u793a',
    syncServerTime: '\u670d\u52a1\u5668\u6821\u65f6',
    notify: '\u901a\u77e5\u63d0\u793a',
    status: '\u72b6\u6001',
    diag: '\u8bca\u65ad',
    nextRefresh: '\u4e0b\u6b21\u5237\u65b0',
    log: '\u65e5\u5fd7',
    clearLog: '\u6e05\u7a7a',
    waitCards: '\u7b49\u5f85\u5957\u9910\u5361\u7247\u52a0\u8f7d',
    watching: '\u76d1\u63a7\u4e2d',
    stopped: '\u5df2\u505c\u6b62',
    selecting: '\u5207\u6362\u76ee\u6807\u9009\u9879\u4e2d',
    noTarget: '\u672a\u627e\u5230\u76ee\u6807\u5957\u9910\u5361\u7247',
    unavailable: '\u76ee\u6807\u6682\u4e0d\u53ef\u8d2d',
    crowded: '\u62a2\u8d2d\u4eba\u6570\u8fc7\u591a\uff0c\u7b49\u5f85\u4e0b\u6b21\u5237\u65b0',
    available: '\u53d1\u73b0\u53ef\u8d2d\u6309\u94ae',
    clicked: '\u5df2\u70b9\u51fb\uff0c\u8bf7\u624b\u52a8\u5b8c\u6210\u9a8c\u8bc1\u7801\u548c\u4ed8\u6b3e',
    rushWindow: '\u51b2\u523a\u7a97\u53e3 09:59:50-10:20',
    soldOutWaiting: '\u552e\u7f44/\u672a\u5f00\u552e\uff0c10:00\u524d\u7ee7\u7eed\u76d1\u63a7',
    soldOutSameDay: '\u552e\u7f44\uff0c\u4ecd\u662f\u4eca\u65e5\u8865\u8d27\uff0c\u7ee7\u7eed\u76d1\u63a7',
    soldOutStopped: '\u68c0\u6d4b\u5230\u4e0b\u6b21\u8865\u8d27\u65e5\uff0c\u5df2\u505c\u6b62',
    personal: '\u4e2a\u4eba\u5957\u9910',
    month: '\u8fde\u7eed\u5305\u6708',
    quarter: '\u8fde\u7eed\u5305\u5b63',
    year: '\u8fde\u7eed\u5305\u5e74',
    healthOk: '\u9875\u9762\u6b63\u5e38',
    healthLoading: '\u7b49\u5f85\u9875\u9762\u52a0\u8f7d',
    healthStale: '\u9875\u9762\u7591\u4f3c\u5361\u4f4f',
    serverTime: '\u670d\u52a1\u5668\u65f6\u95f4',
    countdown: '\u8ddd 10:00',
    latency: '\u5ef6\u8fdf',
    offset: '\u504f\u79fb',
    onlineTabs: '\u5728\u7ebf\u9875',
    syncOk: '\u6821\u65f6\u5b8c\u6210',
    syncFail: '\u6821\u65f6\u5931\u8d25',
    pageReload: '\u9875\u9762\u5065\u5eb7\u5237\u65b0',
    rushReload: '\u51b2\u523a\u5237\u65b0'
  };

  const DEFAULT_CONFIG = {
    enabled: false,
    rush: false,
    autoClick: true,
    autoPopup: true,
    sound: true,
    notify: true,
    syncServerTime: true,
    packages: ['Pro'],
    periods: ['quarter'],
    configVersion: 2,
    rushStart: '09:59:50',
    rushEnd: '10:20',
    targetTime: '10:00:00',
    scanMs: 240
  };

  const PACKAGE_ORDER = ['Pro', 'Max', 'Lite'];
  const PERIOD_ORDER = ['quarter', 'month', 'year'];
  const PERIOD_TEXT = { month: TEXT.month, quarter: TEXT.quarter, year: TEXT.year };
  const SOLD_OUT_TEXT = /(\u552e\u7f44|\u5df2\u552e\u5b8c|\u6682\u65e0\u5e93\u5b58|\u6682\u65f6\u552e\u7f44)/;
  const NEGATIVE_TEXT = /(\u4e0d\u53ef\u8d2d\u4e70|\u656c\u8bf7\u671f\u5f85|\u5373\u5c06\u5f00\u653e|\u5df2\u7ed3\u675f|\u672a\u5f00\u552e|\u6682\u672a\u5f00\u552e)/;
  const CROWD_TEXT = /(\u62a2\u8d2d\u4eba\u6570\u8fc7\u591a|\u5237\u65b0\u518d\u8bd5|\u4eba\u6570\u8fc7\u591a|\u7a0d\u540e\u518d\u8bd5)/;

  let cfg = loadConfig();
  let serverSync = loadServerSync();
  let scanTimer;
  let reloadTimer;
  let nextReloadAt = 0;
  let observer;
  let queuedScan = false;
  let lastStatus = TEXT.stopped;
  let lastDiag = '-';
  let lastHealth = TEXT.healthOk;
  let lastScanAt = 0;
  let cardMissCount = 0;
  let calibrationInFlight = false;

  console.info('[GLM Smart Buyer] userscript ' + VERSION + ' injected', location.href);

  function getTabId() {
    const params = new URLSearchParams(location.search);
    const fromUrl = Number(params.get('glmBuyerTab'));
    const fromSession = Number(sessionStorage.getItem('glm-smart-buyer-tab-id') || 0);
    const id = fromUrl || fromSession || 1;
    sessionStorage.setItem('glm-smart-buyer-tab-id', String(id));
    return Math.max(1, Math.min(99, id));
  }

  function migrateConfig(config) {
    const next = { ...config };
    if (next.rushStart === '09:55') next.rushStart = DEFAULT_CONFIG.rushStart;
    if (!next.configVersion || next.configVersion < 2) {
      next.configVersion = 2;
    }
    return next;
  }
  function loadConfig() {
    try {
      const config = migrateConfig({ ...DEFAULT_CONFIG, ...(JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}')) });
      localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
      return config;
    }
    catch (_) { return migrateConfig({ ...DEFAULT_CONFIG }); }
  }
  function saveConfig() { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg)); }
  function loadServerSync() {
    try { return { offsetMs: 0, latencyMs: 0, updatedAt: 0, error: '', ...(JSON.parse(localStorage.getItem(SERVER_SYNC_KEY) || '{}')) }; }
    catch (_) { return { offsetMs: 0, latencyMs: 0, updatedAt: 0, error: '' }; }
  }
  function saveServerSync() { localStorage.setItem(SERVER_SYNC_KEY, JSON.stringify(serverSync)); }
  function normalize(text) { return String(text || '').replace(/\s+/g, ' ').trim(); }
  function escapeHtml(text) { return String(text || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]); }
  function addLog(message) {
    const time = new Date().toTimeString().slice(0, 8);
    let logs = [];
    try { logs = JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); } catch (_) {}
    logs.unshift(time + ' ' + message);
    localStorage.setItem(LOG_KEY, JSON.stringify(logs.slice(0, 80)));
    renderPanel();
  }
  function readLogs() { try { return JSON.parse(localStorage.getItem(LOG_KEY) || '[]'); } catch (_) { return []; } }
  function sleep(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
  function isVisible(element) {
    if (!element) return false;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  }
  function isEnabled(element) {
    return Boolean(element) && !element.disabled && element.getAttribute('aria-disabled') !== 'true' && !element.classList.contains('disabled') && !element.classList.contains('is-disabled');
  }
  function describeButton(button) {
    if (!button) return 'button=null';
    return ['text=' + (normalize(button.textContent) || '(empty)'), 'disabled=' + Boolean(button.disabled), 'aria=' + (button.getAttribute('aria-disabled') || 'null'), 'enabled=' + isEnabled(button), 'visible=' + isVisible(button), 'class=' + (button.className || '(none)')].join(' | ');
  }
  function secondsOfDay(timeText) {
    const match = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(timeText || '');
    return match ? Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3] || 0) : 0;
  }
  function chinaParts(ms) {
    const parts = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).formatToParts(new Date(ms)).forEach((part) => { if (part.type !== 'literal') parts[part.type] = Number(part.value); });
    if (parts.hour === 24) parts.hour = 0;
    return parts;
  }
  function serverNowMs() { return Date.now() + (cfg.syncServerTime ? Number(serverSync.offsetMs || 0) : 0); }
  function nowChinaSeconds() {
    const parts = chinaParts(serverNowMs());
    return parts.hour * 3600 + parts.minute * 60 + parts.second;
  }
  function targetTodayMs() {
    const parts = chinaParts(serverNowMs());
    const target = secondsOfDay(cfg.targetTime || DEFAULT_CONFIG.targetTime);
    const hour = Math.floor(target / 3600);
    const minute = Math.floor((target % 3600) / 60);
    const second = target % 60;
    return Date.UTC(parts.year, parts.month - 1, parts.day, hour - 8, minute, second, 0);
  }
  function countdownMs() { return targetTodayMs() - serverNowMs(); }
  function chinaDayStartMs(ms) {
    const parts = chinaParts(ms);
    return Date.UTC(parts.year, parts.month - 1, parts.day, -8, 0, 0, 0);
  }
  function restockDayFromText(text) {
    const match = /(\d{1,2})\u6708(\d{1,2})\u65e5\s*10:00\s*\u8865\u8d27/.exec(text || '');
    if (!match) return null;
    const nowParts = chinaParts(serverNowMs());
    const month = Number(match[1]);
    const day = Number(match[2]);
    let dayMs = Date.UTC(nowParts.year, month - 1, day, -8, 0, 0, 0);
    const todayMs = chinaDayStartMs(serverNowMs());
    if (dayMs < todayMs - 180 * 86400000) dayMs = Date.UTC(nowParts.year + 1, month - 1, day, -8, 0, 0, 0);
    return { dayMs, text: match[0] };
  }
  function isFutureRestock(target) {
    return Boolean(target && target.restockDayMs && target.restockDayMs > chinaDayStartMs(serverNowMs()));
  }
  function inRushWindow() { const now = nowChinaSeconds(); return now >= secondsOfDay(cfg.rushStart) && now <= secondsOfDay(cfg.rushEnd); }
  function tabOffsetMs() { return ((TAB_ID - 1) % MULTI_TAB_COUNT) * 420; }
  function jitter(min, max) { return min + Math.random() * (max - min); }
  function rushDelayMs() {
    if (!inRushWindow()) return null;
    const delta = countdownMs();
    if (delta > 5 * 60 * 1000) return jitter(5200, 7200) + tabOffsetMs();
    if (delta > 60 * 1000) return jitter(3400, 4800) + tabOffsetMs();
    if (delta > 10 * 1000) return jitter(1800, 2600) + tabOffsetMs();
    if (delta > -2 * 60 * 1000) return jitter(1050, 1650) + tabOffsetMs();
    return jitter(2500, 4200) + tabOffsetMs();
  }
  function formatClock(ms) {
    const p = chinaParts(ms);
    return String(p.hour).padStart(2, '0') + ':' + String(p.minute).padStart(2, '0') + ':' + String(p.second).padStart(2, '0');
  }
  function formatDuration(ms) {
    const sign = ms < 0 ? '+' : '-';
    const abs = Math.abs(ms);
    const min = Math.floor(abs / 60000);
    const sec = Math.floor((abs % 60000) / 1000);
    const dec = Math.floor((abs % 1000) / 100);
    if (min > 0) return sign + min + 'm' + String(sec).padStart(2, '0') + 's';
    return sign + sec + '.' + dec + 's';
  }
  function syncAgeText() {
    if (!serverSync.updatedAt) return '\u672a\u6821\u51c6';
    const age = Math.max(0, Math.round((Date.now() - serverSync.updatedAt) / 1000));
    return age < 60 ? age + 's \u524d' : Math.round(age / 60) + 'm \u524d';
  }
  async function probeServerTime() {
    const url = location.origin + '/glm-coding?glm_probe=' + Date.now();
    const perfStart = performance.now();
    const localStart = Date.now();
    let response;
    try {
      response = await fetch(url, { method: 'HEAD', credentials: 'include', cache: 'no-store' });
    } catch (_) {
      response = await fetch(url, { method: 'GET', credentials: 'include', cache: 'no-store' });
    }
    const perfEnd = performance.now();
    const localEnd = Date.now();
    const dateHeader = response.headers.get('date');
    if (!dateHeader) throw new Error('missing Date header');
    const serverMs = new Date(dateHeader).getTime();
    if (!Number.isFinite(serverMs)) throw new Error('invalid Date header');
    const rttMs = Math.max(0, Math.round(perfEnd - perfStart));
    const localMidMs = (localStart + localEnd) / 2;
    const estimatedServerAtMid = serverMs + rttMs / 2;
    return { latencyMs: rttMs, offsetMs: Math.round(estimatedServerAtMid - localMidMs) };
  }
  async function calibrateServerTime(force) {
    if (!cfg.syncServerTime && !force) return;
    if (calibrationInFlight) return;
    if (!force && serverSync.updatedAt && Date.now() - serverSync.updatedAt < 90000) return;
    calibrationInFlight = true;
    try {
      const probes = [];
      for (let i = 0; i < 3; i += 1) {
        try { probes.push(await probeServerTime()); } catch (_) {}
        if (i < 2) await sleep(250);
      }
      if (!probes.length) throw new Error('all probes failed');
      probes.sort((a, b) => a.latencyMs - b.latencyMs);
      const keep = probes.slice(0, Math.max(1, Math.ceil(probes.length * 0.67)));
      const latencyMs = Math.round(keep.reduce((sum, item) => sum + item.latencyMs, 0) / keep.length);
      const offsetMs = Math.round(keep.reduce((sum, item) => sum + item.offsetMs, 0) / keep.length);
      serverSync = { latencyMs, offsetMs, updatedAt: Date.now(), error: '' };
      saveServerSync();
      addLog(TEXT.syncOk + ': ' + TEXT.latency + ' ' + latencyMs + 'ms, ' + TEXT.offset + ' ' + offsetMs + 'ms');
    } catch (error) {
      serverSync = { ...serverSync, updatedAt: serverSync.updatedAt || 0, error: String(error && error.message || error) };
      saveServerSync();
      addLog(TEXT.syncFail + ': ' + serverSync.error);
    } finally {
      calibrationInFlight = false;
      renderPanel();
    }
  }
  function hasCards() { return document.querySelectorAll('.package-list.glm-coding-package-list .package-card-box').length > 0; }
  function selectedPackages() { const selected = new Set(cfg.packages || []); return PACKAGE_ORDER.filter((name) => selected.has(name)); }
  function selectedPeriods() { const selected = new Set(cfg.periods || []); return PERIOD_ORDER.filter((name) => selected.has(name)); }
  function ensurePersonalTab() {
    const personalTab = Array.from(document.querySelectorAll('.el-tabs__item')).find((element) => normalize(element.textContent) === TEXT.personal);
    if (personalTab && !personalTab.classList.contains('is-active')) { personalTab.click(); return false; }
    return true;
  }
  function activePeriod() {
    const active = Array.from(document.querySelectorAll('.switch-tab-item.active')).find((element) => Object.values(PERIOD_TEXT).some((text) => normalize(element.textContent).startsWith(text)));
    const activeText = normalize(active && active.textContent);
    return PERIOD_ORDER.find((key) => activeText.startsWith(PERIOD_TEXT[key])) || null;
  }
  function clickPeriod(periodKey) {
    const tab = Array.from(document.querySelectorAll('.switch-tab-item')).find((element) => normalize(element.textContent).startsWith(PERIOD_TEXT[periodKey]));
    if (!tab) return false;
    if (!tab.classList.contains('active')) { tab.click(); return false; }
    return true;
  }
  function cardPackage(card) { const text = normalize(card.textContent); return PACKAGE_ORDER.find((name) => text.startsWith(name)) || null; }
  function targetCards() {
    const packages = new Set(selectedPackages());
    return Array.from(document.querySelectorAll('.package-list.glm-coding-package-list .package-card-box')).filter((card) => packages.has(cardPackage(card)));
  }
  function primaryButton(card) { return card.querySelector('button.buy-btn') || Array.from(card.querySelectorAll('button')).find((button) => isVisible(button)); }
  function chooseCandidateCard() {
    const order = selectedPackages();
    const cards = targetCards();
    for (const name of order) { const card = cards.find((candidate) => cardPackage(candidate) === name); if (card) return card; }
    return null;
  }
  function closeNoisePopups() {
    if (!cfg.autoPopup) return;
    const closeTexts = new Set(['\u6211\u77e5\u9053\u4e86', '\u77e5\u9053\u4e86', '\u5173\u95ed']);
    const buttons = Array.from(document.querySelectorAll('button, .el-dialog__close, [aria-label="Close"]'));
    for (const button of buttons) {
      const text = normalize(button.textContent);
      const cls = String(button.className || '');
      if ((closeTexts.has(text) || cls.includes('el-dialog__close')) && isVisible(button)) { button.click(); addLog('\u5df2\u5173\u95ed\u5f39\u7a97'); return; }
    }
  }
  function currentTargetState() {
    if (!ensurePersonalTab()) return { state: 'selecting', diag: TEXT.selecting };
    const periods = selectedPeriods();
    if (periods.length === 0 || selectedPackages().length === 0) return { state: 'empty-config', diag: '\u8bf7\u81f3\u5c11\u9009\u4e00\u4e2a\u5957\u9910\u548c\u5468\u671f' };
    const active = activePeriod();
    const targetPeriod = periods.includes(active) ? active : periods[0];
    if (!clickPeriod(targetPeriod)) return { state: 'selecting', diag: TEXT.selecting + ': ' + PERIOD_TEXT[targetPeriod] };
    const card = chooseCandidateCard();
    if (!card) return { state: 'missing', diag: TEXT.noTarget };
    const cardText = normalize(card.textContent);
    const button = primaryButton(card);
    const buttonText = normalize(button && button.textContent);
    const diag = PERIOD_TEXT[targetPeriod] + ' / ' + cardPackage(card) + ' / ' + describeButton(button);
    if (CROWD_TEXT.test(cardText) || CROWD_TEXT.test(buttonText)) return { state: 'crowded', card, button, diag };
    if (SOLD_OUT_TEXT.test(cardText) || SOLD_OUT_TEXT.test(buttonText)) {
      const restock = restockDayFromText(cardText + ' ' + buttonText);
      return { state: 'soldout', card, button, diag: diag + (restock ? ' | ' + restock.text : ''), restockDayMs: restock && restock.dayMs, restockText: restock && restock.text };
    }
    if (NEGATIVE_TEXT.test(cardText) || NEGATIVE_TEXT.test(buttonText)) return { state: 'blocked', card, button, diag };
    if (!button) return { state: 'no-button', card, diag };
    if (isVisible(button) && isEnabled(button)) return { state: 'available', card, button, diag };
    return { state: 'disabled', card, button, diag };
  }
  function notifyFound() {
    if (cfg.notify) { try { GM_notification({ title: 'GLM Coding Plan', text: TEXT.clicked, timeout: 0 }); } catch (_) {} }
    if (!cfg.sound) return;
    try {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      const audio = new AudioCtor();
      [880, 1100, 1320].forEach((frequency, index) => {
        const osc = audio.createOscillator();
        osc.frequency.value = frequency;
        osc.connect(audio.destination);
        osc.start(audio.currentTime + index * 0.18);
        osc.stop(audio.currentTime + index * 0.18 + 0.15);
      });
    } catch (_) {}
  }
  function readHeartbeats() {
    let data = {};
    try { data = JSON.parse(localStorage.getItem(HEARTBEAT_KEY) || '{}') || {}; } catch (_) { data = {}; }
    const now = Date.now();
    let changed = false;
    for (const key of Object.keys(data)) {
      if (!data[key] || now - Number(data[key].ts || 0) > 45000) { delete data[key]; changed = true; }
    }
    if (changed) localStorage.setItem(HEARTBEAT_KEY, JSON.stringify(data));
    return data;
  }
  function writeHeartbeat() {
    const data = readHeartbeats();
    data[String(TAB_ID)] = { ts: Date.now(), status: lastStatus, health: lastHealth, nextReloadAt, enabled: !!cfg.enabled, rush: !!cfg.rush };
    localStorage.setItem(HEARTBEAT_KEY, JSON.stringify(data));
  }
  function heartbeatSummary() {
    const data = readHeartbeats();
    return Object.keys(data).map(Number).sort((a, b) => a - b).map((id) => {
      const item = data[String(id)] || {};
      const mark = item.enabled ? (item.rush ? 'R' : 'W') : 'S';
      return id + mark;
    }).join(', ') || '-';
  }
  function scan() {
    lastScanAt = Date.now();
    const sharedClickAt = Number(localStorage.getItem(CLICK_LOCK_KEY) || 0);
    if (sharedClickAt && Date.now() - sharedClickAt < 180000) {
      cfg.enabled = false;
      cfg.rush = false;
      saveConfig();
      stopTimers();
      lastStatus = TEXT.locked;
      lastHealth = TEXT.healthOk;
      writeHeartbeat();
      renderPanel();
      return;
    }
    closeNoisePopups();
    if (!hasCards()) {
      cardMissCount += 1;
      lastStatus = TEXT.waitCards;
      lastHealth = cardMissCount >= 3 ? TEXT.healthStale : TEXT.healthLoading;
      lastDiag = 'cards=0, miss=' + cardMissCount;
      scheduleReload(cardMissCount >= 2, TEXT.pageReload);
      writeHeartbeat();
      renderPanel();
      return;
    }
    cardMissCount = 0;
    lastHealth = TEXT.healthOk;
    const target = currentTargetState();
    lastDiag = target.diag || '-';
    if (target.state === 'available') {
      lastStatus = TEXT.available;
      addLog(TEXT.available + ': ' + lastDiag);
      if (cfg.autoClick) {
        const lastClick = Number(localStorage.getItem(CLICK_LOCK_KEY) || 0);
        if (Date.now() - lastClick > 60000) {
          localStorage.setItem(CLICK_LOCK_KEY, String(Date.now()));
          cfg.enabled = false;
          cfg.rush = false;
          saveConfig();
          stopTimers();
          notifyFound();
          target.button.click();
          addLog(TEXT.clicked);
        }
      }
      writeHeartbeat();
      renderPanel();
      return;
    }
    if (target.state === 'soldout') {
      if (countdownMs() <= 0 && isFutureRestock(target)) {
        cfg.enabled = false;
        cfg.rush = false;
        saveConfig();
        stopTimers();
        lastStatus = TEXT.soldOutStopped;
        lastHealth = TEXT.healthOk;
        addLog(TEXT.soldOutStopped + ': ' + (target.restockText || lastDiag));
        writeHeartbeat();
        renderPanel();
        return;
      }
      lastStatus = countdownMs() <= 0 ? TEXT.soldOutSameDay : TEXT.soldOutWaiting;
      scheduleReload(false, TEXT.rushReload);
      writeHeartbeat();
      renderPanel();
      return;
    }
    if (target.state === 'crowded') lastStatus = TEXT.crowded;
    else if (target.state === 'selecting') lastStatus = TEXT.selecting;
    else lastStatus = TEXT.unavailable;
    scheduleReload(false, TEXT.rushReload);
    writeHeartbeat();
    renderPanel();
  }
  function queueScan() { if (queuedScan) return; queuedScan = true; setTimeout(() => { queuedScan = false; if (cfg.enabled) scan(); }, 30); }
  function scheduleReload(allowNoCards, reason) {
    if (!cfg.enabled || !cfg.rush) return;
    if (reloadTimer) return;
    const delay = rushDelayMs();
    if (delay === null) { nextReloadAt = 0; return; }
    if (!allowNoCards && !hasCards()) return;
    nextReloadAt = Date.now() + delay;
    reloadTimer = setTimeout(() => {
      reloadTimer = undefined;
      nextReloadAt = 0;
      if (!cfg.enabled || !cfg.rush) return;
      if (!allowNoCards && !hasCards()) return;
      addLog(reason || TEXT.rushReload);
      location.reload();
    }, delay);
  }
  function startTimers() {
    if (scanTimer) return;
    cfg.enabled = true; saveConfig(); addLog('\u76d1\u63a7\u5df2\u542f\u52a8'); scan();
    scanTimer = setInterval(scan, cfg.scanMs || DEFAULT_CONFIG.scanMs);
    observer = new MutationObserver(queueScan);
    observer.observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'disabled', 'aria-disabled'] });
  }
  function stopTimers() { clearInterval(scanTimer); clearTimeout(reloadTimer); if (observer) observer.disconnect(); scanTimer = undefined; reloadTimer = undefined; nextReloadAt = 0; observer = undefined; writeHeartbeat(); }
  function setEnabled(enabled) {
    if (enabled) startTimers();
    else { cfg.enabled = false; cfg.rush = false; saveConfig(); stopTimers(); lastStatus = TEXT.stopped; addLog('\u76d1\u63a7\u5df2\u505c\u6b62'); renderPanel(); }
  }
  function openMultiTabs() {
    cfg.enabled = true;
    cfg.rush = true;
    saveConfig();
    sessionStorage.setItem('glm-smart-buyer-tab-id', '1');
    if (!scanTimer) startTimers();

    const opened = [];
    for (let i = 2; i <= MULTI_TAB_COUNT; i += 1) {
      const child = window.open('about:blank', '_blank');
      if (child) opened.push({ child, i });
    }

    addLog('\u591a\u5f00\u6a21\u5f0f\u5df2\u542f\u52a8: ' + (opened.length + 1) + '/' + MULTI_TAB_COUNT);
    if (opened.length < MULTI_TAB_COUNT - 1) {
      addLog('\u6d4f\u89c8\u5668\u62e6\u622a\u4e86\u90e8\u5206\u5f39\u7a97\uff0c\u8bf7\u5141\u8bb8\u5f39\u7a97\u540e\u518d\u70b9\u4e00\u6b21');
    }

    opened.forEach(({ child, i }, index) => {
      const url = new URL(location.href);
      url.searchParams.set('plantype', 'personal');
      url.searchParams.set('glmBuyerTab', String(i));
      url.searchParams.set('glmBuyerMulti', '1');
      setTimeout(() => {
        try {
          child.location.href = url.href;
        } catch (_) {
          window.open(url.href, '_blank');
        }
      }, 120 + index * 180);
    });
    renderPanel();
  }

  function setRush(enabled) {
    cfg.rush = enabled;
    if (enabled) cfg.enabled = true;
    saveConfig();
    if (enabled && !scanTimer) startTimers();
    if (!enabled) { clearTimeout(reloadTimer); reloadTimer = undefined; nextReloadAt = 0; }
    addLog(enabled ? '\u51b2\u523a\u5237\u65b0\u5df2\u5f00\u542f' : '\u51b2\u523a\u5237\u65b0\u5df2\u5173\u95ed');
    scheduleReload(false, TEXT.rushReload); writeHeartbeat(); renderPanel();
  }
  function toggleListValue(key, value) {
    const set = new Set(cfg[key] || []);
    if (set.has(value)) set.delete(value); else set.add(value);
    cfg[key] = (key === 'packages' ? PACKAGE_ORDER : PERIOD_ORDER).filter((item) => set.has(item));
    saveConfig(); renderPanel(); if (cfg.enabled) queueScan();
  }
  function checked(list, value) { return (cfg[list] || []).includes(value) ? 'checked' : ''; }
  function checkbox(id, label, checkedValue) {
    const list = id === 'toggle-package' ? 'packages' : 'periods';
    return '<label style="margin-right:8px;white-space:nowrap"><input type="checkbox" data-action="' + id + '" data-value="' + checkedValue + '" ' + checked(list, checkedValue) + '> ' + label + '</label>';
  }
  function renderPanel() {
    const parent = document.body || document.documentElement;
    if (!parent) return;
    let panel = document.getElementById(PANEL_ID);
    if (!panel) {
      panel = document.createElement('div');
      panel.id = PANEL_ID;
      panel.style.cssText = [
        'position:fixed!important', 'left:18px!important', 'top:88px!important', 'right:auto!important', 'bottom:auto!important', 'z-index:2147483647!important',
        'width:360px', 'padding:14px', 'border-radius:12px', 'background:#111827', 'color:#f9fafb', 'font:14px/1.5 system-ui,sans-serif',
        'box-shadow:0 8px 28px rgba(0,0,0,.35)', 'border:2px solid #8b5cf6', 'display:block!important', 'visibility:visible!important', 'opacity:1!important', 'pointer-events:auto!important'
      ].join(';');
      parent.appendChild(panel);
    }
    if (panel.dataset.bound !== '1') {
      panel.dataset.bound = '1';
      panel.addEventListener('click', (event) => {
        const target = event.target;
        const button = target.closest('button');
        if (button) {
          event.preventDefault(); event.stopPropagation();
          const action = button.dataset.action;
          if (action === 'toggle-enabled') setEnabled(!cfg.enabled);
          else if (action === 'toggle-rush') setRush(!cfg.rush);
          else if (action === 'refresh') location.reload();
          else if (action === 'multi-open') openMultiTabs();
          else if (action === 'calibrate') calibrateServerTime(true);
          else if (action === 'clear-log') { localStorage.setItem(LOG_KEY, '[]'); renderPanel(); }
          return;
        }
        if (target.matches('input[type="checkbox"]')) {
          const action = target.dataset.action;
          const value = target.dataset.value;
          if (action === 'toggle-package') toggleListValue('packages', value);
          else if (action === 'toggle-period') toggleListValue('periods', value);
          else if (action === 'toggle-option') { cfg[value] = target.checked; saveConfig(); if (value === 'syncServerTime' && target.checked) calibrateServerTime(true); renderPanel(); }
        }
      });
    }
    const next = nextReloadAt > Date.now() ? Math.ceil((nextReloadAt - Date.now()) / 1000) + 's' : '-';
    const countdown = formatDuration(countdownMs());
    const syncLine = TEXT.serverTime + ': ' + formatClock(serverNowMs()) + ' / ' + TEXT.latency + ': ' + Number(serverSync.latencyMs || 0) + 'ms / ' + TEXT.offset + ': ' + Number(serverSync.offsetMs || 0) + 'ms / ' + syncAgeText();
    const logs = readLogs().slice(0, 8).map((line) => '<div>' + escapeHtml(line) + '</div>').join('') || '<div>-</div>';
    const html = `
      <div style="font-weight:800;font-size:16px;margin-bottom:8px">${TEXT.title}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <button data-action="toggle-enabled" style="padding:8px;border:0;border-radius:8px;background:${cfg.enabled ? '#dc2626' : '#16a34a'};color:white;cursor:pointer">${cfg.enabled ? TEXT.stop : TEXT.start}</button>
        <button data-action="toggle-rush" style="padding:8px;border:0;border-radius:8px;background:${cfg.rush ? '#f97316' : '#7c3aed'};color:white;cursor:pointer">${cfg.rush ? TEXT.rushStop : TEXT.rushStart}</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
        <button data-action="refresh" style="padding:7px;border:0;border-radius:8px;background:#2563eb;color:white;cursor:pointer">${TEXT.manualRefresh}</button>
        <button data-action="multi-open" style="padding:7px;border:0;border-radius:8px;background:#0891b2;color:white;cursor:pointer">${TEXT.multiOpen}</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr;gap:8px;margin-bottom:10px">
        <button data-action="calibrate" style="padding:7px;border:0;border-radius:8px;background:#4f46e5;color:white;cursor:pointer">${calibrationInFlight ? TEXT.calibrate + '...' : TEXT.calibrate}</button>
      </div>
      <div style="color:#d1d5db;margin-bottom:6px">${TEXT.status}\uff1a${escapeHtml(lastStatus)}</div>
      <div style="color:#86efac;margin-bottom:6px">\u9875\u9762\u5065\u5eb7\uff1a${escapeHtml(lastHealth)}</div>
      <div style="color:#a78bfa;margin-bottom:6px">${TEXT.tabLabel}\uff1a${TAB_ID}/${MULTI_TAB_COUNT} / ${TEXT.onlineTabs}\uff1a${escapeHtml(heartbeatSummary())}</div>
      <div style="color:#fbbf24;margin-bottom:6px">${TEXT.countdown}\uff1a${countdown} / ${TEXT.nextRefresh}\uff1a${next} / ${TEXT.rushWindow}</div>
      <div style="color:#93c5fd;font-size:12px;word-break:break-all;margin-bottom:6px">${escapeHtml(syncLine)}</div>
      <div style="color:#93c5fd;font-size:12px;word-break:break-all;margin-bottom:10px">${TEXT.diag}\uff1a${escapeHtml(lastDiag)}</div>
      <div style="border-top:1px solid #374151;padding-top:8px;margin-top:8px">
        <div style="margin-bottom:5px;color:#e5e7eb">${TEXT.targetPackage}</div>
        <div style="margin-bottom:8px">${checkbox('toggle-package', 'Pro', 'Pro')}${checkbox('toggle-package', 'Max', 'Max')}${checkbox('toggle-package', 'Lite', 'Lite')}</div>
        <div style="margin-bottom:5px;color:#e5e7eb">${TEXT.targetPeriod}</div>
        <div style="margin-bottom:8px">${checkbox('toggle-period', TEXT.quarter, 'quarter')}${checkbox('toggle-period', TEXT.month, 'month')}${checkbox('toggle-period', TEXT.year, 'year')}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;color:#d1d5db;font-size:12px">
          <label><input type="checkbox" data-action="toggle-option" data-value="autoClick" ${cfg.autoClick ? 'checked' : ''}> ${TEXT.autoClick}</label>
          <label><input type="checkbox" data-action="toggle-option" data-value="autoPopup" ${cfg.autoPopup ? 'checked' : ''}> ${TEXT.autoPopup}</label>
          <label><input type="checkbox" data-action="toggle-option" data-value="notify" ${cfg.notify ? 'checked' : ''}> ${TEXT.notify}</label>
          <label><input type="checkbox" data-action="toggle-option" data-value="sound" ${cfg.sound ? 'checked' : ''}> ${TEXT.sound}</label>
          <label style="grid-column:1 / span 2"><input type="checkbox" data-action="toggle-option" data-value="syncServerTime" ${cfg.syncServerTime ? 'checked' : ''}> ${TEXT.syncServerTime}</label>
        </div>
      </div>
      <div style="border-top:1px solid #374151;padding-top:8px;margin-top:8px">
        <div style="display:flex;justify-content:space-between;color:#e5e7eb;margin-bottom:4px"><span>${TEXT.log}</span><button data-action="clear-log" style="border:0;border-radius:5px;background:#374151;color:white;cursor:pointer">${TEXT.clearLog}</button></div>
        <div style="max-height:96px;overflow:auto;background:#0b1220;border-radius:8px;padding:8px;color:#9ca3af;font-size:12px">${logs}</div>
      </div>
    `;
    if (panel.dataset.lastHtml === html) return;
    panel.innerHTML = html;
    panel.dataset.lastHtml = html;
  }
  function handleStorage(event) {
    if (event.key === CLICK_LOCK_KEY) {
      const at = Number(event.newValue || 0);
      if (at && Date.now() - at < 180000) {
        cfg.enabled = false;
        cfg.rush = false;
        saveConfig();
        stopTimers();
        lastStatus = TEXT.locked;
        renderPanel();
      }
    } else if (event.key === CONFIG_KEY) {
      cfg = loadConfig();
      if (!cfg.enabled) stopTimers();
      else if (!scanTimer) startTimers();
      renderPanel();
    } else if (event.key === SERVER_SYNC_KEY) {
      serverSync = loadServerSync();
      renderPanel();
    } else if (event.key === HEARTBEAT_KEY) {
      renderPanel();
    }
  }

  function initialize() {
    renderPanel();
    window.addEventListener('storage', handleStorage);
    if (cfg.syncServerTime) calibrateServerTime(false);
    setInterval(() => { renderPanel(); }, 1000);
    setInterval(() => { if ((cfg.enabled || cfg.rush) && cfg.syncServerTime) calibrateServerTime(false); }, 30000);
    setInterval(() => { writeHeartbeat(); }, 2500);
    setInterval(() => { if (!document.getElementById(PANEL_ID)) renderPanel(); }, 2000);
    setInterval(() => { if (cfg.enabled && Date.now() - lastScanAt > 1200) renderPanel(); }, 1000);
    writeHeartbeat();
    if (cfg.enabled) startTimers();
  }
  window.addEventListener('beforeunload', () => {
    const data = readHeartbeats();
    delete data[String(TAB_ID)];
    localStorage.setItem(HEARTBEAT_KEY, JSON.stringify(data));
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();
})();
