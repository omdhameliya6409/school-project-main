// const bcrypt = require('bcrypt');
// const Teacher = require('../models/Teacher');
// const User = require('../models/User'); // Assuming User is the authentication model

// const addTeacher = async (req, res) => {
//   try {
//     const {
//       teacherId,
//       name,
//       experience,
//       class: teacherClass,
//       subject,
//       section,
//       mobileNumber,
//       email,
//       password,
//       joinDate,
//       gender,
//       dateOfBirth,
//     } = req.body;

//     // Validate that all required fields are provided
//     if (
//       !teacherId ||
//       typeof teacherId !== 'number' ||
//       !name ||
//       !experience ||
//       !teacherClass ||
//       !subject ||
//       !section ||
//       !mobileNumber ||
//       !email ||
//       !password ||
//       !joinDate ||
//       !gender ||
//       !dateOfBirth
//     ) {
//       return res.status(400).json({ message: 'All fields are required, and teacherId must be a number.' });
//     }

//     // Validate the format of the date fields (joinDate and dateOfBirth)
//     const isValidJoinDate = !isNaN(Date.parse(joinDate));
//     const isValidDateOfBirth = !isNaN(Date.parse(dateOfBirth));
//     if (!isValidJoinDate || !isValidDateOfBirth) {
//       return res.status(400).json({ message: 'Invalid date format for joinDate or dateOfBirth.' });
//     }

//     // Check if teacherId or email already exists in Teacher model
//     const existingTeacher = await Teacher.findOne({ $or: [{ teacherId }, { email }] });
//     if (existingTeacher) {
//       return res.status(400).json({ message: 'Teacher with this ID or email already exists.' });
//     }

//     // Check if email already exists in User model
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: 'User with this email already exists.' });
//     }

//     // Hash the password before saving (using bcrypt)
//     const hashedPassword = await bcrypt.hash(password, 10); // Salt rounds = 10 (adjust as needed)

//     // Create and save a new teacher
//     const newTeacher = new Teacher({
//       teacherId,
//       name,
//       experience,
//       class: teacherClass,
//       subject,
//       section,
//       mobileNumber,
//       email,
//       password: hashedPassword, // Store hashed password in the database
//       joinDate,
//       gender,
//       dateOfBirth,
//     });

//     // Create and save a new user for authentication
//     const firstName = name.split(' ')[0]; // Extract first name
//     const lastName = name.split(' ').slice(1).join(' ') || ''; // Extract last name if available
//     const newUser = new User({
//       email,
//       password: hashedPassword, // Store the same hashed password
//       username: `${firstName} ${lastName}`,
//       principalAccess: false,
//       teacherAccess: true,
//       studentAccess: false, // Assuming teachers won’t have student access
//     });

//     // Save both Teacher and User to the database
//     const savedTeacher = await newTeacher.save();
//     const savedUser = await newUser.save();

//     // Return success response
//     res.status(200).json({
//       message: 'Teacher and user account created successfully.',
//       teacher: savedTeacher,
//       user: savedUser,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error.', error: error.message });
//   }
// };

// module.exports = { addTeacher };
const Teacher = require('../models/Teacher');
const User = require('../models/User'); // Assuming User is the authentication model

const addTeacher = async (req, res) => {
  try {
    const {
      teacherId,
      name,
      experience,
      class: teacherClass,
      subject,
      section,
      mobileNumber,
      email,
      password,
      joinDate,
      gender,
      dateOfBirth,
      category,
    } = req.body;

    // Log the incoming request body for debugging
    console.log(req.body);

    // Validate that all required fields are provided and correct type for teacherId
    if (
      !teacherId ||
      typeof teacherId !== 'number' ||
      !name ||
      !experience ||
      !teacherClass ||
      !subject ||
      !section ||
      !mobileNumber ||
      !email ||
      !password ||
      !joinDate ||
      !gender ||
      !dateOfBirth ||
      !category
    ) {
      return res.status(400).json({ status:400 , message: 'All fields are required, and teacherId must be a number.' });
    }

    // Validate the format of the date fields (joinDate and dateOfBirth)
    const isValidJoinDate = !isNaN(Date.parse(joinDate));
    const isValidDateOfBirth = !isNaN(Date.parse(dateOfBirth));
    if (!isValidJoinDate || !isValidDateOfBirth) {
      return res.status(400).json({ status:400 ,message: 'Invalid date format for joinDate or dateOfBirth.' });
    }

    // Check if teacherId or email already exists in Teacher model
    const existingTeacher = await Teacher.findOne({ $or: [{ teacherId }, { email }] });
    if (existingTeacher) {
      return res.status(400).json({ status:400 , message: 'Teacher with this ID or email already exists.' });
    }

    // Check if email already exists in User model
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status:400 , message: 'User with this email already exists.' });
    }

    // Create and save a new teacher with the category
    const newTeacher = new Teacher({
      teacherId,
      name,
      experience,
      class: teacherClass,
      subject,
      section,
      mobileNumber,
      email,
      password, // Store password as plain text
      joinDate,
      gender,
      dateOfBirth,
      category,  // Store the category of the teacher
    });

    // Create and save a new user for authentication
    const firstName = name.split(' ')[0]; // Extract first name
    const lastName = name.split(' ').slice(1).join(' ') || ''; // Extract last name if available
    const newUser = new User({
      email,
      password, // Store password as plain text
      username: `${firstName} ${lastName}`,
      principalAccess: false,
      teacherAccess: true,
      studentAccess: true, // Teachers don’t have student access by default
    });

    // Save both Teacher and User to the database
    const savedTeacher = await newTeacher.save();
    const savedUser = await newUser.save();

    // Return success response
    res.status(200).json({
      status:200 ,
      message: 'Teacher and user account created successfully.',
      teacher: savedTeacher,
      user: savedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status:500 ,message: 'Server error.', error: error.message });
  }
};

const getTeacherList = async (req, res) => {
  try {
    // Destructure class and section from the query parameters
    const { class: teacherClass, section } = req.query;

    // Validate that at least one filter is provided (class or section)
    if (!teacherClass && !section) {
      return res.status(400).json({ status:400 , message: 'Class or section must be provided as query parameters.' });
    }

    // Build the filter object for the query
    const filter = {};
    if (teacherClass) {
      filter.class = teacherClass;  // Add class filter if provided
    }
    if (section) {
      filter.section = { $in: section.split(',') };  // Split and match the section filter if provided
    }

    // Find teachers based on the filter criteria
    const teachers = await Teacher.find(filter);

    // If no teachers found, return a message
    if (teachers.length === 0) {
      return res.status(404).json({ status:404 , essage: 'No teachers found for the given class and/or section.' });
    }

    // Return the list of teachers
    res.status(200).json({
      status:200 ,
      message: 'Teacher list fetched successfully.',
      teachers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status:500 ,message: 'Server error.', error: error.message });
  }
};


module.exports = { addTeacher , getTeacherList};
