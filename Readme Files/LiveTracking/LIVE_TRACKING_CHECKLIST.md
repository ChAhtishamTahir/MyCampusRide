# Live Location Tracking — Task Checklist

## Phase 1: Dependencies & Setup
- [ ] Install `@react-google-maps/api` + `socket.io-client` in frontend
- [ ] Install `socket.io` in backend
- [x] ~~Set real Google Maps API key in `frontend/.env`~~ ✅ Done

## Phase 2: Backend — Socket.io + Model Updates
- [ ] Add `speed`, `heading` to `Bus.js` model `currentLocation`
- [ ] Set up Socket.io in `server.js` (HTTP server + rooms)
- [ ] Update `trackingController.js`: emit `busLocationUpdate`, `tripStarted`, `tripStopped`
- [ ] Update `updateLocation` to accept `speed`/`heading`

## Phase 3: Shared Frontend Components
- [ ] Create `MapProvider.jsx` (LoadScript wrapper)
- [ ] Rewrite `BusMap.jsx` with real Google Maps (`gestureHandling: 'cooperative'`)
- [ ] Create `socketService.js` (connect/disconnect, joinRoute/leaveRoute)
- [ ] Update `trackingService.js` with speed/heading params
- [ ] Wrap app in `MapProvider` in `main.jsx`
- [ ] Export socketService from `services/index.js`

## Phase 4: Driver Portal — Live Tracking Tab
- [ ] Add "Live Tracking" to `DriverSidebar.jsx`
- [ ] Create `DriverLiveTrackingView.jsx` (map + geolocation + start/stop)
- [ ] Wire up in `DriverDashboard.jsx`

## Phase 5: Student Portal — Live Tracking Tab
- [ ] Add "Live Tracking" to `StudentSidebar.jsx`
- [ ] Create `StudentLiveTrackingView.jsx` (map + Socket.io bus tracking)
- [ ] Add distance-to-bus display (Haversine: "25km away" / "1km away" / "nearby")
- [ ] Wire up in `StudentDashboard.jsx`

## Phase 6: Admin Portal — Fleet Map Tab
- [ ] Add "Live Tracking" to `AdminSidebar.jsx`
- [ ] Create `AdminLiveTrackingView.jsx` (all-buses map + filters)
- [ ] Wire up in `AdminDashboard.jsx`

## Phase 7: Testing & Polish
- [ ] Test driver live tracking (geolocation, map, location sending)
- [ ] Test student live tracking (bus moves on map via Socket.io)
- [ ] Test admin live tracking (all buses visible, filters)
- [ ] Test scroll-safe map behavior (Ctrl+Scroll to zoom)
- [ ] Test responsive layout (mobile/tablet/desktop)
- [ ] Test fallback mode (no API key)
