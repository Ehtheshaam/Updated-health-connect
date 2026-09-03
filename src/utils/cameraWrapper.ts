export function getCameraComponents() {
  return {
    CameraView: null,
    useCameraPermissions: null,
    requestCameraPermissionsAsync: async () => ({ granted: false }),
  };
}
