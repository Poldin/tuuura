export type Experience = {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    category: 'travel' | 'sport' | 'event' | 'food' | 'culture';
    price: string;
    location: string;
    date?: string;
  };