export interface Experience {
  id: string;
  uid: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  checkoutUrl?: string;
  producerId: string;
  producerName?: string;
}

export interface UserInteraction {
  productId: string;
  liked?: boolean;
  disliked?: boolean;
  clickedBuy?: boolean;
  clickedDetails?: boolean;
  clickedShare?: boolean;
}