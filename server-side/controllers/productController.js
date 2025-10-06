import Product from '../models/productModel.js';

// @desc    Get all products with filtering
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { category, price_min, price_max, search } = req.query;
    
    let filter = {};

    if (category && category !== '') {
      filter.category = { $regex: category, $options: 'i' };
    }
    
    if (search && search !== '') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (price_min || price_max) {
      filter.price = {};
      if (price_min) {
        filter.price.$gte = Number(price_min);
      }
      if (price_max) {
        filter.price.$lte = Number(price_max);
      }
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product by ID error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, imageUrl, stock } = req.body;

    // Basic validation
    if (!name || !price || !description || !category) {
      return res.status(400).json({ msg: 'Please provide all required fields' });
    }

    const product = new Product({
      name,
      price: Number(price),
      description,
      category,
      imageUrl: imageUrl || '',
      stock: Number(stock) || 0,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { name, price, description, category, imageUrl, stock } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    product.name = name || product.name;
    product.price = price ? Number(price) : product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.imageUrl = imageUrl !== undefined ? imageUrl : product.imageUrl;
    product.stock = stock !== undefined ? Number(stock) : product.stock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ msg: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Product removed successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
};