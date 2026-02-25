# MyCampusRide — Live Location Tracking: Codebase Info

## Application Overview
MyCampusRide is a **campus bus transport management system** with three user portals: **Admin**, **Driver**, and **Student**. Built with the MERN stack (MongoDB, Express, React+Vite, Node.js) and Material UI.

---

## What Already Exists

### Backend (Express + MongoDB REST API)

| Layer | File | What It Does |
|-------|------|--------------|
| **Model** | [Bus.js](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/backend/models/Bus.js) | `currentLocation` (lat/lng/address), `isOnTrip`, `tripStartTime`, `lastLocationUpdate`, `status` |
| **Model** | [Route.js](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/backend/models/Route.js) | `stops[]` with `name`, `latitude`, `longitude`, `address`, `sequence`, `pickupTime`, `fee` |
| **Model** | [User.js](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/backend/models/User.js) | Three roles: `admin`, `driver`, `student`. Students have `assignedBus` and `assignedRoute` |
| **Controller** | [trackingController.js](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/backend/controllers/trackingController.js) | `startTrip`, `stopTrip`, `updateLocation`, `getBusLocation`, `getActiveBusLocations`, `getSimulatedLocations`, `getMyTripStatus` |
| **Routes** | [tracking.js](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/backend/routes/tracking.js) | `POST /start-trip`, `POST /stop-trip`, `PUT /update-location`, `GET /bus/:busId`, `GET /active-buses`, `GET /simulate`, `GET /my-trip` |
| **Server** | [server.js](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/backend/server.js) | Express app with CORS, cookie-parser, MongoDB |

### Frontend (Vite + React + MUI)

| File | What It Does |
|------|--------------|
| [BusMap.jsx](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/src/components/BusMap.jsx) | Placeholder map; simulation mode with grid + bus icons |
| [DriverTrackingView.jsx](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/src/pages/DriverDashboard/components/DriverTrackingView.jsx) | Text-based tracking cards (no map) |
| [StudentTrackingView.jsx](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/src/pages/StudentDashboard/components/StudentTrackingView.jsx) | Text-based tracking with 30s HTTP polling (no map) |
| [trackingService.js](file:///d:/UNIVERSITY%20CONTENT/FYP%20(MyCampusRide)/Project%20Code/MyCampusRide%20v1.9/frontend/src/services/trackingService.js) | REST API client for tracking endpoints |

---

## What's Missing
| Gap | Status |
|-----|--------|
| No WebSocket/Socket.io | **Will add** |
| No Google Maps SDK | **Will add** (`@react-google-maps/api`) |
| No browser Geolocation usage | **Will add** in driver portal |
| No live map rendering | **Will add** in all portals |
| No admin map view | **Will add** as new sidebar tab |
| No route polyline rendering | **Will add** on maps |
| No speed/heading tracking | **Will add** to Bus model |

---

## Finalized Decisions
| Item | Decision |
|------|----------|
| **Google Maps API Key** | `AIzaSyBQFRCM1R1i0FbkbcmJBfBA06bQyBn5JP4` |
| **Real-time protocol** | Socket.io (WebSocket) |
| **Campus** | COMSATS Vehari — **30.03204°N, 72.31631°E** |
| **Location history** | ❌ Not needed |
| **ETA calculations** | ❌ Not needed |
| **Geofencing** | ❌ Not needed |
| **Route map editing** | ❌ Keep existing form-based system |
| **Map placement** | Dedicated "Live Tracking" sidebar tab per portal |
| **Scroll safety** | `gestureHandling: 'cooperative'` (Ctrl+Scroll to zoom) |
| **Responsiveness** | Maps resize on mobile/tablet/desktop |
