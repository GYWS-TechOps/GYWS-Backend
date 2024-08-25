import jwt from 'jsonwebtoken';


const ensureAuthenticated = (req, res, next) => {
    let token = req.headers['authorization'] || req.query.token;
    console.log('Token:', token);

    if (!token) {
        return res.status(401).json({ message: 'Access denied, no token provided' });
    }

    // Handle tokens provided in the Authorization header
    if (token.startsWith('Bearer ')) {
        token = token.split(' ')[1];
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(400).json({ message: 'Invalid token' });
    }
};

export default ensureAuthenticated;


const ensureAdmin = (req, res, next) => {
    if (!req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied, not an admin' });
    }
    next();
};

export { ensureAuthenticated, ensureAdmin };
