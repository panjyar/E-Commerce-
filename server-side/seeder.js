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
