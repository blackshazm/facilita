# PLAN: Provider App (Expo) Baseline (Phase 3.2)

Initialize the native mobile application for service providers using Expo, focusing on the core hardware integrations required by PRD v3.0 (Camera & GPS).

## User Review Required
> [!NOTE]
> I will use `npx create-expo-app` to initialize the project. This will create a new directory `apps/provider`.

## Proposed Changes

### Mobile Setup
#### [NEW] [apps/provider/](file:///d:/Desktop/facilita/apps/provider)
- Initialize Expo project with TypeScript template.
- Install `expo-camera`, `expo-location`, and `lucide-react-native`.
- Configure `app.json` with necessary permissions (NSCameraUsageDescription, NSLocationWhenInUseUsageDescription).

### Core Components (Atomic Design)
#### [NEW] [CameraPreview.tsx](file:///d:/Desktop/facilita/apps/provider/src/components/CameraPreview.tsx)
- Reusable camera component for evidence capturing.
#### [NEW] [LocationPicker.tsx](file:///d:/Desktop/facilita/apps/provider/src/components/LocationPicker.tsx)
- Component to capture and display current coordinates.

### Onboarding Flow
#### [NEW] [RegisterScreen.tsx](file:///d:/Desktop/facilita/apps/provider/src/screens/RegisterScreen.tsx)
- Integration with backend `identity` module for provider registration.

## Verification Plan

### Automated Tests
- `npm run lint` in the provider directory.
- Verify `app.json` permissions against PRD requirements.

### Manual Verification
- Check if the app starts in Expo Go: `npx expo start`.
- (User) Verify camera permission prompt on a physical device or emulator.
