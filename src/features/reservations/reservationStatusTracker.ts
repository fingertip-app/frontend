// 충북 예약은 백엔드가 푸시 알림을 보내지 않아서(장인 승인/거절/결제 시 트리거가 없음),
// 앱 안에서라도 "마지막으로 확인한 뒤 상태가 바뀌었다"를 보여주기 위한 로컬 추적기.
// 예약 목록을 불러올 때 마지막으로 본 상태와 비교하고, 상세 화면을 보면 확인 처리한다.
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ReservationStatus } from '@/types/api'

const STORAGE_KEY = 'reservation_last_seen_status'

type StatusMap = Record<string, ReservationStatus>

async function readMap(): Promise<StatusMap> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY)
  if (!raw) return {}
  try {
    return JSON.parse(raw) as StatusMap
  } catch {
    return {}
  }
}

async function writeMap(map: StatusMap): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(map))
}

interface TrackedReservation {
  reservationId?: number
  reservationStatus?: ReservationStatus
}

/**
 * 목록 조회 시 호출 - 마지막으로 확인한 상태와 다른 예약 id 집합을 반환한다.
 * 확인 처리는 하지 않는다(상세 화면에서 ackReservationStatus를 호출해야 사라짐).
 */
export async function getChangedReservationIds(
  bookings: TrackedReservation[],
): Promise<Set<number>> {
  const seenMap = await readMap()
  const changed = new Set<number>()
  for (const booking of bookings) {
    if (booking.reservationId === undefined || !booking.reservationStatus) continue
    const lastSeen = seenMap[String(booking.reservationId)]
    if (lastSeen !== undefined && lastSeen !== booking.reservationStatus) {
      changed.add(booking.reservationId)
    }
  }
  return changed
}

/** 예약 상세를 확인했을 때 호출 - 이후 목록에서 "변경됨" 표시가 사라진다. */
export async function ackReservationStatus(
  reservationId: number,
  status: ReservationStatus,
): Promise<void> {
  const map = await readMap()
  map[String(reservationId)] = status
  await writeMap(map)
}
