import AsyncStorage from "@react-native-async-storage/async-storage";

import type { RootStackParamList } from "./RootNavigator";

export const MASTER_LAST_ROUTE_KEY = "@fingertip/master-last-route";

const RESTORABLE_MASTER_ROUTES = new Set<keyof RootStackParamList>([
  "MasterHome",
  "MasterExperience",
  "MasterBookings",
  "MasterReviews",
  "MasterMyPage",
  "MasterProfile",
  "MasterTodayStatus",
]);

export function isRestorableMasterRoute(
  routeName: string | null | undefined,
): routeName is keyof RootStackParamList {
  return !!routeName && RESTORABLE_MASTER_ROUTES.has(routeName as keyof RootStackParamList);
}

export async function saveLastMasterRoute(routeName: string | undefined): Promise<void> {
  if (isRestorableMasterRoute(routeName)) {
    await AsyncStorage.setItem(MASTER_LAST_ROUTE_KEY, routeName);
  }
}

export async function getLastMasterRoute(): Promise<keyof RootStackParamList | null> {
  const routeName = await AsyncStorage.getItem(MASTER_LAST_ROUTE_KEY);
  return isRestorableMasterRoute(routeName) ? routeName : null;
}
