import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/productModel.js';

dotenv.config();

const products = [
  {
    name: 'Wireless Headphones',
    description: 'Noise-cancelling over-ear headphones with 20 hours battery life.',
    category: 'electronics',
    price: 199.99,
    imageUrl: 'https://www.lapcare.com/cdn/shop/files/1_6122ca29-5373-4c4f-97c2-0728ea368fc1.webp?v=1756209940&width=2048',
    stock: 50,
  },
  {
    name: 'Smartphone',
    description: 'Latest 5G smartphone with 128GB storage and OLED display.',
    category: 'electronics',
    price: 699.99,
    imageUrl: 'https://www.apple.com/in/iphone/home/images/overview/welcome/switch/welcome__n6xy87ib1gyu_xlarge.jpg',
    stock: 30,
  },
  {
    name: 'Coffee Maker',
    description: 'Automatic drip coffee maker with programmable timer.',
    category: 'home appliances',
    price: 89.99,
    imageUrl: 'https://m.media-amazon.com/images/I/71C1KO+jwHL.jpg',
    stock: 20,
  },
  {
    name: 'Men’s Running Shoes',
    description: 'Lightweight running shoes with breathable mesh.',
    category: 'footwear',
    price: 59.99,
    imageUrl: 'https://m.media-amazon.com/images/I/71FyAGzL5PL._UY300_.jpg',
    stock: 35,
  },
  {
    name: 'Women’s Handbag',
    description: 'Stylish leather handbag with spacious compartments.',
    category: 'accessories',
    price: 120.0,
    imageUrl: 'https://rukminim2.flixcart.com/image/704/844/xif0q/hand-messenger-bag/9/l/o/hand-bag178-11-2-exthb-178-handbag-exotic-8-5-original-imahc7m8ehchjh5m.jpeg?q=90&crop=false',
    stock: 15,
  },
  {
    name: 'Wireless Earbuds',
    description: 'Bluetooth earbuds with noise cancellation and 24h playtime.',
    category: 'electronics',
    price: 79.99,
    imageUrl: 'https://www.boat-lifestyle.com/cdn/shop/files/ACCG6DS7WDJHGWSH_0.png?v=1727669669',
    stock: 50,
  },
  {
    name: 'Silk Saree',
    description: 'Traditional silk saree with intricate zari work.',
    category: 'clothing',
    price: 199.99,
    imageUrl: 'https://www.verymuchindian.com/cdn/shop/files/DSC_4882.jpg?v=1697789492',
    stock: 10,
  },
  {
    name: 'Chocolate Gift Box',
    description: 'Assorted premium chocolates in a gift box.',
    category: 'food & gifts',
    price: 24.99,
    imageUrl: 'https://www.bbassets.com/media/uploads/p/l/40318752_4-lindberg-lindberg-expressions-assorted-centre-filled-chocolate-truffles-gift-box16pc-185g.jpg',
    stock: 40,
  },
  {
    name: 'Smart Watch',
    description: 'Fitness tracking smartwatch with heart rate monitor.',
    category: 'electronics',
    price: 149.99,
    imageUrl: 'https://m.media-amazon.com/images/I/61SagNg1+aL._UF1000,1000_QL80_.jpg',
    stock: 25,
  },
  {
    name: 'Gold Plated Necklace',
    description: 'Elegant gold-plated necklace with stone embellishments.',
    category: 'jewelry',
    price: 89.99,
    imageUrl: 'https://www.soosi.co.in/cdn/shop/products/WhatsAppImage2021-12-15at23.18.32_580x.jpg?v=1639594014',
    stock: 8,
  },
  {
    name: 'Men’s Casual Shirt',
    description: 'Cotton slim-fit casual shirt, perfect for outings.',
    category: 'clothing',
    price: 29.99,
    imageUrl: 'https://greenfibre.com/cdn/shop/files/4uub_2.jpg?v=1712214334&width=1445',
    stock: 60,
  },
  {
    name: 'Blender',
    description: 'Multi-function blender with 3-speed settings.',
    category: 'home appliances',
    price: 49.99,
    imageUrl: 'https://m.media-amazon.com/images/I/81C+H6RpALL._UF350,350_QL80_.jpg',
    stock: 30,
  },
  {
    name: 'Women’s Heels',
    description: 'Stylish high heels for parties and formal occasions.',
    category: 'footwear',
    price: 75.0,
    imageUrl: 'https://assets.myntassets.com/dpr_1.5,q_30,w_400,c_limit,fl_progressive/assets/images/31967890/2024/12/14/36906413-4d1b-42be-a8ab-5ef462597b151734174407376CHINRAAGBlockSandalswithBows1.jpg',
    stock: 22,
  },
  {
    name: 'Dry Fruits Pack',
    description: 'Assorted dry fruits packed in a premium jar.',
    category: 'food & gifts',
    price: 34.99,
    imageUrl: 'https://m.media-amazon.com/images/I/91vqN50vrLS._UF1000,1000_QL80_.jpg',
    stock: 18,
  }
];

const importData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    // Clear collection
    await Product.deleteMany();
    // Insert sample data
    await Product.insertMany(products);

    console.log('✅ Sample products inserted!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

importData();
