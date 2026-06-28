import { chungbukGet, chungbukPost, chungbukDelete } from '@/services/chungbukApi';
import { adaptWishlist } from '@/features/chungbuk/adapters';
import type { ChungbukWishlist, ChungbukExperience } from '@/features/chungbuk/adapters';
import type { Wishlist } from '@/types/api';

/**
 * 내 위시리스트 조회 - 충북 찜 목록 (GET /chungbuk/wishlists). 로그인 필수.
 * 충북 위시리스트 응답엔 체험 정보가 없어 체험 목록과 조인해 제목/가격/이미지를 채운다.
 */
export async function getMyWishlists(): Promise<Wishlist[]> {
  try {
    const [wishlists, experiences] = await Promise.all([
      chungbukGet<ChungbukWishlist[]>('/wishlists'),
      chungbukGet<ChungbukExperience[]>('/experiences'),
    ]);
    const experienceMap = new Map(experiences.map((e) => [e.id, e]));
    return wishlists.map((w) => adaptWishlist(w, experienceMap.get(w.experience_id)));
  } catch (error) {
    console.error('[WishlistAPI] 위시리스트 조회 실패:', error);
    throw error;
  }
}

/**
 * 위시리스트에 체험 추가 - 충북 찜 (POST /chungbuk/wishlists/{experienceId}). 로그인 필수.
 */
export async function addToWishlist(experienceId: number): Promise<Wishlist> {
  try {
    const raw = await chungbukPost<void, ChungbukWishlist>(`/wishlists/${experienceId}`);
    return adaptWishlist(raw, undefined);
  } catch (error) {
    console.error(`[WishlistAPI] 위시리스트 추가 실패 (experienceId=${experienceId}):`, error);
    throw error;
  }
}

/**
 * 위시리스트에서 체험 제거 - 충북 찜 (DELETE /chungbuk/wishlists/{experienceId}). 로그인 필수.
 */
export async function removeFromWishlist(experienceId: number): Promise<void> {
  try {
    await chungbukDelete<void>(`/wishlists/${experienceId}`);
  } catch (error) {
    console.error(`[WishlistAPI] 위시리스트 제거 실패 (experienceId=${experienceId}):`, error);
    throw error;
  }
}

/**
 * 체험이 위시리스트에 있는지 확인 - 충북 찜 (GET /chungbuk/wishlists/check/{experienceId}). 로그인 필수.
 * 에러 발생 시 안전한 기본값(false)을 반환하여 UI 렌더링 정상 진행.
 */
export async function checkWishlist(experienceId: number): Promise<boolean> {
  try {
    const response = await chungbukGet<{ isInWishlist: boolean }>(
      `/wishlists/check/${experienceId}`
    );
    return response?.isInWishlist ?? false;
  } catch (error) {
    console.error(`[WishlistAPI] 위시리스트 확인 실패 (experienceId=${experienceId}):`, error);
    return false;
  }
}
