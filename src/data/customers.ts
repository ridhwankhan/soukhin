import { Customer, Review } from '../types';

export const customers: Customer[] = [
  {
    id: 'cust-1',
    name: 'Fatima Rahman',
    email: 'fatima@example.com',
    phone: '01712345678',
    address: '45/B, Road 12, Dhanmondi, Dhaka',
    orders: 3,
    totalSpent: 5280,
    createdAt: '2024-04-01',
  },
  {
    id: 'cust-2',
    name: 'Ayesha Khan',
    email: 'ayesha@example.com',
    phone: '01898765432',
    address: '78, Sector 3, Uttara, Dhaka',
    orders: 2,
    totalSpent: 4760,
    createdAt: '2024-05-01',
  },
  {
    id: 'cust-3',
    name: 'Nusrat Islam',
    email: 'nusrat@email.com',
    phone: '01912345678',
    address: '23, Station Road, Chittagong',
    orders: 1,
    totalSpent: 7620,
    createdAt: '2024-06-01',
  },
  {
    id: 'cust-4',
    name: 'Salma Begum',
    phone: '01612345678',
    orders: 1,
    totalSpent: 1820,
    createdAt: '2024-06-10',
  },
  {
    id: 'cust-5',
    name: 'Tahmina Akter',
    email: 'tahmina@email.com',
    phone: '01512345678',
    address: '12, Road 5, Banani, Dhaka',
    orders: 1,
    totalSpent: 6560,
    createdAt: '2024-06-15',
  },
];

export const reviews: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-1',
    customerId: 'cust-1',
    customerName: 'Fatima Rahman',
    rating: 5,
    title: 'Beautiful kameez!',
    comment: 'The fabric quality is excellent. The embroidery is done beautifully and it fits perfectly. Love wearing it!',
    isApproved: true,
    createdAt: '2024-06-22',
  },
  {
    id: 'rev-2',
    productId: 'prod-4',
    customerId: 'cust-2',
    customerName: 'Ayesha Khan',
    rating: 4,
    title: 'Great quality',
    comment: 'The three-piece is beautiful. Had to get alterations but the quality is worth it.',
    isApproved: true,
    createdAt: '2024-06-21',
  },
  {
    id: 'rev-3',
    productId: 'prod-13',
    customerId: 'cust-3',
    customerName: 'Nusrat Islam',
    rating: 5,
    title: 'Perfect Eid gift',
    comment: 'Sent this as Eid gift to my sister. She loved the packaging and the products inside. Will order again.',
    isApproved: true,
    createdAt: '2024-06-20',
  },
  {
    id: 'rev-4',
    productId: 'prod-10',
    customerId: 'cust-4',
    customerName: 'Salma Begum',
    rating: 5,
    title: 'Delicious cookies!',
    comment: 'The cookies are fresh and tasty. My whole family enjoyed them.',
    isApproved: false,
    createdAt: '2024-06-23',
  },
];

export function getReviewsByProduct(productId: string): Review[] {
  return reviews.filter(r => r.productId === productId && r.isApproved);
}

export function getAverageRating(productId: string): number {
  const productReviews = getReviewsByProduct(productId);
  if (productReviews.length === 0) return 0;
  return productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
}
