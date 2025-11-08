const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = {

  loginUser: async ({ email, password }) => {
    const user = await User.findOne({ email });
    console.log({ user });

    if (!user) {
      throw new Error('User not found');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error('Incorrect password');
    }

    const payload = {
      id: user._id,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    };
  },


  registerUser: async ({ username, email, password }) => {
    const existing = await User.findOne({ username });
    if (existing) throw new Error('User already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hashedPassword });

    const payload = { id: user._id };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      expiresIn: 15 * 60,
    };
  }
};
