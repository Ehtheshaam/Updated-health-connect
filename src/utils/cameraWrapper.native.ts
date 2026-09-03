import { CameraView, Camera, useCameraPermissions } from 'expo-camera';

export function getCameraComponents() {
  return {
    CameraView,
    useCameraPermissions,
    requestCameraPermissionsAsync: Camera?.requestCameraPermissionsAsync,
  };
}
