const AssignmentSchedule = require('../models/assignmentschedule');
const Student = require('../models/Student');
const jwt = require('jsonwebtoken');
const Teacher = require('../models/Teacher');
const assignmentschedule = require('../models/assignmentschedule');
const JWT_SECRET = process.env.JWT_SECRET;


exports.createAssignment = async (req, res) => {
    try {
        const { class: className, section, Date, subjectname, assignmentname, submissiondate } = req.body;

        // Check if an assignment with the same class, section, and Date already exists
        const existingAssignment = await AssignmentSchedule.findOne({ class: className, section, Date });
        if (existingAssignment) {
            return res.status(400).json({
                status: 400,
                message: 'An assignment for the same class, section, and date already exists. Please choose a different date.',
            });
        }

        // Get token from the Authorization header
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(401).json({ message: 'Authorization token is missing' });
        }

        // Remove the 'Bearer ' prefix if present
        const tokenWithoutBearer = token.split(' ')[1];

        try {
            // Decode the token to get user data
            const decodedToken = jwt.verify(tokenWithoutBearer, JWT_SECRET);
            const teacherIdFromToken = decodedToken.userId;
            const emailFromToken = decodedToken.email;

            // Find the teacher by email
            const teacher = await Teacher.findOne({ email: emailFromToken });

            if (!teacher) {
                return res.status(404).json({ message: 'Teacher not found' });
            }

            // Check if the teacher's subject matches the one in the request
            if (teacher.subject !== subjectname) {
                return res.status(403).json({ message: 'You are not authorized to create assignments for this subject.' });
            }

            // Proceed to create the new assignment
            const newAssignment = new AssignmentSchedule({
                class: className,
                section,
                Date,
                subjectname,
                assignmentname,
                submissiondate,
                teacherId: teacher._id,  // Add teacherId to the assignment
                status: 'pending'  // Set status to 'pending' by default
            });

            const savedAssignment = await newAssignment.save();
            res.status(200).json({
                status: 200,
                message: 'Assignment created successfully!',
                data: savedAssignment,
            });
        } catch (error) {
            return res.status(500).json({
                message: 'Token validation failed',
                error: error.message
            });
        }

    } catch (error) {
        res.status(500).json({ status: 500, message: 'Error creating assignment', error: error.message });
    }
};



// Get assignments (GET)
exports.getAssignments = async (req, res) => {
    try {
        const assignments = await AssignmentSchedule.find({}, 'Date subjectname assignmentname submissiondate');
        res.status(200).json({
            status : 200,
            message: 'Assignments fetched successfully!',
            data: assignments,
        });
    } catch (error) {
        res.status(500).json({status : 500, message: 'Error fetching assignments', error: error.message });
    }
};
// Update an existing assignment (PUT)
exports.updateAssignment = async (req, res) => {
    try {
        const { id } = req.params; // Assignment ID
        const { class: className, section, Date, subjectname, assignmentname, submissiondate } = req.body;

        // Check if the assignment exists
        const existingAssignment = await AssignmentSchedule.findById(id);
        if (!existingAssignment) {
            return res.status(404).json({
                status : 404,
                message: 'Assignment not found.',
            });
        }

        // Check for duplicate assignments when Date, class, and section are being updated
        if (Date && (className || section)) {
            const duplicate = await AssignmentSchedule.findOne({
                class: className || existingAssignment.class,
                section: section || existingAssignment.section,
                Date: Date,
                _id: { $ne: id }, // Exclude the current assignment
            });

            if (duplicate) {
                return res.status(400).json({
                    status : 400,
                    message: 'An assignment for the same class, section, and date already exists.',
                });
            }
        }

        // Update the assignment
        const updatedAssignment = await AssignmentSchedule.findByIdAndUpdate(
            id,
            { class: className, section, Date, subjectname, assignmentname, submissiondate },
            { new: true, runValidators: true } // Return the updated document
        );

        res.status(200).json({
            status : 200,
            message: 'Assignment updated successfully!',
            data: updatedAssignment,
        });
    } catch (error) {
        res.status(500).json({
            status : 500,
            message: 'Error updating assignment.',
            error: error.message,
        });
    }
};
// Delete an assignment by ID (DELETE)
exports.deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params; // Assignment ID

        // Check if the assignment exists
        const assignment = await AssignmentSchedule.findById(id);
        if (!assignment) {
            return res.status(404).json({
                status : 404,
                message: 'Assignment not found.',
            });
        }

        // Delete the assignment
        await AssignmentSchedule.findByIdAndDelete(id);

        res.status(200).json({
            status : 200,
            message: 'Assignment deleted successfully!',
        });
    } catch (error) {
        res.status(500).json({
            status : 500,
            message: 'Error deleting assignment.',
            error: error.message,
        });
    }
};



