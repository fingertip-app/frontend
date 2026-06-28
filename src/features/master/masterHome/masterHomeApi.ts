import { chungbukGet, chungbukPatch, resolveChungbukImageUrl } from '@/services/chungbukApi'
import { DEMO_ARTISAN_ID, DEMO_ARTISAN_TOKEN } from '@/features/chungbuk/demoArtisan'
import type {
  ChungbukArtisan,
  ChungbukExperience,
  ChungbukReservation,
} from '@/features/chungbuk/adapters'
import type { MasterHomeBookingRequest, MasterHomeData, MasterHomeTodaySchedule } from './types'

const DEFAULT_PROFILE_IMAGE =
  'https://images.unsplash.com/photo-1566753323558-f4e0952af115?w=200&q=80'
const DEFAULT_EXPERIENCE_IMAGE =
  'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=200&q=80'

function formatDate(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const weekday = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()]
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} (${weekday})`
}

function formatTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

async function loadDemoArtisanContext() {
  const [artisans, experiences, reservations] = await Promise.all([
    chungbukGet<ChungbukArtisan[]>('/artisans'),
    chungbukGet<ChungbukExperience[]>('/experiences'),
    chungbukGet<ChungbukReservation[]>(
      `/artisans/${DEMO_ARTISAN_ID}/reservations?token=${encodeURIComponent(DEMO_ARTISAN_TOKEN)}`,
    ),
  ])
  const artisan = artisans.find((a) => a.id === DEMO_ARTISAN_ID) ?? artisans[0]
  const myExperiences = experiences.filter((e) => e.artisan_id === DEMO_ARTISAN_ID)
  const experienceById = new Map(myExperiences.map((e) => [e.id, e]))
  return { artisan, experienceById, reservations }
}

export async function getMasterHomeData(): Promise<MasterHomeData> {
  const { artisan, experienceById, reservations } = await loadDemoArtisanContext()

  const bookingRequests: MasterHomeBookingRequest[] = reservations
    .filter((r) => r.status === '신청')
    .map((r) => {
      const exp = experienceById.get(r.experience_id)
      return {
        id: r.id,
        title: exp?.title ?? '체험',
        date: formatDate(r.created_at),
        time: formatTime(r.created_at),
        guests: '1명',
        name: r.user_name,
        image: resolveChungbukImageUrl(exp?.image_url) ?? DEFAULT_EXPERIENCE_IMAGE,
      }
    })

  const todaySchedules: MasterHomeTodaySchedule[] = reservations
    .filter((r) => r.status === '확정')
    .map((r) => {
      const exp = experienceById.get(r.experience_id)
      return {
        id: r.id,
        title: exp?.title ?? '체험',
        date: formatDate(r.created_at),
        time: formatTime(r.created_at),
        guests: '1명',
        location: exp?.location ?? '충청북도',
        image: resolveChungbukImageUrl(exp?.image_url) ?? DEFAULT_EXPERIENCE_IMAGE,
      }
    })

  return {
    artisanId: DEMO_ARTISAN_ID,
    profile: {
      name: artisan?.name ?? '장인',
      description: artisan?.heritage_category ?? '',
      detail: artisan?.bio ?? '',
      imageUrl: resolveChungbukImageUrl(artisan?.profile_image_url) ?? DEFAULT_PROFILE_IMAGE,
      certificationLabel: artisan?.is_chungbuk_certified ? '인증완료' : '인증대기',
    },
    stats: {
      todayReservationCount: reservations.filter((r) => r.status !== '취소' && r.status !== '거절').length,
      monthlyRevenue: 0,
      averageRating: 0,
      reviewCount: 0,
    },
    bookingRequests,
    todaySchedules,
  }
}

export async function approveMasterReservation(reservationId: number): Promise<void> {
  await chungbukPatch(
    `/artisans/${DEMO_ARTISAN_ID}/reservations/${reservationId}/approve?token=${encodeURIComponent(DEMO_ARTISAN_TOKEN)}`,
  )
}

export async function rejectMasterReservation(reservationId: number): Promise<void> {
  await chungbukPatch(
    `/artisans/${DEMO_ARTISAN_ID}/reservations/${reservationId}/reject?token=${encodeURIComponent(DEMO_ARTISAN_TOKEN)}`,
  )
}
