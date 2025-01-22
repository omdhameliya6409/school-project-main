const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { check, validationResult } = require("express-validator");
const { getAdmissionCSV } = require('../controllers/admissionController'); 
const { getDisabledStudentsList, updateBlockStatus } = require('../controllers/admissionController');

const Admission = require('../models/Admission'); 
const Student = require('../models/Student'); 
const BlockedStudent = require('../models/BlockedStudent');  
const mongoose = require('mongoose');


router.post(
  "/add",
  authMiddleware(["principalAccess", "teacherAccess"]),
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
      return res.status(400).json({ status:400, errors: errors.array() });
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
        assignedTeacher: null, 
      });

      await newStudent.save();
      res.status(200).json({
        status:200,
        message: "Student added successfully",
        student: newStudent,
      });
    } catch (error) {
      res.status(500).json({ status:500,message: "Error adding student", error });
    }
  }
);


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
// router.get(
//   "/allstudent",
//   authMiddleware(["principalAccess", "teacherAccess"]), // Allow principal and teacher
//   async (req, res) => {
//     const { name, studentClass, section, sortField = "name", sortOrder = "asc" } = req.query;

//     // Build the search query
//     const query = {};
//     if (name) {
//       query.name = { $regex: name, $options: "i" }; // Case-insensitive regex for name
//     }
//     if (studentClass) {
//       query.class = studentClass;
//     }
//     if (section) {
//       query.section = section;
//     }

//     // If the user is a teacher, filter students by assignedTeacher
//     if (req.userTeacherId) {
//       query.assignedTeacher = req.userTeacherId;
//     }

//     // Sorting logic
//     const sortOptions = {};
//     sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;

//     try {
//       const students = await Student.find(query).sort(sortOptions);
//       res.status(200).json({ status:200, message: "Filtered students retrieved successfully", students });
//     } catch (error) {
//       res.status(500).json({ status:500,message: "Error fetching filtered students", error });
//     }
//   }
// );
router.get(
  "/allstudent",
  authMiddleware(["principalAccess", "teacherAccess"]), 
  async (req, res) => {
    const { rollNo, studentClass, section, sortField = "name", sortOrder = "asc" } = req.query;

   
    const query = {};
    if (rollNo) {
      query.rollNo = rollNo; 
    }
    if (studentClass) {
      query.class = studentClass;
    }
    if (section) {
      query.section = section;
    }

    if (req.userTeacherId) {
      query.assignedTeacher = req.userTeacherId;
    }

    const sortOptions = {};
    sortOptions[sortField] = sortOrder === "asc" ? 1 : -1;

    try {
      const students = await Student.find(query).sort(sortOptions);
      res.status(200).json({ status: 200, message: "Filtered students retrieved successfully", students });
    } catch (error) {
      res.status(500).json({ status: 500, message: "Error fetching filtered students", error });
    }
  }
);


router.put(
  "/edit/:id",
  authMiddleware(["principalAccess", "teacherAccess"]), 
  async (req, res) => {
    const studentId = req.params.id;
    const updateData = req.body;

   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status:400, errors: errors.array() });
    }

    try {
      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        updateData,
        { new: true } 
      );

      if (!updatedStudent) {
        return res.status(404).json({ status:404,message: "Student not found" });
      }

      res.status(200).json({
        status:200,
        message: "Student updated successfully",
        student: updatedStudent,
      });
    } catch (error) {
      res.status(500).json({ status:500,message: "Error editing student", error });
    }
  }
);

