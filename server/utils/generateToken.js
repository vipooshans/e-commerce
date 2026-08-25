import jwt from 'jsonwebtoken';

const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set on the server');
  }
  return jwt.sign({ id: String(id) }, secret, { expiresIn: '30d' });
};

export default generateToken;
