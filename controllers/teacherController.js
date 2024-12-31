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
//     res.status(201).json({
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
    } = req.body;

    // Validate that all required fields are provided
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
      !dateOfBirth
    ) {
      return res.status(400).json({ message: 'All fields are required, and teacherId must be a number.' });
    }

    // Validate the format of the date fields (joinDate and dateOfBirth)
    const isValidJoinDate = !isNaN(Date.parse(joinDate));
    const isValidDateOfBirth = !isNaN(Date.parse(dateOfBirth));
    if (!isValidJoinDate || !isValidDateOfBirth) {
      return res.status(400).json({ message: 'Invalid date format for joinDate or dateOfBirth.' });
    }

    // Check if teacherId or email already exists in Teacher model
    const existingTeacher = await Teacher.findOne({ $or: [{ teacherId }, { email }] });
    if (existingTeacher) {
      return res.status(400).json({ message: 'Teacher with this ID or email already exists.' });
    }

    // Check if email already exists in User model
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Create and save a new teacher with the plain text password
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
    });

    // Create and save a new user for authentication with the plain text password
    const firstName = name.split(' ')[0]; // Extract first name
    const lastName = name.split(' ').slice(1).join(' ') || ''; // Extract last name if available
    const newUser = new User({
      email,
      password, // Store password as plain text
      username: `${firstName} ${lastName}`,
      principalAccess: false,
      teacherAccess: true,
      studentAccess: false, // Assuming teachers won’t have student access
    });

    // Save both Teacher and User to the database
    const savedTeacher = await newTeacher.save();
    const savedUser = await newUser.save();

    // Return success response
    res.status(201).json({
      message: 'Teacher and user account created successfully.',
      teacher: savedTeacher,
      user: savedUser,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
};

module.exports = { addTeacher };
