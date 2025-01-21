const SubjectMarksReport = require("../models/SubjectMarksReport"); 

exports.createSubjectMarksReport = async (req, res) => {
    const { admissionNo, name, rollNo, class: studentClass, section, subject, totalmarks, marksobtained, passorfail, date ,examtype} = req.body;

    try {
        const existingReport = await SubjectMarksReport.findOne({ admissionNo, subject });
        if (existingReport) {
            return res.status(400).json({
                message: `A report for admissionNo ${admissionNo} and subject '${subject}' already exists.`,
            });
        }


        const report = new SubjectMarksReport({
            admissionNo,
            name,
            rollNo,
            class: studentClass,
            section,
            subject,
            totalmarks,
            marksobtained,
            passorfail,
            date,
            examtype,
        });

        
        await report.save();

       
        res.status(201).json({
            message: "Subject Marks Report created successfully",
            data: report,
        });
    } catch (error) {
        console.error("Error creating report:", error);
        res.status(500).json({
            message: "Failed to create report",
            error: error.message,
        });
    }
};


exports.editSubjectMarksReport = async (req, res) => {
    const { id } = req.params;  
    const { admissionNo, name, rollNo, class: studentClass, section, subject, totalmarks, marksobtained, passorfail, date ,examtype} = req.body;

    try {
       
        const existingReport = await SubjectMarksReport.findOne({
            admissionNo,
            subject,
            _id: { $ne: id },
        });

        if (existingReport) {
            return res.status(400).json({
                message: `A report for admissionNo ${admissionNo} and subject '${subject}' already exists.`,
            });
        }

       
        const report = await SubjectMarksReport.findById(id);
        if (!report) {
            return res.status(404).json({
                message: "Report not found",
            });
        }

        
        report.admissionNo = admissionNo;
        report.name = name;
        report.rollNo = rollNo;
        report.class = studentClass;
        report.section = section;
        report.subject = subject;
        report.totalmarks = totalmarks;
        report.marksobtained = marksobtained;
        report.passorfail = passorfail;
        report.date = date;  
        report.examtype = examtype;

        
        const updatedReport = await report.save();

      
        res.status(200).json({
            message: "Subject Marks Report updated successfully",
            data: updatedReport,
        });
    } catch (error) {
        console.error("Error updating report:", error);
        res.status(500).json({
            message: "Failed to update report",
            error: error.message,
        });
    }
};

exports.deleteSubjectMarksReport = async (req, res) => {
    const { id } = req.params;  

    try {
       
        const deletedReport = await SubjectMarksReport.findByIdAndDelete(id);

      
        if (!deletedReport) {
            return res.status(404).json({
                message: "Report not found",
            });
        }

        
        res.status(200).json({
            message: "Subject Marks Report deleted successfully",
            data: deletedReport,
        });
    } catch (error) {
        console.error("Error deleting report:", error);
        res.status(500).json({
            message: "Failed to delete report",
            error: error.message,
        });
    }
};



exports.getAllSubjectMarksReports = async (req, res) => {
    try {
        const { class: studentClass, section, examtype } = req.query;

       
        if (!studentClass || !section || !examtype) {
            return res.status(400).json({
                message: "Missing required filters: class, section, and examtype are required.",
            });
        }

       
        const filter = {
            class: studentClass,
            section: section,
            examtype: examtype
        };

       
        const reports = await SubjectMarksReport.find(filter);

  
        if (reports.length === 0) {
            return res.status(404).json({
                message: "No reports found for the specified filters",
            });
        }

        res.status(200).json({
            message: "Subject Marks Reports fetched successfully",
            data: reports,
        });
    } catch (error) {
        console.error("Error fetching reports:", error);
        res.status(500).json({
            message: "Failed to fetch reports",
            error: error.message,
        });
    }
};
