# Neon Rift

A cross-platform local-first arcade game prototype.

## Vision
- Fast 2–5 minute matches
- Offline solo mode with AI opponents
- Local LAN multiplayer as the first multiplayer milestone
- Online multiplayer as a later milestone with a real authoritative server
- Automatic control profile: keyboard/mouse on desktop, touch/virtual controls on mobile
- Neon/glass cyber-arcade visual identity
- Sound effects, music hooks, haptics where supported
- Responsive UI for phone, tablet and PC

## Build order
1. Stable single-player core and responsive controls
2. Device/control detection
3. Audio and haptics
4. Arena/game modes
5. Offline AI
6. LAN discovery/session layer
7. Online backend/protocol
8. Matchmaking/lobbies
9. Polish, accessibility, PWA packaging

## Multiplayer truth
A static GitHub Pages site cannot itself act as an authoritative multiplayer server. LAN and online multiplayer therefore use separate networking layers. The frontend remains playable offline without a server.

## Naming
Project: Neon Rift
Repository: typingdungeon during initial prototype phase; migrate to a dedicated neon-rift repository when repository-creation permission is available.
