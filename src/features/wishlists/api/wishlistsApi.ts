import { apiGet, apiPost, apiDelete } from '@/services/api';
import type { Wishlist } from '@/types/api';

/**
 * 내 위시리스트 조회
 * GET /wishlists
 */
export async function getMyWishlists(): Promise<Wishlist[]> {
  return apiGet<Wishlist[]>('/wishlists');
}

/**
 * 위시리스트 추가
 * POST /wishlists/{experienceId}
 */
export async function addToWishlist(experienceId: number): Promise<Wishlist> {
  return apiPost<void, Wishlist>(`/wishlists/${experienceId}`);
}

/**
 * 위시리스트 제거
 * DELETE /wishlists/{experienceId}
 */
export async function removeFromWishlist(experienceId: number): Promise<void> {
  return apiDelete(`/wishlists/${experienceId}`);
}

/**
 * 위시리스트 존재 여부 확인
 * GET /wishlists/check/{experienceId}
 */
export async function checkWishlist(experienceId: number): Promise<boolean> {
  const response = await apiGet<{ isInWishlist: boolean }>(`/wishlists/check/${experienceId}`);
  return response.isInWishlist;
}
