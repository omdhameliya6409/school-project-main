const Homework = require('../models/Homework');


const createHomework = async (req, res) => {
  try {
    const { class: cls, section, subjectGroup, subject, homeworkDate, submissionDate, evaluationDate, createdBy } = req.body;

    if (!createdBy) {
      return res.status(400).json({ status: 400, error: 'Created By field is required' });
    }

    const homework = new Homework({
      class: cls,
      section,
      subjectGroup,
      subject,
      homeworkDate,
      submissionDate,
      evaluationDate,
      createdBy,
    });

    await homework.save();
    res.status(201).json({
      status: 201,
      message: 'Homework created successfully',
      data: homework,
    });
  } catch (err) {
    if (err.code === 11000) { // Duplicate key error
      res.status(400).json({
        status: 400,
        error: `Duplicate homework entry: Homework for subject '${req.body.subject}' on date '${req.body.homeworkDate}' already exists.`,
      });
    } else {
      res.status(500).json({ status: 500, error: err.message });
    }
  }
};

const getHomeworkByFilters = async (req, res) => {
  try {
    const { class: cls, section, subject } = req.query;

    if (!cls || !section || !subject) {
      return res.status(400).json({ status: 400, error: 'Class, Section, and Subject are required fields' });
    }

    const filter = {
      class: cls,
      section,
      subject: { $regex: subject, $options: 'i' },
    };

    const homework = await Homework.find(filter);

    if (homework.length === 0) {
      return res.status(404).json({ status: 404, message: 'No homework found for the given filters' });
    }

    res.status(200).json({
      status: 200,
      message: 'Request successful',
      data: homework,
    });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};


const updateHomework = async (req, res) => {
  try {
    const { id } = req.params;
    const { class: cls, section, subjectGroup, subject, homeworkDate, submissionDate, evaluationDate, createdBy } = req.body;

    const duplicateHomework = await Homework.findOne({
      _id: { $ne: id },
      homeworkDate,
      subject,
    });

    if (duplicateHomework) {
      return res.status(400).json({
        status: 400,
        error: `Duplicate homework entry: Homework for subject '${subject}' on date '${homeworkDate}' already exists.`,
      });
    }

    const updatedHomework = await Homework.findByIdAndUpdate(
      id,
      {
        class: cls,
        section,
        subjectGroup,
        subject,
        homeworkDate,
        submissionDate,
        evaluationDate,
        createdBy,
      },
      { new: true }
    );

    if (!updatedHomework) {
      return res.status(404).json({ status: 404, error: 'Homework not found' });
    }

    res.status(200).json({
      status: 200,
      message: 'Homework updated successfully',
      data: updatedHomework,
    });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};


const deleteHomework = async (req, res) => {
  try {
    const homeworkId = req.params.id;

    const homework = await Homework.findByIdAndDelete(homeworkId);

    if (!homework) {
      return res.status(404).json({ status: 404, error: 'Homework not found' });
    }

    res.status(200).json({ status: 200, message: 'Homework deleted successfully' });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
};

module.exports = {
  createHomework,
  getHomeworkByFilters,
  updateHomework,
  deleteHomework,
};