// // Controller to create an assignment with students
// exports.addAssignmentWithStudents = async (req, res) => {
//     try {
//       const { class: className, section, assignmentNote, subject, assignmentDate, submissionDate } = req.body;
  
//       // Fetch students based on class and section
//       const students = await Student.find({ class: className, section });
//       if (students.length === 0) {
//         return res.status(404).json({ message: 'No students found for the specified class and section' });
//       }
  
//       // Create student-specific assignment data
//       const studentAssignments = students.map(student => ({
//         rollNo: student.rollNo,
//         name: student.name,
//         status: 'pending', // Default status
//         marks: 0            // Default marks
//       }));
  
//       // Create the new assignment
//       const newAssignment = new AssignmentSchedule({
//         class: className,
//         section,
//         assignmentNote,
//         subject,
//         assignmentDate,
//         submissionDate,
//         students: studentAssignments // Add students to the assignment
//       });
  
//       await newAssignment.save();
//       res.status(201).json({ message: 'Assignment created successfully', assignment: newAssignment });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };


// exports.addAssignmentWithStudents = async (req, res) => {
//     try {
//         const { assignmentNote, subject, assignmentDate, submissionDate, class: className, section } = req.body;

//         // Extract the token from the Authorization header
//         const token = req.headers['authorization'];
//         if (!token) {
//             return res.status(400).json({ message: 'Token is required for authentication.' });
//         }
//         const tokenWithoutBearer = token.split(' ')[1]; // Remove 'Bearer' from token

//         // Decode the token to get user data
//         let decodedToken;
//         try {
//             decodedToken = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET); // Replace with your JWT secret
//             console.log("Decoded token:", decodedToken); // Log the decoded token
//         } catch (error) {
//             console.error("Token verification failed:", error.message); // Log token verification failure
//             return res.status(403).json({ message: 'Token verification failed.' });
//         }

//         // Get teacher's ID and email from the decoded token
//         const teacherIdFromToken = decodedToken.userId;
//         const emailFromToken = decodedToken.email;

//         // Find the teacher by email
//         const teacher = await Teacher.findOne({ email: emailFromToken });
//         if (!teacher) {
//             return res.status(404).json({ message: 'Teacher not found' });
//         }

//         // Check if the teacher's subject matches the one in the request
//         if (teacher.subject !== subject) {
//             return res.status(403).json({ message: 'You are not authorized to create assignments for this subject.' });
//         }

//         console.log("Teacher fetched from DB:", teacher); // Log the teacher data from the database

//         // Fetch students based on class and section
//         const students = await Student.find({ class: className, section });
//         if (students.length === 0) {
//             return res.status(404).json({ message: 'No students found for the specified class and section' });
//         }

//         console.log("Students found:", students); // Log the students found in the database

//         // Create student-specific assignment data
//         const studentAssignments = students.map(student => ({
//             rollNo: student.rollNo,
//             name: student.name,
//             status: 'pending', // Default status
//             marks: 0            // Default marks
//         }));

//         // Create the new assignment
//         const newAssignment = new AssignmentSchedule({
//             class: className,
//             section,
//             assignmentNote,
//             subject,
//             assignmentDate,
//             submissionDate,
//             teacherId: teacher._id, // Assign teacher's _id to the teacherId field
//             teacherName: teacher.name, // Add teacher name for reference
//             students: studentAssignments // Add students to the assignment
//         });

//         await newAssignment.save();
//         console.log("New Assignment created:", newAssignment); // Log the created assignment
//         res.status(201).json({ message: 'Assignment created successfully', assignment: newAssignment });
//     } catch (error) {
//         console.error('Error:', error.message); // Log the error for debugging
//         res.status(500).json({ error: error.message });
//     }
// };
exports.addAssignmentWithStudents = async (req, res) => {
    try {
        const { 
            assignmentNote, 
            subject, 
            assignmentDate, 
            submissionDate, 
            class: className, 
            section, 
            gradeNo, 
            reason, 
            status = 'pending', 
            marks = 0 
        } = req.body;

        // Token Validation
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(400).json({status:400, message: 'Token is required for authentication.' });
        }
        const tokenWithoutBearer = token.split(' ')[1]; 
        let decodedToken;
        try {
            decodedToken = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
        } catch (error) {
            return res.status(403).json({status:400, message: 'Token verification failed.' });
        }

        const teacherIdFromToken = decodedToken.userId;
        const emailFromToken = decodedToken.email;

        // Find the teacher by email
        const teacher = await Teacher.findOne({ email: emailFromToken });
        if (!teacher) {
            return res.status(404).json({ status:404 ,message: 'Teacher not found' });
        }

        if (teacher.subject !== subject) {
            return res.status(403).json({ status:403 , message: 'You are not authorized to create assignments for this subject.' });
        }

        // Fetch students
        const students = await Student.find({ class: className, section });
        if (students.length === 0) {
            return res.status(404).json({ status:404 , message: 'No students found for the specified class and section' });
        }

        // Validate status, gradeNo, and reason
        if (status === 'rejected' && !reason) {
            return res.status(400).json({ status:400 , message: 'Reason is required when rejecting an assignment.' });
        }

        if (status === 'complete' && (!marks || !gradeNo)) {
            return res.status(400).json({ status:400 ,message: 'Marks and gradeNo are required when marking an assignment as complete.' });
        }

        // Create student-specific assignment data
        const studentAssignments = students.map(student => ({
            rollNo: student.rollNo,
            name: student.name,
            status, 
            marks: status === 'complete' ? marks : 0, 
            gradeNo: status === 'complete' ? gradeNo : undefined,
            reason: status === 'rejected' ? reason : undefined
        }));

        // Create the new assignment
        const newAssignment = new AssignmentSchedule({
            class: className,
            section,
            assignmentNote,
            subject,
            assignmentDate,
            submissionDate,
            teacherId: teacher._id,
            teacherName: teacher.name,
            students: studentAssignments
        });

        await newAssignment.save();
        res.status(201).json({ message: 'Assignment created successfully', assignment: newAssignment });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: error.message });
    }
};


