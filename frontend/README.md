# ProjCalendar

vite.config.ts has two versions: server and local

Due to CORS error, this app can be open locally only if this app is served in https.
Please override [vite.config.ts](vite.config.ts) to either one of these

[1. local](vite.configLocal.ts)
[2. server](vite.configServer.ts)

Also [RoutePath](src/util/RoutePath.tsx) has two SERVER_PATH, one for hosted website and another for local test.
Comment/uncomment those for correct usage
