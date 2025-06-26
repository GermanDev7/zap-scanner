const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prismaClient');

const register = async (email, password, role = 'USER') => {
    const hashedPassword = await bcrypt.hash(password, 10);
    return prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            role,
        },
    });
};

const login = async (email, password) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Credenciales inválidas');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error('Credenciales inválidas');

    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
    );

    return { token };
};

module.exports = { register, login };
