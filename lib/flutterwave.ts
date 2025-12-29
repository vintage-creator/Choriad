// lib/flutterwave.ts
import Flutterwave from 'flutterwave-node-v3';

export const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY!,
  process.env.FLUTTERWAVE_SECRET_KEY!
);