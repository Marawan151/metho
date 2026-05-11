module.exports = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req, res, next) => {
    const user = req.user;
    if (!user || !user.role) return res.status(403).json({ message: 'Forbidden' });

    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return next();
  };
};
