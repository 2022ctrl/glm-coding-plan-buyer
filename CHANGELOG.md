# Changelog

## 4.3.2

- Start the default rush refresh window at 09:59:50.
- Migrate existing 09:55 rush-start settings to 09:59:50.
- Keep monitoring before 10:00 when the target shows sold-out or unavailable-style text.
- Stop monitoring after 10:00 only when the target card is confirmed sold out.

## 4.3.1

- Fix v4.3.0 runtime initialization failure caused by missing state declarations.
- Add a runtime smoke test path to verify that the userscript can create the panel in a minimal browser-like environment.

## 4.3.0

- Add server-time calibration and show estimated server time, latency, and local offset in the panel.
- Add a 10:00 countdown and adjust rush refresh intervals based on distance to the target time.
- Add page-health detection so missing plan cards can trigger a controlled health refresh.
- Add multi-tab heartbeat status so cooperating tabs are visible in the panel.
- Keep the human-in-loop boundary: no CAPTCHA bypass, payment bypass, queue bypass, or risk-control bypass.

## 4.2.0

- Improve one-click multi-tab opening by opening blank tabs first, then navigating them to the target page.
- Keep 5-tab cooperative refresh and the shared click lock.

## 4.1.0

- Add 5-tab cooperative mode.
- Add a shared click lock to prevent duplicate clicks across tabs.

## 4.0.0

- Rewrite as a configurable buyer assistant.
- Add package priority, billing-period priority, rush refresh, notifications, and log panel.
