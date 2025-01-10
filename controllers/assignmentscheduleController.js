const AssignmentSchedule = require('../models/assignmentschedule');

// Create a new assignment (POST)
exports.createAssignment = async (req, res) => {
    try {
        const { class: className, section, Date, subjectname, assignmentname, submissiondate } = req.body;

        // Check if an assignment with the same class, section, and Date already exists
        const existingAssignment = await AssignmentSchedule.findOne({ class: className, section, Date });
        if (existingAssignment) {
            return res.status(400).json({
                status : 400,
                message: 'An assignment for the same class, section, and date already exists. Please choose a different date.',
            });
        }

        // Proceed to create the new assignment
        const newAssignment = new AssignmentSchedule({
            class: className,
            section,
            Date,
            subjectname,
            assignmentname,
            submissiondate,
        });

        const savedAssignment = await newAssignment.save();
        res.status(200).json({
            status : 200,
            message: 'Assignment created successfully!',
            data: savedAssignment,
        });
    } catch (error) {
        res.status(500).json({ status : 500,message: 'Error creating assignment', error: error.message });
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