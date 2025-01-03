// const Examgroup = require('../models/examgroup');

// // Function to add a new Examgroup
// exports.addExamgroup = async (req, res) => {
//     try {
//         const { examtype } = req.body; // Extract examtype from the request body

//         // Create the new Examgroup
//         const examgroup = await Examgroup.create(req.body);

//         res.status(200).json({ status: 200, message: 'Examgroup added successfully', data: examgroup });
//     } catch (err) {
//         // If the error is due to a duplicate `examtype`, handle it
//         if (err.code === 11000) { // Duplicate error code in MongoDB
//             return res.status(400).json({ status: 400, message: 'Exam type already exists' });
//         }
//         res.status(500).json({ status: 500, error: err.message });
//     }
// };

// // Function to update an existing Examgroup by ID
// exports.updateExamgroup = async (req, res) => {
//     try {
//         const { id } = req.params; // Get the Examgroup ID from request parameters
//         const updatedData = req.body; // Get the updated data from request body

//         // Find and update the Examgroup by ID
//         const updatedExamgroup = await Examgroup.findByIdAndUpdate(
//             id,                 // ID of the document to update
//             updatedData,        // Data to update with
//             { new: true, runValidators: true } // Options: return updated document and validate
//         );

//         if (!updatedExamgroup) {
//             return res.status(404).json({ status: 404, message: 'Examgroup not found' });
//         }

//         res.status(200).json({ status: 200, message: 'Examgroup updated successfully', data: updatedExamgroup });
//     } catch (err) {
//         res.status(500).json({ status: 500, error: err.message });
//     }
// };

// // Function to delete an Examgroup by ID
// exports.deleteExamgroup = async (req, res) => {
//     try {
//         const { id } = req.params; // Get the Examgroup ID from request parameters

//         // Find and delete the Examgroup by ID
//         const deletedExamgroup = await Examgroup.findByIdAndDelete(id);

//         if (!deletedExamgroup) {
//             return res.status(404).json({ status: 404, message: 'Examgroup not found' });
//         }

//         res.status(200).json({ status: 200, message: 'Examgroup deleted successfully', data: deletedExamgroup });
//     } catch (err) {
//         res.status(500).json({ status: 500, error: err.message });
//     }
// };


// // Function to get all Examgroups
// exports.getAllExamgroups = async (req, res) => {
//     try {
//         // Fetch all Examgroups from the database
//         const examgroups = await Examgroup.find();

//         if (!examgroups || examgroups.length === 0) {
//             return res.status(404).json({ status: 404, message: 'No examgroups found' });
//         }

//         res.status(200).json({ status: 200, message: 'Examgroups retrieved successfully', data: examgroups });
//     } catch (err) {
//         res.status(500).json({ status: 500, error: err.message });
//     }
// };
