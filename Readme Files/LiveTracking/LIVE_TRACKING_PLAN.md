# Live Location Tracking — Final Implementation Plan

## Goal
Integrate **Google Maps** + **Socket.io** + **Browser Geolocation API** into all three MyCampusRide portals for real-time bus tracking with interactive maps. Each portal gets a **dedicated sidebar tab** for tracking. Maps are scroll-safe and fully responsive.

## Decisions Made
| Decision | Choice |
|----------|--------|
| Google Maps API Key | ✅ **Already added** to `frontend/.env` |
| Real-time protocol | **Socket.io** (WebSocket push) |
| Location history trail | ❌ Skip (keep simple for FYP) |
| ETA calculations | ❌ Skip (not needed) |
| Geofencing notifications | ❌ Skip (adds complexity) |
| Campus | **COMSATS Vehari** (30.03204°N, 72.31631°E) |
| Route map editing | ❌ Keep existing form-based management |

## UX Constraints
- **Separate sidebar tab** called "Live Tracking" for each portal — no clutter in existing views
- **Scroll-safe maps**: Disable scroll-wheel zoom on maps so page scroll doesn't interfere. Users must use map controls or Ctrl+Scroll to zoom
- **Responsive**: Maps resize gracefully on mobile/tablet/desktop

---

## Proposed Changes

### Phase 1: Dependencies & Setup

#### [MODIFY] [package.json](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/package.json)
- `npm install @react-google-maps/api socket.io-client`

#### [MODIFY] [package.json](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/backend/package.json)
- `npm install socket.io`

#### [DONE] [.env](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/.env)
- ✅ `VITE_GOOGLE_MAPS_API_KEY` already set to real key

---

### Phase 2: Backend — Socket.io + Model Updates

#### [MODIFY] [Bus.js](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/backend/models/Bus.js)
- Add `speed` (Number) and `heading` (Number, 0-360) to `currentLocation` subdocument

#### [MODIFY] [server.js](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/backend/server.js)
- Create HTTP server from Express app
- Attach Socket.io with CORS config
- Add `io` instance to `req` via middleware so controllers can emit events
- Handle `connection`/`disconnect`, `joinRoute`/`leaveRoute` events for room-based broadcasting

#### [MODIFY] [trackingController.js](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/backend/controllers/trackingController.js)
- `updateLocation`: accept `speed`, `heading`, emit `busLocationUpdate` via Socket.io to the bus's route room
- `startTrip`: emit `tripStarted` event
- `stopTrip`: emit `tripStopped` event

---

### Phase 3: Shared Frontend Components

#### [NEW] `frontend/src/components/MapProvider.jsx`
- `LoadScript` wrapper for `@react-google-maps/api` (loads Google Maps JS API once)
- Wraps the App to avoid duplicate loads

