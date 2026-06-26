import { apiGet, apiPost, apiDelete } from '@/services/api';
import type { Wishlist } from '@/types/api';

/**
 * 내 위시리스트 조회
 * GET /wishlists
 * @returns 사용자의 찜 목록
 * @throws Error 네트워크 에러, 인증 에러 (401)
 */
export async function getMyWishlists(): Promise<Wishlist[]> {
  try {
    return await apiGet<Wishlist[]>('/wishlists');
  } catch (error) {
    console.error('[WishlistAPI] 위시리스트 조회 실패:', error);
    throw error;
  }
}

/**
 * 위시리스트에 체험 추가
 * POST /wishlists/{experienceId}
 * @param experienceId 체험 ID
 * @returns 추가된 위시리스트 항목
 * @throws Error 네트워크 에러, 이미 찜됨 (409), 체험 없음 (404)
 *
 * 참고: Backend API 설계
 * - URL 경로: /wishlists/{experienceId}
 * - 요청 본문: 없음 (experienceId는 URL에만 포함)
 */
export async function addToWishlist(experienceId: number): Promise<Wishlist> {
  try {
    return await apiPost<void, Wishlist>(`/wishlists/${experienceId}`);
  } catch (error) {
    console.error(`[WishlistAPI] 위시리스트 추가 실패 (experienceId=${experienceId}):`, error);
    throw error;
  }
}

/**
 * 위시리스트에서 체험 제거
 * DELETE /wishlists/{experienceId}
 * @param experienceId 체험 ID
 * @throws Error 네트워크 에러, 찜되지 않음 (404)
 */
export async function removeFromWishlist(experienceId: number): Promise<void> {
  try {
    return await apiDelete(`/wishlists/${experienceId}`);
  } catch (error) {
    console.error(`[WishlistAPI] 위시리스트 제거 실패 (experienceId=${experienceId}):`, error);
    throw error;
  }
}

/**
 * 체험이 위시리스트에 있는지 확인
 * GET /wishlists/check/{experienceId}
 * @param experienceId 체험 ID
 * @returns 위시리스트 포함 여부
 * @throws Error 네트워크 에러, 인증 에러 (401)
 *
 * 참고:
 * - 백엔드 응답: ApiResponse<{ isInWishlist: boolean }> = { success: true, data: { isInWishlist: boolean } }
 * - 에러 발생 시 안전한 기본값(false)을 반환하여 UI 렌더링 정상 진행
 */
export async function checkWishlist(experienceId: number): Promise<boolean> {
  try {
    const response = await apiGet<{ isInWishlist: boolean }>(
      `/wishlists/check/${experienceId}`
    );
    return response?.isInWishlist ?? false;
  } catch (error) {
    console.error(`[WishlistAPI] 위시리스트 확인 실패 (experienceId=${experienceId}):`, error);
    // 에러 발생 시 찜되지 않은 것으로 처리 (안전한 기본값)
    return false;
  }
}
