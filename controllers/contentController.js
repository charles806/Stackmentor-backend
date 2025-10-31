import CourseContent from "../models/CourseContent.js";

// Get all content for a specific course
export const getCourseContent = async (req, res) => {
  try {
    const { course } = req.params;

    const content = await CourseContent.find({
      course,
      isPublished: true,
    })
      .sort({ order: 1, createdAt: -1 })
      .populate("createdBy", "fullName email");

    res.status(200).json({ content });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch course content" });
  }
};

// Get single content by ID
export const getContentById = async (req, res) => {
  try {
    const content = await CourseContent.findById(req.params.id).populate(
      "createdBy",
      "fullName email"
    );

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.status(200).json({ content });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch content" });
  }
};

// Create new content (Admin only)
export const createContent = async (req, res) => {
  try {
    const { course, title, description, category, content, videoUrl, fileUrl, order } = req.body;

    const newContent = await CourseContent.create({
      course,
      title,
      description,
      category,
      content,
      videoUrl,
      fileUrl,
      order,
      createdBy: req.user._id,
    });

    res.status(201).json({
      message: "Content created successfully",
      content: newContent,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create content" });
  }
};

// Update content (Admin only)
export const updateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const content = await CourseContent.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.status(200).json({
      message: "Content updated successfully",
      content,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update content" });
  }
};

// Delete content (Admin only)
export const deleteContent = async (req, res) => {
  try {
    const content = await CourseContent.findByIdAndDelete(req.params.id);

    if (!content) {
      return res.status(404).json({ error: "Content not found" });
    }

    res.status(200).json({ message: "Content deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete content" });
  }
};

// Get content by category
export const getContentByCategory = async (req, res) => {
  try {
    const { course, category } = req.params;

    const content = await CourseContent.find({
      course,
      category,
      isPublished: true,
    })
      .sort({ order: 1, createdAt: -1 })
      .populate("createdBy", "fullName email");

    res.status(200).json({ content });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch content" });
  }
};