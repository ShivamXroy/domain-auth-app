# Domain Auth

A polished Expo application for web, Android, and iOS that authenticates people with Google through Firebase Authentication and admits only verified accounts at the exact `hbplus.fit` domain.

## Features

- Real Google OAuth via `expo-auth-session` and Firebase Authentication
- Exact, case-insensitive domain checking; `user@sub.hbplus.fit` and lookalikes are rejected
- Rejects unverified accounts and signs unauthorized users out immediately
- Protected dashboard, session restoration, cancellation and configuration errors, and logout
- Responsive, accessible React Native UI shared by web and native apps
- Native persistence backed by AsyncStorage; browser sessions use Firebase browser persistence

## Stack and structure

Expo SDK 54, Expo Router, React Native/React Native for Web, TypeScript, Firebase Auth, and Jest.

```
app/           routes: login, dashboard, root layout
components/    reusable screen frame
hooks/         authentication context and Google OAuth flow
services/      Firebase initialization and persistence
utils/         exact-domain validation
tests/         automated validation tests
```

## Prerequisites and installation

Install Node.js 20 LTS or a version supported by your selected Expo SDK, a Google account, and a Firebase project. For native development, install Expo Go (for development) or the Android/iOS build tooling described by Expo.

```bash
npm install
Copy-Item .env.example .env
```

Populate `.env` with the public Firebase web-app configuration and the Google OAuth client IDs. Expo only exposes variables prefixed `EXPO_PUBLIC_`; these Firebase identifiers are intended to be public. Do not put service-account files, private keys, refresh tokens, or OAuth client secrets in `.env`.

## Firebase and Google OAuth setup

1. Create a Firebase project in the [Firebase console](https://console.firebase.google.com/), then add a Web app and copy its config into `.env`.
2. In **Authentication → Sign-in method**, enable **Google** and select a project support email.
3. In **Authentication → Settings → Authorized domains**, add each web domain that will host this app. `localhost` is available for local development; add the final production hostname before deployment.
4. In Google Cloud Console (same project), configure OAuth consent screen branding and publishing as needed. Create a Web OAuth client and set `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`. Add the exact development and production redirect URIs shown by Expo/AuthSession.
5. For Android, create an Android OAuth client with package `com.hbplus.domainauth` and the SHA-1 fingerprints for the signing certificates you use (debug and release). Put its client ID in `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`.
6. For iOS, create an iOS OAuth client for bundle ID `com.hbplus.domainauth`, set `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`, and configure any returned URL scheme in the native build if requested by Google.

`app.json` contains the current Android package, iOS bundle ID, and `domainauth` redirect scheme. Change these identifiers before a branded release, then create matching OAuth clients. Native OAuth cannot be fully exercised in Expo Go; use a development build or release build after configuring the clients.

## Run, test, and build

```bash
npm run start
npm run web
npm run android
npm run ios
npm run typecheck
npm test
npm run build:web
```

`build:web` writes the static export to `dist/`. Use EAS Build or your organization’s native CI to make Android/iOS binaries after completing OAuth setup.

## Authentication and security

The app opens Google OAuth, exchanges the returned ID token for a Firebase credential, and observes Firebase’s auth-state event. Before setting a session as usable, it requires `emailVerified` and parses the normalized email with an anchored address/domain match. Only a domain exactly equal to `hbplus.fit` passes. Failure signs the Firebase user out and leaves the dashboard inaccessible; loading state blocks route rendering until that decision is known.

The dashboard route additionally redirects unauthenticated users, so direct URLs cannot expose UI content. Native sessions are persisted using Firebase’s React Native persistence adapter with AsyncStorage; the browser uses Firebase’s browser persistence. The application does not manually store access tokens, refresh tokens, or passwords.

Client checks are necessary for UI but cannot alone protect a backend. This starter does not use Firestore. If you add Firestore, Storage, Cloud Functions, or an API, enforce authorization there as well: verify Firebase ID tokens server-side and either validate a verified exact-domain email on every request or provision a server-controlled custom claim. Firebase rules should reject unauthenticated clients and check the token/claim; never trust a client-side boolean. A Cloud Function using the Admin SDK is the appropriate place to mint claims—its service account must stay off clients and out of Git.

## Troubleshooting

- **“Firebase is not configured”**: ensure all required `EXPO_PUBLIC_FIREBASE_*` values are in `.env`, then restart Expo with cache cleared.
- **Google does not return an ID token**: check that the correct web/native client ID is configured, the OAuth consent screen is available to the user, and redirect URIs match exactly.
- **`auth/unauthorized-domain`**: add the deployed hostname under Firebase Authentication authorized domains.
- **Native sign-in opens then returns early**: verify Android SHA-1/package or iOS bundle ID/client ID pairing, then rebuild the native app.
- **A user is rejected**: Firebase must report their Google email as verified and its normalized domain must be exactly `hbplus.fit`.

## GitHub submission

```bash
git init
git add .
git status
git commit -m "Initial Domain Auth application"
gh auth login
gh repo create domain-auth-app --private --source=. --remote=origin --push
```

Use `--public` instead of `--private` only if appropriate. Confirm `git status` has no `.env`, service accounts, builds, or `node_modules` before committing. If a remote already exists, inspect it with `git remote -v` and push only after verifying it is the intended repository.

## Manual release checklist

- [ ] Create Firebase project and enable Google provider.
- [ ] Create web, Android, and iOS OAuth clients with final redirect identifiers.
- [ ] Populate `.env` locally and add production environment variables in CI/hosting.
- [ ] Add all production web domains to Firebase authorized domains.
- [ ] Implement backend/Firebase rules or custom claims before exposing sensitive data.
- [ ] Run typecheck, tests, web export, and native builds.
- [ ] Commit only source, configuration templates, and documentation; then push to the verified GitHub repository.
