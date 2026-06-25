import { PaymentConfig } from '../types';

// Payment gateway configuration
// Replace empty strings with actual credentials when ready to integrate
export const PAYMENT_CONFIG: PaymentConfig = {
  bkash: {
    merchantId: '',
    apiKey: '',
    enabled: true,
  },
  nagad: {
    merchantId: '',
    apiKey: '',
    enabled: true,
  },
  rocket: {
    merchantId: '',
    apiKey: '',
    enabled: true,
  },
  card: {
    gatewayPublicKey: '',
    enabled: false, // Enable when card gateway is configured
  },
  cod: {
    enabled: true,
  },
  bankTransfer: {
    enabled: true,
    accountDetails: 'Bank: [Bank Name]\nAccount Name: Soukhin\nAccount Number: [Account Number]\nRouting Number: [Routing Number]',
  },
};

export const PAYMENT_METHODS = [
  {
    id: 'bkash',
    name: 'bKash',
    icon: '/images/payment/bkash.png',
    instructionsBn: 'bKash নম্বরে টাকা পাঠান এবং Transaction ID অর্ডারে যোগ করুন।',
    instructions: 'Send money to bKash number and add Transaction ID to your order.',
  },
  {
    id: 'nagad',
    name: 'Nagad',
    icon: '/images/payment/nagad.png',
    instructionsBn: 'Nagad নম্বরে টাকা পাঠান এবং Transaction ID অর্ডারে যোগ করুন।',
    instructions: 'Send money to Nagad number and add Transaction ID to your order.',
  },
  {
    id: 'rocket',
    name: 'Rocket',
    icon: '/images/payment/rocket.png',
    instructionsBn: 'Rocket নম্বরে টাকা পাঠান এবং Transaction ID অর্ডারে যোগ করুন।',
    instructions: 'Send money to Rocket number and add Transaction ID to your order.',
  },
  {
    id: 'cod',
    name: 'Cash on Delivery',
    icon: '/images/payment/cod.png',
    instructionsBn: 'পণ্য হাতে পেয়ে টাকা দিন।',
    instructions: 'Pay cash when you receive your order.',
  },
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    icon: '/images/payment/bank.png',
    instructionsBn: 'ব্যাংক অ্যাকাউন্টে টাকা ট্রান্সফার করুন এবং স্লিপ আপলোড করুন।',
    instructions: 'Transfer to bank account and upload the slip.',
  },
  {
    id: 'card',
    name: 'Card Payment',
    icon: '/images/payment/card.png',
    instructionsBn: 'ক্রেডিট/ডেবিট কার্ড দিয়ে পেমেন্ট করুন।',
    instructions: 'Pay with credit or debit card.',
  },
];
