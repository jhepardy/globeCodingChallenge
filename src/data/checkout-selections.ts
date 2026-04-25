export type CheckoutSelection = {
  productName: string;
  color: string;
  quantity: number;
};

export type CartItemSelection = {
  productName: string;
  color?: string;
  quantity: number;
};

export type MultiItemCheckoutSelection = {
  items: CartItemSelection[];
};

export const checkoutSelections = {
  automaticStandard: {
    productName: 'Automatic Espresso Machine',
    color: 'Matte Black',
    quantity: 1
  },
  automaticPremium: {
    productName: 'Automatic Espresso Machine',
    color: 'Silver',
    quantity: 2
  },
  semiAutomaticDefault: {
    productName: 'Semi-Automatic Espresso Machine',
    color: 'Silver',
    quantity: 1
  }
} satisfies Record<string, CheckoutSelection>;

export const multiItemCheckoutSelections = {
  fullCatalogCart: {
    items: [
      { productName: 'Automatic Espresso Machine', quantity: 1 },
      { productName: 'Semi-Automatic Espresso Machine', quantity: 1 },
      { productName: 'Drip Coffee Maker 1.5L', quantity: 1 },
      { productName: 'Digital Air Fryer 4.2L', quantity: 1 },
      { productName: 'Digital Air Fryer 6.2L', quantity: 1 },
      { productName: 'Dual Basket Air Fryer 8L', quantity: 1 },
      { productName: 'High Speed Blender 2.0L', quantity: 1 },
      { productName: 'Personal Blender 600ml', quantity: 1 },
      { productName: 'Electric Kettle 1.7L', quantity: 1 },
      { productName: 'Temperature Control Kettle 1.7L', quantity: 1 },
      { productName: '2-Slice Toaster', quantity: 1 },
      { productName: '4-Slice Toaster', quantity: 1 },
      { productName: 'Food Processor 3.0L', quantity: 1 },
      { productName: 'Air Purifier Compact', quantity: 1 },
      { productName: 'Air Purifier Tower', quantity: 1 },
      { productName: 'Air Purifier Pro', quantity: 1 },
      { productName: 'Ultrasonic Humidifier 2.0L', quantity: 1 },
      { productName: 'Smart Humidifier 4.0L', quantity: 1 },
      { productName: 'Tower Fan 100cm', quantity: 1 },
      { productName: 'Pedestal Fan 40cm', quantity: 1 },
      { productName: 'Steam Generator Iron', quantity: 1 },
      { productName: 'Handheld Garment Steamer', quantity: 1 },
      { productName: 'Professional Garment Steamer', quantity: 1 },
      { productName: 'Steam Iron 2400W', quantity: 1 },
      { productName: 'Cordless Stick Vacuum 18V', quantity: 1 },
      { productName: 'Cordless Stick Vacuum 25V', quantity: 1 },
      { productName: 'Bagless Upright Vacuum', quantity: 1 },
      { productName: 'Robot Vacuum', quantity: 1 },
      { productName: 'Robot Vacuum Pro', quantity: 1 },
      { productName: 'Ionic Hair Dryer 2000W', quantity: 1 },
      { productName: 'Compact Travel Hair Dryer', quantity: 1 },
      { productName: 'Ceramic Hair Straightener', quantity: 1 },
      { productName: 'Beard Trimmer 3000', quantity: 1 },
      { productName: 'Beard Trimmer 7000', quantity: 1 },
      { productName: 'Multigroom Kit 10-in-1', quantity: 1 },
      { productName: 'Rotary Shaver 5000', quantity: 1 },
      { productName: 'Rotary Shaver 9000', quantity: 1 }
    ]
  },
  automaticAllColors: {
    items: [
      {
        productName: 'Automatic Espresso Machine',
        color: 'Matte Black',
        quantity: 1
      },
      {
        productName: 'Automatic Espresso Machine',
        color: 'Silver',
        quantity: 1
      },
      {
        productName: 'Automatic Espresso Machine',
        color: 'White',
        quantity: 1
      }
    ]
  }
} satisfies Record<string, MultiItemCheckoutSelection>;
