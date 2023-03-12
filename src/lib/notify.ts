import {
  isPermissionGranted,
  requestPermission,
  sendNotification
} from '@tauri-apps/api/notification'

export const notify = async (message: string) => {
  try {
    let permissionGranted = await isPermissionGranted()
    if (!permissionGranted) {
      const permission = await requestPermission()
      permissionGranted = permission === 'granted'
    }
    if (permissionGranted) {
      sendNotification(message)
    }
  } catch {
    /* empty */
  }
}
