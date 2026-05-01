const Wallet = require('../models/Wallet');

// GET /api/wallet
exports.getWallet = async (req, res, next) => {
  try {
    let wallet = await Wallet.findOne({ user: req.user._id });
    
    // Create wallet if it doesn't exist (for older users)
    if (!wallet) {
      wallet = await Wallet.create({ user: req.user._id });
    }

    res.json({
      success: true,
      data: {
        balance: wallet.balance,
        transactions: wallet.transactions.sort((a, b) => b.createdAt - a.createdAt),
      }
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/wallet/add-funds (For demo/testing)
exports.addFunds = async (req, res, next) => {
  try {
    const { amount, description } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: 'Valid amount is required.' });
    }

    const wallet = await Wallet.findOne({ user: req.user._id });
    wallet.balance += amount;
    wallet.transactions.push({
      type: 'credit',
      amount,
      description: description || 'Added funds to wallet',
    });

    await wallet.save();
    res.json({ success: true, message: 'Funds added successfully.', balance: wallet.balance });
  } catch (error) {
    next(error);
  }
};

// Internal function to handle payments/refunds
exports.processWalletTransaction = async (userId, type, amount, description, orderId = null) => {
  const wallet = await Wallet.findOne({ user: userId });
  if (!wallet) throw new Error('Wallet not found');

  if (type === 'debit' && wallet.balance < amount) {
    throw new Error('Insufficient wallet balance');
  }

  wallet.balance += (type === 'credit' ? amount : -amount);
  wallet.transactions.push({
    type,
    amount,
    description,
    order: orderId,
  });

  await wallet.save();
  return wallet;
};
