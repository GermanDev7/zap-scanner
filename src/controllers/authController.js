const { register, login } = require('../services/authService');

const registerUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await register(email, password, role);
    res.status(201).json({ message: 'Usuario creado', user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token } = await login(email, password);
    res.json({ token });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
};

module.exports = { registerUser, loginUser };
