import { ReviewRole } from '@prisma/client';

export class ReviewResponse {
  id: string;
  orderId: string;
  authorId: string;
  targetId: string;
  role: ReviewRole;
  overallScore?: number;
  punctualityScore?: number;
  technicalScore?: number;
  cleanlinessScore?: number;
  comment?: string;
  photoUrls?: string[];
  createdAt: Date;
  hidden: boolean;

  constructor(partial: Partial<ReviewResponse>) {
    Object.assign(this, partial);
  }
}
