export interface MasterReviewItem {
  id: number
  userName: string
  createdAt: string
  date: string
  rating: number
  className: string
  content: string
}

export interface MasterReviewsData {
  averageRating: number
  reviewCount: number
  reviews: MasterReviewItem[]
}