router.delete(
  "/delete/:id",
  authMiddleware(["principalAccess", "teacherAccess"]), 
  async (req, res) => {
    const studentId = req.params.id;

    try {
      const deletedStudent = await Student.findByIdAndDelete(studentId);

      if (!deletedStudent) {
        return res.status(404).json({status:404, message: "Student not found" });
      }

      res.status(200).json({
        status:200,
        message: "Student deleted successfully",
      });
    } catch (error) {
      res.status(500).json({ status:500,message: "Error deleting student", error });
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
        status:400,
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
        return res.status(404).json({status:404, message: 'No students found matching your filters' });
      }

      res.status(200).json({
        status:200,
        message: 'Students fetched successfully',
        students,
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ status:500,message: 'Error fetching students', error });
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
        return res.status(404).json({ status:404,message: 'Student not found' });
      }

      // Update the student record
      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        { $set: updateData }, // Update only provided fields
        { new: true, runValidators: true } // Return updated document and validate data
      );

      res.status(200).json({
        status:200,
        message: 'Student details updated successfully',
        student: updatedStudent,
      });
    } catch (error) {
      console.error('Error updating student details:', error);
      res.status(500).json({
        status:500,
        message: 'Error updating student details',
        error: error.message,
      });
    }
  }
);


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


// Filter students without direct deletion
// router.get('/bulk-delete/filter', authMiddleware(['principalAccess', 'teacherAccess']), async (req, res) => {
//   const { studentClass, section } = req.query;

//   // Build query
//   const query = {};
//   if (studentClass && ['9', '10', '11', '12'].includes(studentClass)) {
//     query.class = studentClass;
//   }
//   if (section && ['A', 'B', 'C', 'D'].includes(section)) {
//     query.section = section;
//   }

//   try {
//     // Fetch students matching query
//     const students = await Student.find(query).select(
//       'admissionNo name class section dateOfBirth gender mobileNumber'
//     );

//     if (students.length === 0) {
//       return res.status(404).json({
//         status: 404,
//         message: 'No students found for the given criteria',
//       });
//     }

//     res.status(200).json({
//       status: 200,
//       message: 'Students retrieved successfully',
//       data: students,
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: 500,
//       message: 'Error retrieving students',
//       error: error.message,
//     });
//   }
// });
router.get('/bulk-delete/filter', authMiddleware(['principalAccess', 'teacherAccess']), async (req, res) => {
  const { studentClass, section } = req.query;

  // Validate query parameters for class and section
  if (!studentClass || !['9', '10', '11', '12'].includes(studentClass)) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid studentClass. Allowed values are 9, 10, 11, 12.',
    });
  }

  if (!section || !['A', 'B', 'C', 'D'].includes(section)) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid section. Allowed values are A, B, C, D.',
    });
  }

  // Build query based on valid parameters
  const query = { class: studentClass, section: section };

  try {
    // Fetch students matching query
    const students = await Student.find(query).select(
      'admissionNo name class section dateOfBirth gender mobileNumber'
    );

    if (students.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No students found for the given criteria',
      });
    }

    // Assuming you want to include the token from the request (e.g., JWT in headers)
    const token = req.headers['authorization'] || '';  // Get token from the Authorization header

    res.status(200).json({
      status: 200,
      message: 'Students retrieved successfully',
      data: students,
      token: token,  // Sending the token along with the response
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: 'Error retrieving students',
      error: error.message,
    });
  }
});

// router.delete('/bulk-delete', authMiddleware(['principalAccess', 'teacherAccess']), async (req, res) => {
//   const { studentId, studentClass, section } = req.query;

//   if (!studentClass || !section) {
//     return res.status(400).json({
//       status: 400,
//       message: 'Invalid input: Provide class and section as query parameters',
//     });
//   }

//   // Build the query object based on the provided parameters
//   const query = {
//     class: studentClass,
//     section: section,
//   };

//   // If studentId is provided, add it to the query to filter by specific student IDs
//   if (studentId) {
//     const studentIds = studentId.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));
//     query._id = { $in: studentIds };
//   }

//   try {
//     // Find matching students based on the class, section, and optionally studentId
//     const matchingStudents = await Student.find(query);
//     console.log('Matching Students Before Deletion:', matchingStudents);

