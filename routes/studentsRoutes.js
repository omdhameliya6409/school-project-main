const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { check, validationResult } = require("express-validator");
const { getAdmissionCSV } = require('../controllers/admissionController'); // Controller for CSV functionality
const { getDisabledStudentsList, updateBlockStatus } = require('../controllers/admissionController');

const Admission = require('../models/Admission'); // Adjust the path as needed
const Student = require('../models/Student');  // Adjust the path if needed
const BlockedStudent = require('../models/BlockedStudent');  // Import the BlockedStudent model
// Add a student (POST) - Principal and Teacher can add students
router.post(
  "/add",
  authMiddleware(["principalAccess", "teacherAccess"]), // Allow principal and teacher
  [
    check("admissionNo").not().isEmpty().withMessage("Admission number is required"),
    check("name").not().isEmpty().withMessage("Student name is required"),
    check("rollNo").not().isEmpty().withMessage("Roll number is required"),
    check("class").not().isEmpty().withMessage("Class is required"),
    check("dateOfBirth").not().isEmpty().withMessage("Date of Birth is required"),
    check("gender").not().isEmpty().withMessage("Gender is required"),
    check("mobileNumber").isMobilePhone().withMessage("Invalid mobile number"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      admissionNo,
      name,
      rollNo,
      class: studentClass,
      dateOfBirth,
      gender,
      mobileNumber,
    } = req.body;

    try {
      const newStudent = new Student({
        admissionNo,
        name,
        rollNo,
        class: studentClass,
        dateOfBirth,
        gender,
        mobileNumber,
        isDisabled: false,
        isMultiClass: false,
        deleted: false,
        assignedTeacher: null, // Optionally assign a teacher later
      });

      await newStudent.save();
      res.status(201).json({
        message: "Student added successfully",
        student: newStudent,
      });
    } catch (error) {
      res.status(500).json({ message: "Error adding student", error });
    }
  }
);

// Get all students (GET) - Principal can see all, Teacher can see their assigned students
// router.get(
//   "/",
//   authMiddleware(["principalAccess", "teacherAccess"]), // Allow principal and teacher
//   async (req, res) => {
//     try {
//       const students = await Student.find(); // Fetch all students
//       res.status(200).json({ message: "All students List successfully", students });
//     } catch (error) {
//       res.status(500).json({ message: "Error fetching students", error });
//     }
//   }
// );

// Route 2: Advanced filtering and sorting route
router.get(
  "/allstudent",
  authMiddleware(["principalAccess", "teacherAccess"]), // Allow principal and teacher
  async (req, res) => {
    const { name, studentClass, section, sortField = "name", sortOrder = "asc" } = req.query;

    // Build the search query
    const query = {};
    if (name) {
      query.name = { $regex: name, $options: "i" }; // Case-insensitive regex for name
    }
    if (studentClass) {
      query.class = studentClass;
    }
    if (section) {
      query.section = section;
    }

    // If the user is a teacher, filter students by assignedTeacher
    if (req.userTeacherId) {
      query.assignedTeacher = req.userTeacherId;
    }

    // Sorting logic
    const sortOptions = {};
    sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;

    try {
      const students = await Student.find(query).sort(sortOptions);
      res.status(200).json({ message: "Filtered students retrieved successfully", students });
    } catch (error) {
      res.status(500).json({ message: "Error fetching filtered students", error });
    }
  }
);
// Edit student details (PUT) - Principal and Teacher can edit
router.put(
  "/edit/:id",
  authMiddleware(["principalAccess", "teacherAccess"]), // Allow principal and teacher
  async (req, res) => {
    const studentId = req.params.id;
    const updateData = req.body;

    // Input validation (optional for updates)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        updateData,
        { new: true } // This option returns the updated document
      );

      if (!updatedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.status(200).json({
        message: "Student updated successfully",
        student: updatedStudent,
      });
    } catch (error) {
      res.status(500).json({ message: "Error editing student", error });
    }
  }
);