// // Controller to update student status and marks by rollNo
// exports.updateAssignmentByRollNo = async (req, res) => {
//     try {
//       const { class: className, section, rollNo } = req.params;
      
//       const { status, marks } = req.body;
  
//       // Find the assignment by class, section, and rollNo
//       const assignment = await AssignmentSchedule.findOne({ class: className, section, "students.rollNo": rollNo });
//       if (!assignment) {
//         return res.status(404).json({ message: 'Assignment not found or student not assigned to this assignment' });
//       }
  
//       // Find the student within the assignment and update status and marks
//       const student = assignment.students.find(s => s.rollNo === parseInt(rollNo));
//       if (!student) {
//         return res.status(404).json({ message: 'Student not found in this assignment' });
//       }
  
//       // Update the student's status and marks
//       student.status = status || student.status;
//       student.marks = marks !== undefined ? marks : student.marks;
  
//       // Save the updated assignment
//       await assignment.save();
  
//       res.status(200).json({ message: 'Student status and marks updated successfully', assignment });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   };
// Controller to update student status, marks, gradeNo, and reason by rollNo
exports.updateAssignmentByRollNo = async (req, res) => {
    try {
        const { class: className, section, rollNo } = req.params;
        const { status, submission, marks, gradeNo, reason } = req.body;

        // Find the assignment by class, section, and rollNo
        const assignment = await AssignmentSchedule.findOne({
            class: className,
            section,
            "students.rollNo": rollNo
        });

        if (!assignment) {
            return res.status(404).json({
                message: 'Assignment not found or student not assigned to this assignment'
            });
        }

        // Find the student within the assignment
        const student = assignment.students.find(s => s.rollNo === parseInt(rollNo));
        if (!student) {
            return res.status(404).json({ message: 'Student not found in this assignment' });
        }

        // Ensure status is valid
        const validStatuses = ['pending', 'complete', 'rejected'];
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status. It must be "pending", "complete", or "rejected".' });
        }

        // Handle the status update
        if (status === 'complete') {
            if (!submission) {
                return res.status(400).json({ message: 'Submission type (accept or reject) is required when status is complete.' });
            }

            if (submission === 'accept') {
                // If submission is accept, ask for grade and marks
                if (!gradeNo || marks === undefined) {
                    return res.status(400).json({ message: 'GradeNo and Marks are required when submission is accept.' });
                }
                student.gradeNo = gradeNo; // Set gradeNo
                student.marks = marks;     // Set marks
                student.reason = undefined; // Clear reason if any
            } else if (submission === 'reject') {
                // If submission is reject, ask for reason
                if (!reason) {
                    return res.status(400).json({ message: 'Reason is required when submission is reject.' });
                }
                student.reason = reason; // Set reason
                student.gradeNo = undefined; // Clear gradeNo if any
                student.marks = 0; // Set marks to 0 if rejected
            } else {
                return res.status(400).json({ message: 'Invalid submission type. It must be "accept" or "reject".' });
            }
        } else if (status === 'rejected') {
            // If status is rejected, reason is required
            if (!reason) {
                return res.status(400).json({ message: 'Reason is required when status is rejected.' });
            }
            student.reason = reason; // Update reason for rejection
            student.gradeNo = undefined; // Clear gradeNo
            student.marks = 0; // Reset marks to 0 for rejected students
        }

        // Update the student's status and submission
        student.status = status || student.status; // If no status passed, keep the existing one
        student.submission = submission || student.submission; // Update submission type

        // Save the updated assignment
        await assignment.save();

        res.status(200).json({
            message: 'Student status, marks, grade, reason, and submission updated successfully',
            assignment: {
                ...assignment.toObject(), // Convert assignment to a plain object
                students: assignment.students.map(s => ({
                    ...s.toObject(), // Convert student to a plain object
                    submission: s.submission || null, // Ensure submission is included
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

  
  
  // Controller to get assignment along with teacher's details
exports.getAssignmentWithTeacher = async (req, res) => {
    try {
      const { class: className, section } = req.params;
  
      // Fetch the assignment based on class and section
      const assignment = await AssignmentSchedule.findOne({ class: className, section })
        .populate({
          path: 'assignedTeacher', // Populating the assigned teacher
          select: 'name _id' // Only include name and teacher ID (_id)
        });
  
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found for the specified class and section' });
      }
  
      // Returning the assignment with the teacher's details
      const assignmentWithTeacher = {
        ...assignment.toObject(),
        teacher: {
          name: assignment.assignedTeacher?.name,
          teacherId: assignment.assignedTeacher?._id
        }
      };
  
      res.status(200).json({ assignment: assignmentWithTeacher });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  
  
  




  exports.getAssignments = async (req, res) => {
    try {
      const { class: classFilter, section } = req.query; // Extract class and section from query params
  
      // Build the query dynamically based on the provided filters
      const query = {};
      if (classFilter) query.class = classFilter;
      if (section) query.section = section;
  
      // Fetch assignments based on the query
      const assignments = await AssignmentSchedule.find(query)
        .populate({
          path: 'students', // Populate students if referenced
          select: 'rollNo name status marks', // Choose specific fields to return
        });
  
      // Check if no assignments are found
      if (!assignments || assignments.length === 0) {
        return res.status(404).json({
          status: 404,
          message: 'No assignments found for the provided filters',
        });
      }
  
      // Respond with the filtered assignments
      res.status(200).json({
        status: 200,
        message: 'Assignments fetched successfully',
        assignments,
      });
    } catch (error) {
      console.error('Error fetching assignments:', error.message);
      res.status(500).json({
        status: 500,
        message: 'Error fetching assignments',
        error: error.message,
      });
    }
  };
  
  
  exports.getFilteredAssignments = async (req, res) => {
    try {
      const { class: classFilter, section } = req.query; // Extract from query parameters
  
      // Validate required parameters
      if (!classFilter || !section) {
        return res.status(400).json({
          status: 400,
          message: 'Class and section are required query parameters.',
        });
      }
  
      // Query the database for assignments
      const assignments = await AssignmentSchedule.find({
        class: classFilter,
        section: section,
      }).select('assignmentNote subject assignmentDate submissionDate');
  
      // Check if no assignments match the query
      if (!assignments || assignments.length === 0) {
        return res.status(404).json({
          status: 404,
          message: 'No assignments found for the provided class and section.',
        });
      }
  
      // Return the filtered assignments
      res.status(200).json({
        status: 200,
        message: 'Assignments fetched successfully.',
        assignments,
      });
    } catch (error) {
      console.error('Error fetching assignments:', error.message);
      res.status(500).json({
        status: 500,
        message: 'Error fetching assignments.',
        error: error.message,
      });
    }
  };



  // Controller method to filter assignments by grade
  exports.filterAssignmentsByGrade = async (req, res) => {
      try {
          const { class: className, section, gradeNo } = req.query;
  
          // Check if all required query parameters are present
          if (!className || !section || !gradeNo) {
              return res.status(400).json({
                  status: 400,
                  message: 'Missing required query parameters: class, section, and gradeNo are required.'
              });
          }
  
          // Query to find assignments that match class, section, and students' gradeNo
          const assignments = await AssignmentSchedule.find({
              class: className,
              section: section,
              'students.gradeNo': gradeNo // This filters for students who have the specified gradeNo
          });
  
          // Filter students in the found assignments to include only those with the specified gradeNo
          assignments.forEach(assignment => {
              assignment.students = assignment.students
                  .filter(student => student.gradeNo === gradeNo) // Keep only students with the requested gradeNo
                  .map(student => ({ gradeNo: student.gradeNo })); // Only return gradeNo
          });
  
          // Filter out assignments that don't have any students with the requested gradeNo
          const filteredAssignments = assignments.filter(assignment => assignment.students.length > 0);
  
          // If no assignments are found, send a not found response
          if (filteredAssignments.length === 0) {
              return res.status(404).json({
                  status: 404,
                  message: 'No assignments found for the provided filters.'
              });
          }
  
          // Return the filtered assignments
          return res.status(200).json({
              status: 200,
              message: 'Filtered assignments fetched successfully.',
              assignments: filteredAssignments
          });
  
      } catch (error) {
          return res.status(500).json({
              status: 500,
              message: 'Error fetching assignments',
              error: error.message
          });
      }
  };
  
  
  
  