#### [MODIFY] [BusMap.jsx](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/src/components/BusMap.jsx)
- Full rewrite: real `GoogleMap` + `Marker` + `InfoWindow` + `Polyline`
- **Scroll-wheel zoom disabled** by default (`gestureHandling: 'cooperative'` — requires Ctrl+Scroll)
- Default center: COMSATS Vehari (30.03204, 72.31631)
- Custom bus markers, route stop markers, route polylines
- Click bus marker → InfoWindow (bus#, driver, speed, route)
- Auto-fit bounds to show all markers
- Fallback simulation mode if no API key
- Responsive height via `calc(100vh - offset)` on mobile

#### [NEW] `frontend/src/services/socketService.js`
- Socket.io client: connect, disconnect, `joinRoute(routeId)`, `leaveRoute(routeId)`
- Event listeners: `busLocationUpdate`, `tripStarted`, `tripStopped`
- Auto-reconnect

#### [MODIFY] [trackingService.js](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/src/services/trackingService.js)
- Add `speed`, `heading` to `updateLocation` call

---

### Phase 4: Driver Portal — Live Tracking Tab

#### [MODIFY] [DriverSidebar.jsx](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/src/pages/DriverDashboard/components/DriverSidebar.jsx)
- Add "Live Tracking" sidebar item (separate from existing "Tracking" text-based view)

#### [MODIFY] [DriverDashboard.jsx](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/src/pages/DriverDashboard/DriverDashboard.jsx)
- Wire up the new live tracking view

#### [NEW] `frontend/src/pages/DriverDashboard/components/DriverLiveTrackingView.jsx`
- Google Map with driver's real-time GPS position via `navigator.geolocation.watchPosition()`
- Route stops + polyline on map
- Auto-send location to backend every 5s while on trip
- Start/Stop Trip buttons that also start/stop GPS watching
- Bus info card + status indicators alongside map
- Responsive: map fills available space, cards stack on mobile

---

### Phase 5: Student Portal — Live Tracking Tab

#### [MODIFY] [StudentSidebar.jsx](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/src/pages/StudentDashboard/components/StudentSidebar.jsx)
- Add "Live Tracking" sidebar item

#### [MODIFY] [StudentDashboard.jsx](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/src/pages/StudentDashboard/StudentDashboard.jsx)
- Wire up the new live tracking view

#### [NEW] `frontend/src/pages/StudentDashboard/components/StudentLiveTrackingView.jsx`
- Google Map showing assigned bus moving in real-time (via Socket.io)
- Route stops + polyline
- Student's own location marker (with geolocation permission)
- **Distance-to-bus display**: Uses Haversine formula to calculate straight-line distance between student's GPS position and the bus. Shows contextual distance text:
  - `"Bus is 25 km away"` (when far, e.g., student at home)
  - `"Bus is 1.2 km away"` (when close, e.g., approaching campus)
  - `"Bus is nearby (< 500m)"` (when very close)
  - Updates in real-time as bus moves and/or student's position changes
- InfoWindow on bus marker: bus#, driver name, phone, speed, distance
- Responsive layout: map + info panel below on mobile

---

### Phase 6: Admin Portal — Fleet Map Tab

#### [MODIFY] [AdminSidebar.jsx](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/src/pages/AdminDashboard/components/AdminSidebar.jsx)
- Add "Live Tracking" sidebar item

#### [MODIFY] [AdminDashboard.jsx](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/src/pages/AdminDashboard/AdminDashboard.jsx)
- Wire up AdminLiveTrackingView

#### [NEW] `frontend/src/pages/AdminDashboard/components/AdminLiveTrackingView.jsx`
- Full-width Google Map showing **all** active buses
- Color-coded markers by route
- Route filter dropdown
- Active bus count chips
- InfoWindow: bus#, driver, route, speed, trip start time
- Responsive

---

### Phase 7: App-Level Integration

#### [MODIFY] [main.jsx](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/src/main.jsx)
- Wrap app root in `MapProvider` so Google Maps loads once

#### [MODIFY] [index.js](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/src/services/index.js)
- Export `socketService`

---

## Verification Plan

### Browser Testing (step-by-step manual)

**Test 1 — Driver Live Tracking:**
1. Log in as a driver in the browser
2. Click "Live Tracking" in the sidebar
3. ✅ Google Map should load centered on COMSATS Vehari
4. ✅ Map should NOT zoom when scrolling the page (Ctrl+Scroll works)
5. Click "Start Trip" → browser asks for location permission → grant it
6. ✅ A bus marker should appear at your location on the map
7. ✅ Route stops and polyline should be visible
8. ✅ Console/Network tab shows location updates being sent every ~5s
9. Click "Stop Trip" → GPS stops, location sending stops

**Test 2 — Student Live Tracking:**
1. Open a second browser tab, log in as a student (who has assigned bus)
2. Click "Live Tracking" in the sidebar
3. ✅ Google Map loads showing the bus marker (if driver is on trip from Test 1)
4. ✅ Bus marker moves in near real-time as the driver's location updates arrive via Socket.io
5. ✅ Route stops and polyline visible on the map
6. ✅ Click bus marker → InfoWindow shows bus#, driver, speed

**Test 3 — Admin Live Tracking:**
1. Open a third browser tab, log in as admin
2. Click "Live Tracking" in the sidebar
3. ✅ Map shows all active buses with markers
4. ✅ Route filter dropdown works
5. ✅ Click on any bus marker → InfoWindow with details

**Test 4 — Responsive:**
1. Resize browser to mobile width (~375px)
2. ✅ Map resizes appropriately, does not break layout
3. ✅ Info cards stack vertically below map

**Test 5 — Fallback:**
1. Remove API key from `.env` → restart dev server
2. ✅ Simulation/fallback mode still works (no crash)

> [!TIP]
> For best testing, open 3 browser windows side-by-side: driver, student, admin. Start a trip in driver window and watch it appear in real-time on student and admin maps.