// Delete student (DELETE) - Principal and Teacher can delete
router.delete(
  "/delete/:id",
  authMiddleware(["principalAccess", "teacherAccess"]), // Allow principal and teacher
  async (req, res) => {
    const studentId = req.params.id;

    try {
      const deletedStudent = await Student.findByIdAndDelete(studentId);

      if (!deletedStudent) {
        return res.status(404).json({ message: "Student not found" });
      }

      res.status(200).json({
        message: "Student deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ message: "Error deleting student", error });
    }
  }
);
router.get(
  '/multiclass',
  authMiddleware(['principalAccess', 'teacherAccess']), // Authorization middleware
  async (req, res) => {
    const { studentClass, section, sortField = 'name', sortOrder = 'asc' } = req.query;

    // Validate if `studentClass` and `section` are provided
    if (!studentClass || !section) {
      return res.status(400).json({
        message: '`studentClass` and `section` are required query parameters.',
      });
    }

    // Build the query object
    const query = {
      class: studentClass,
      section: section,
    };

    // Sort options
    const sortOptions = {};
    sortOptions[sortField] = sortOrder === 'asc' ? 1 : -1;

    try {
      const students = await Student.find(query).sort(sortOptions);

      if (students.length === 0) {
        return res.status(404).json({ message: 'No students found matching your filters' });
      }

      res.status(200).json({
        message: 'Students fetched successfully',
        students,
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ message: 'Error fetching students', error });
    }
  }
);
router.put(
  '/multiclass/edit/:id',
  authMiddleware(['principalAccess', 'teacherAccess']), // Authorization middleware
  async (req, res) => {
    const studentId = req.params.id; // Student ID from URL
    const updateData = req.body; // Updated details from request body

    try {
      // Check if student exists
      const student = await Student.findById(studentId);
      if (!student) {
        return res.status(404).json({ message: 'Student not found' });
      }

      // Update the student record
      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        { $set: updateData }, // Update only provided fields
        { new: true, runValidators: true } // Return updated document and validate data
      );

      res.status(200).json({
        message: 'Student details updated successfully',
        student: updatedStudent,
      });
    } catch (error) {
      console.error('Error updating student details:', error);
      res.status(500).json({
        message: 'Error updating student details',
        error: error.message,
      });
    }
  }
);

// Route to download all admission details as a CSV
router.get(
  '/download',
  authMiddleware(['principalAccess', 'teacherAccess']), // Only Principal and Teacher can access
  getAdmissionCSV // Controller function to generate and send CSV
);
// // Block a student by studentId
// router.put(
//   '/block/:studentId', // Block a student by their studentId
//   authMiddleware(['principalAccess', 'teacherAccess']), // Ensure proper authorization
//   async (req, res) => {
//     const { studentId } = req.params; // Get studentId from the request parameters
//     const { blockReason } = req.body; // Get the block reason from the request body

//     if (!blockReason) {
//       return res.status(400).json({ message: 'Block reason is required' });
//     }

//     try {
//       // Find the student by their ID
//       const student = await Student.findById(studentId);
//       if (!student) {
//         return res.status(404).json({ message: 'Student not found' });
//       }

//       // Update the student's isBlocked status to true
//       student.isBlocked = true;
//       await student.save(); // Save the updated student document

//       // Create a new blocked student record with the reason and student info
//       const blockedStudent = new BlockedStudent({
//         studentId: student._id, // Reference to student ID
//         blockReason: blockReason, // Block reason
//       });

//       // Save the blocked student record
//       await blockedStudent.save();

//       return res.status(200).json({
//         message: 'Student blocked successfully',
//         studentId: student._id,
//         blockReason: blockReason,
//         isBlocked: student.isBlocked,
//       });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: 'Error blocking student', error });
//     }
//   }
// );

// // Unblock a student by studentId
// router.put(
//   '/unblock/:studentId', // Unblock a student by their studentId
//   authMiddleware(['principalAccess', 'teacherAccess']), // Ensure proper authorization
//   async (req, res) => {
//     const { studentId } = req.params;

//     try {
//       // Find the student by their ID
//       const student = await Student.findById(studentId);
//       if (!student) {
//         return res.status(404).json({ message: 'Student not found' });
//       }

//       // Update the student's isBlocked status to false
//       student.isBlocked = false;
//       await student.save(); // Save the updated student document

//       // Optionally remove the student from the BlockedStudent collection
//       await BlockedStudent.deleteOne({ studentId: student._id });

//       return res.status(200).json({
//         message: 'Student unblocked successfully',
//         studentId: student._id,
//         isBlocked: student.isBlocked,
//       });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: 'Error unblocking student', error });
//     }
//   }
// );




// router.get(
//   '/blocked',
//   authMiddleware(['principalAccess', 'teacherAccess']), // Ensure proper authorization
//   async (req, res) => {
//     try {
//       // Fetch all blocked students and populate their details
//       const blockReasons = await BlockedStudent.find()
//         .populate('studentId', 'admissionNo name rollNo class section mobileNumber isBlocked') // Populate student details
//         .exec();

//       // If no blocked students are found, return a message
//       if (blockReasons.length === 0) {
//         return res.status(404).json({ message: 'No students are currently blocked.' });
//       }

//       // Format the response to include blockReason and other student details
//       const formattedBlockReasons = blockReasons.map((blocked) => {
//         // Check if studentId is populated
//         if (blocked.studentId) {
//           return {
//             _id: blocked.studentId._id,
//             admissionNo: blocked.studentId.admissionNo,
//             name: blocked.studentId.name, // Full name (if you want to show it separately)
//             rollNo: blocked.studentId.rollNo,
//             class: blocked.studentId.class,
//             section: blocked.studentId.section,
//             mobileNumber: blocked.studentId.mobileNumber,
//             isBlocked: blocked.studentId.isBlocked,
//             blockReason: blocked.blockReason, // Add block reason
//             blockedAt: blocked.blockedAt, // Blocked date
//           };
//         } else {
//           // If studentId is not populated, return a fallback response
//           return {
//             message: 'Student information is missing for this blocked entry.',
//             blockReason: blocked.blockReason,
//             blockedAt: blocked.blockedAt,
//           };
//         }
//       });

//       return res.status(200).json({
//         message: 'Blocked students fetched successfully',
//         students: formattedBlockReasons,
//       });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).json({ message: 'Error fetching blocked students', error });
//     }
//   }
// );




// You can add other routes or endpoints as necessary for your application
// /bulk-delete/filter
router.get('/bulk-delete/filter', authMiddleware(['principalAccess', 'teacherAccess']), async (req, res) => {
  const { studentClass, section } = req.query;

  // Create an empty query object
  const query = {};

  // Filter by student class (valid classes 9, 10, 11, 12)
  if (studentClass && ['9', '10', '11', '12'].includes(studentClass)) {
    query.class = studentClass;
  }

  // Filter by section (valid sections A, B, C, D)
  if (section && ['A', 'B', 'C', 'D'].includes(section)) {
    query.section = section;
  }

  try {
    // Fetch students based on filter criteria
    const students = await Student.find(query).select(
      'admissionNo name class section dateOfBirth gender mobileNumber'
    ); // Fetch the required fields

    if (students.length === 0) {
      return res.status(404).json({ message: 'No students found for the given criteria' });
    }

    // Filter students based on class and section
    const filteredStudents = students.filter(student => 
      (studentClass ? student.class === studentClass : true) &&
      (section ? student.section === section : true)
    );

    // Checking if there are students that match the filter criteria
    if (filteredStudents.length === 0) {
      return res.status(404).json({ message: 'No students found for the given class and section' });
    }

    res.status(200).json({
      message: 'Students retrieved successfully',
      data: filteredStudents,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving students', error });
  }
});






router.delete(
  '/bulk-delete', // Route to delete multiple students by class and section
  authMiddleware(['principalAccess']), // Only principals can delete
  async (req, res) => {
    const { studentClass, section } = req.query;

    // Create an empty query object
    const query = {};

    // Filter by student class (valid classes 9, 10, 11, 12)
    if (studentClass && ['9', '10', '11', '12'].includes(studentClass)) {
      query.class = studentClass;
    }

    // Filter by section (valid sections A, B, C, D)
    if (section && ['A', 'B', 'C', 'D'].includes(section)) {
      query.section = section;
    }

    try {
      // Perform bulk deletion
      const deletedStudents = await Student.deleteMany(query);

      // Check if any students were deleted
      if (deletedStudents.deletedCount === 0) {
        return res.status(404).json({
          message: 'No students found matching your filters to delete',
        });
      }

      // Return success message with the count of deleted students
      return res.status(200).json({
        message: `${deletedStudents.deletedCount} students deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting students:', error);
      return res.status(500).json({ message: 'Error deleting students', error });
    }
  }
);
router.delete(
  '/delete-all', // Route to delete all students
  authMiddleware(['principalAccess']), // Only principals can delete
  async (req, res) => {
    try {
      // Delete all students
      const deletedStudents = await Student.deleteMany({});
      
      // Check if any students were deleted
      if (deletedStudents.deletedCount === 0) {
        return res.status(404).json({ message: 'No students to delete' });
      }

      return res.status(200).json({
        message: `${deletedStudents.deletedCount} students deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting all students:', error);
      return res.status(500).json({ message: 'Error deleting students', error });
    }
  }
);
router.get(
  '/filter/category', // Route for filtering students by category
  authMiddleware(['principalAccess', 'teacherAccess']), // Authorization middleware
  async (req, res) => {
    const { category } = req.query;

    // Check if category is valid
    const validCategories = ['General', 'OBC', 'SC', 'ST'];

    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }

    try {
      // If category is not provided, we can skip category filtering
      const filter = category ? { category } : {};

      // Fetch students matching the category (or all students if category is not provided)
      const students = await Student.find(filter);

      if (students.length === 0) {
        return res.status(404).json({ message: 'No students found matching the category filter' });
      }

      res.status(200).json({
        message: 'Students fetched successfully',
        students,
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ message: 'Error fetching students', error });
    }
  }
);


router.get(
  '/students/filter/house', // Route to filter students by house name or description
  authMiddleware(['principalAccess', 'teacherAccess']), // Authorization
  async (req, res) => {
    const { houseName, houseDescription } = req.query;

    const query = {};

    // Filter by house name or description
    if (houseName) {
      query.houseName = houseName;
    }

    if (houseDescription) {
      query.houseDescription = houseDescription;
    }

    try {
      const students = await Student.find(query);

      if (students.length === 0) {
        return res.status(404).json({ message: 'No students found matching the house filters' });
      }

      res.status(200).json({
        message: 'Students fetched successfully',
        students,
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ message: 'Error fetching students', error });
    }
  }
);
router.get(
  '/filter/house', // Correct endpoint
  authMiddleware(['principalAccess', 'teacherAccess']), // Authorization
  async (req, res) => {
    const { house, houseName, houseDescription } = req.query;

    const query = {};

    // Filter by house if available
    if (house) {
      query.house = house; // Example: "Red"
    }

    // Filter by house name if available
    if (houseName) {
      query.houseName = houseName; // Example: "Red House"
    }

    // Filter by house description if available
    if (houseDescription) {
      query.houseDescription = houseDescription; // Example: description
    }

    try {
      const students = await Student.find(query);

      if (students.length === 0) {
        return res.status(404).json({ message: 'No students found matching the house filters' });
      }

      res.status(200).json({
        message: 'Students fetched successfully',
        students,
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ message: 'Error fetching students', error });
    }
  }
);
router.post(
  '/block-reasons', // Route to add a new block reason
  authMiddleware(['principalAccess']), // Only principals can add block reasons
  async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: 'Both name and description are required.',
      });
    }

    try {
      // Create a new block reason
      const blockReason = new BlockReason({ name, description });
      await blockReason.save();

      res.status(201).json({
        message: 'Block reason added successfully.',
        blockReason,
      });
    } catch (error) {
      console.error('Error adding block reason:', error);
      res.status(500).json({ message: 'Error adding block reason', error });
    }
  }
);
router.put(
  '/block-reasons/:id', // Route to edit a block reason by ID
  authMiddleware(['principalAccess']), // Only principals can edit block reasons
  async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        message: 'Both name and description are required.',
      });
    }

    try {
      // Update the block reason
      const blockReason = await BlockReason.findByIdAndUpdate(
        id,
        { name, description },
        { new: true }
      );

      if (!blockReason) {
        return res.status(404).json({ message: 'Block reason not found' });
      }

      res.status(200).json({
        message: 'Block reason updated successfully.',
        blockReason,
      });
    } catch (error) {
      console.error('Error editing block reason:', error);
      res.status(500).json({ message: 'Error editing block reason', error });
    }
  }
);
router.delete(
  '/block-reasons/:id', // Route to delete a block reason by ID
  authMiddleware(['principalAccess']), // Only principals can delete block reasons
  async (req, res) => {
    const { id } = req.params;

    try {
      const blockReason = await BlockReason.findByIdAndDelete(id);

      if (!blockReason) {
        return res.status(404).json({ message: 'Block reason not found' });
      }

      res.status(200).json({
        message: 'Block reason deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting block reason:', error);
      res.status(500).json({ message: 'Error deleting block reason', error });
    }
  }
);
router.get(
  '/block-reasons', // Route to filter block reasons
  async (req, res) => {
    const { name, description } = req.query;

    const query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    }

    if (description) {
      query.description = { $regex: description, $options: 'i' };
    }

    try {
      const blockReasons = await BlockReason.find(query);
      res.status(200).json({
        message: 'Filtered block reasons fetched successfully.',
        blockReasons,
      });
    } catch (error) {
      console.error('Error filtering block reasons:', error);
      res.status(500).json({ message: 'Error filtering block reasons', error });
    }
  }
);


module.exports = router;