//     if (matchingStudents.length === 0) {
//       return res.status(404).json({
//         status: 404,
//         message: 'No students found for the given class, section, and IDs',
//       });
//     }

//     // Perform deletion
//     const result = await Student.deleteMany(query);
//     console.log('Deletion Result:', result);

//     res.status(200).json({
//       status: 200,
//       message: 'Students deleted successfully',
//       deletedCount: result.deletedCount,
//     });
//   } catch (error) {
//     console.error('Error deleting students:', error);
//     res.status(500).json({
//       status: 500,
//       message: 'Error deleting students',
//       error: error.message,
//     });
//   }
// });
router.delete('/bulk-delete', authMiddleware(['principalAccess', 'teacherAccess']), async (req, res) => {
  const { studentId, studentClass, section } = req.query;

  if (!studentClass || !section) {
    return res.status(400).json({
      status: 400,
      message: 'Invalid input: Provide class and section as query parameters',
    });
  }

  // Build the query object based on the provided parameters
  const query = {
    class: studentClass,
    section: section,
  };

  // If studentId is provided, add it to the query to filter by specific student IDs
  if (studentId) {
    const studentIds = studentId.split(',').map(id => new mongoose.Types.ObjectId(id.trim()));
    query._id = { $in: studentIds };
  }

  try {
    // Find matching students based on the class, section, and optionally studentId
    const matchingStudents = await Student.find(query);
    console.log('Matching Students Before Deletion:', matchingStudents);

    if (matchingStudents.length === 0) {
      return res.status(404).json({
        status: 404,
        message: 'No students found for the given class, section, and IDs',
      });
    }

    // Perform deletion
    const result = await Student.deleteMany(query);
    console.log('Deletion Result:', result);

    // Send a token along with the response
    const token = req.headers.authorization || ''; // Assuming the token was sent in the Authorization header
    res.status(200).json({
      token: token,  // Include the token in the response
      
    });
  } catch (error) {
    console.error('Error deleting students:', error);
    res.status(500).json({
      status: 500,
      message: 'Error deleting students',
      error: error.message,
    });
  }
});



// router.delete("/bulk-delete-by-class-section", async (req, res) => {
//   const { studentClass, section } = req.body;

//   // Validate input
//   if (!studentClass || !section) {
//     return res.status(400).json({ message: "Both class and section are required." });
//   }

//   try {
//     // Delete students based on class and section
//     const result = await StudentModel.deleteMany({
//       class: studentClass,
//       section: section
//     });

//     if (result.deletedCount > 0) {
//       res.status(200).json({ message: `${result.deletedCount} student(s) deleted from class ${studentClass} section ${section} successfully.` });
//     } else {
//       res.status(404).json({ message: "No students found for the provided class and section." });
//     }
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// });


router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await StudentModel.findByIdAndDelete(id);
    if (result) {
      res.status(204).send(); 
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});
router.delete(
  '/delete-all', 
  authMiddleware(['principalAccess']),
  async (req, res) => {
    try {
     
      const deletedStudents = await Student.deleteMany({});
      
 
      if (deletedStudents.deletedCount === 0) {
        return res.status(404).json({status:404, message: 'No students to delete' });
      }

      return res.status(200).json({
        message: `${deletedStudents.deletedCount} students deleted successfully`,
      });
    } catch (error) {
      console.error('Error deleting all students:', error);
      return res.status(500).json({ status:500,message: 'Error deleting students', error });
    }
  }
);
router.get(
  '/filter/category',
  authMiddleware(['principalAccess', 'teacherAccess']), 
  async (req, res) => {
    const { category } = req.query;

    
    const validCategories = ['General', 'OBC', 'SC', 'ST'];

    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ status:400, message: 'Invalid category' });
    }

    try {
     
      const filter = category ? { category } : {};

 
      const students = await Student.find(filter);

      if (students.length === 0) {
        return res.status(404).json({status:404, message: 'No students found matching the category filter' });
      }

      res.status(200).json({
        status:200,
        message: 'Students fetched successfully',
        students,
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ status:500,message: 'Error fetching students', error });
    }
  }
);


