const tutorEmails = [
  "c08445333@gmail.com", // You (admin + tutor)
  "tutor1@stackmentor.com",
  "tutor2@stackmentor.com",
];

const adminEmails = [
  "c08445333@gmail.com",
  "admin@stackmentor.com",
];

const tutorOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // Allow both admins and tutors
  if (!adminEmails.includes(req.user.email) && !tutorEmails.includes(req.user.email)) {
    return res.status(403).json({ 
      message: "Access denied. Tutor or Admin access only." 
    });
  }

  next();
};

export default tutorOnly;