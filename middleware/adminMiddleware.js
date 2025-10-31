const adminOnly = (req, res, next) => {
  const adminEmails = ["c08445333@gmail.com", "admin@stackmentor.com"];

  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (!adminEmails.includes(req.user.email)) {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }

  next();
};

export default adminOnly;