router.get(
  '/students/filter/house',
  authMiddleware(['principalAccess', 'teacherAccess']),
  async (req, res) => {
    const { houseName, houseDescription } = req.query;

    const query = {};

 
    if (houseName) {
      query.houseName = houseName;
    }

    if (houseDescription) {
      query.houseDescription = houseDescription;
    }

    try {
      const students = await Student.find(query);

      if (students.length === 0) {
        return res.status(404).json({ status:404, message: 'No students found matching the house filters' });
      }

      res.status(200).json({
        status:200,
        message: 'Students fetched successfully',
        students,
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      
      res.status(500).json({  status:500, message: 'Error fetching students', error });
    }
  }
);
router.get(
  '/filter/house',
  authMiddleware(['principalAccess', 'teacherAccess']), 
  async (req, res) => {
    const { house, houseName, houseDescription } = req.query;

    const query = {};

    if (house) {
      query.house = house; 
    }
    if (houseName) {
      query.houseName = houseName; 
    }

    if (houseDescription) {
      query.houseDescription = houseDescription; 
    }

    try {
      const students = await Student.find(query);

      if (students.length === 0) {
        return res.status(404).json({status:404, message: 'No students found matching the house filters' });
      }

      res.status(200).json({
        status:200,
        message: 'Students fetched successfully',
        students,
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({ status:500,message: 'Error fetching students', error });
    }
  }
);
router.post(
  '/block-reasons',
  authMiddleware(['principalAccess']), 
  async (req, res) => {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        status:400,
        message: 'Both name and description are required.',
      });
    }

    try {
     
      const blockReason = new BlockReason({ name, description });
      await blockReason.save();

      res.status(200).json({
        status:200,
        message: 'Block reason added successfully.',
        blockReason,
      });
    } catch (error) {
      console.error('Error adding block reason:', error);
      res.status(500).json({status:500, message: 'Error adding block reason', error });
    }
  }
);
router.put(
  '/block-reasons/:id', 
  authMiddleware(['principalAccess']), 
  async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        status:400,
        message: 'Both name and description are required.',
      });
    }

    try {
    
      const blockReason = await BlockReason.findByIdAndUpdate(
        id,
        { name, description },
        { new: true }
      );

      if (!blockReason) {
        return res.status(404).json({ status:404,message: 'Block reason not found' });
      }

      res.status(200).json({
        status:200,
        message: 'Block reason updated successfully.',
        blockReason,
      });
    } catch (error) {
      console.error('Error editing block reason:', error);
      
      res.status(500).json({status:500, message: 'Error editing block reason', error });
    }
  }
);
router.delete(
  '/block-reasons/:id',
  authMiddleware(['principalAccess']), 
  async (req, res) => {
    const { id } = req.params;

    try {
      const blockReason = await BlockReason.findByIdAndDelete(id);

      if (!blockReason) {
        return res.status(404).json({ status:404, message: 'Block reason not found' });
      }

      res.status(200).json({
        status:200,
        message: 'Block reason deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting block reason:', error);
      
      res.status(500).json({ status:500,message: 'Error deleting block reason', error });
    }
  }
);
router.get(
  '/block-reasons', 
  async (req, res) => {
    const { name, description } = req.query;

    const query = {};

    if (name) {
      query.name = { $regex: name, $options: 'i' }; 
    }

    if (description) {
      query.description = { $regex: description, $options: 'i' };
    }

    try {
      const blockReasons = await BlockReason.find(query);
      res.status(200).json({
        status:200,
        message: 'Filtered block reasons fetched successfully.',
        blockReasons,
      });
    } catch (error) {
      console.error('Error filtering block reasons:', error);
      res.status(500).json({ status:500,message: 'Error filtering block reasons', error });
    }
  }
);


module.exports = router;
