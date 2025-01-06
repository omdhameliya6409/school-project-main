const Admission = require('../models/Admission');
const Fee = require('../models/Fee');
const Student = require('../models/Student');

exports.getOverview = async (req, res) => {
  try {
    // Fee structure for each class
    const feeStructure = {
      "9": { sem1: 5000, sem2: 4000 },
      "10": { sem1: 6000, sem2: 5000 },
      "11": { sem1: 7000, sem2: 6000 },
      "12": { sem1: 8000, sem2: 7000 },
    };

    // Fetch all students from the database
    const students = await Student.find();
    const totalStudents = students.length;

    let totalFees = 0;
    let totalPaidFeesSem1 = 0;
    let totalPaidFeesSem2 = 0;

    // Iterate through each student and calculate fees
    for (const student of students) {
      const studentClass = student.class;

      // Calculate total fees for this student based on their class
      if (feeStructure[studentClass]) {
        totalFees += feeStructure[studentClass].sem1 + feeStructure[studentClass].sem2;
      }

      // Fetch and sum the fees paid for this student (sem1 and sem2)
      const studentFees = await Fee.aggregate([
        { $match: { studentId: student._id } }, // Match the student by their ID
        {
          $group: {
            _id: null,
            totalPaidSem1: { $sum: "$sem1.paid" }, // Sum for semester 1
            totalPaidSem2: { $sum: "$sem2.paid" }, // Sum for semester 2
          },
        },
      ]);

      if (studentFees.length > 0) {
        totalPaidFeesSem1 += studentFees[0].totalPaidSem1;
        totalPaidFeesSem2 += studentFees[0].totalPaidSem2;
      }
    }

    // Calculate total paid fees after the loop
    const totalPaidFees = totalPaidFeesSem1 + totalPaidFeesSem2;

    // Calculate unpaid fees (total fees - paid fees)
    const totalUnpaidFees = totalFees - totalPaidFees;

    // Get the total number of admissions
    const totalAdmissions = await Admission.countDocuments();

    // Get distinct classes and count students per class (e.g., 9, 10, 11, 12)
    const classWiseAdmissions = await Admission.aggregate([
      {
        $group: {
          _id: "$class",  
          totalStudents: { $sum: 1 },  
        }
      },
      {
        $sort: { _id: 1 }  
      }
    ]);

    // Get the distinct sections and their counts per class
    const classSectionWise = await Admission.aggregate([
      {
        $group: {
          _id: { class: "$class", section: "$section" },  
          totalStudents: { $sum: 1 }, 
        }
      },
      {
        $sort: { "_id.class": 1, "_id.section": 1 }  
      }
    ]);

    // Format the class and section data for better readability
    const formattedClassSectionWise = classSectionWise.reduce((acc, curr) => {
      if (!acc[curr._id.class]) acc[curr._id.class] = [];
      acc[curr._id.class].push({ section: curr._id.section, totalStudents: curr.totalStudents });
      return acc;
    }, {});

    // Return the combined overview data
    return res.status(200).json({
      status: 200,
      message: "Overview retrieved successfully",
      data: {
        admissionOverview: {
          totalAdmissions,
          classWiseAdmissions,
          classSectionWise: formattedClassSectionWise,
        },
        feeOverview: {
          totalStudents,
          totalFees,
          totalPaidFees,
          totalUnpaidFees,
          classOverview: {
            "9": {
              students: students.filter(student => student.class === "9").length,
              totalFees: feeStructure["9"].sem1 + feeStructure["9"].sem2,
              totalPaidFeesSem1,
              totalPaidFeesSem2,
              totalUnpaidFeesSem1: feeStructure["9"].sem1 * students.filter(student => student.class === "9").length - totalPaidFeesSem1,
              totalUnpaidFeesSem2: feeStructure["9"].sem2 * students.filter(student => student.class === "9").length - totalPaidFeesSem2,
            },
            "10": {
              students: students.filter(student => student.class === "10").length,
              totalFees: feeStructure["10"].sem1 + feeStructure["10"].sem2,
              totalPaidFeesSem1,
              totalPaidFeesSem2,
              totalUnpaidFeesSem1: feeStructure["10"].sem1 * students.filter(student => student.class === "10").length - totalPaidFeesSem1,
              totalUnpaidFeesSem2: feeStructure["10"].sem2 * students.filter(student => student.class === "10").length - totalPaidFeesSem2,
            },
            "11": {
              students: students.filter(student => student.class === "11").length,
              totalFees: feeStructure["11"].sem1 + feeStructure["11"].sem2,
              totalPaidFeesSem1,
              totalPaidFeesSem2,
              totalUnpaidFeesSem1: feeStructure["11"].sem1 * students.filter(student => student.class === "11").length - totalPaidFeesSem1,
              totalUnpaidFeesSem2: feeStructure["11"].sem2 * students.filter(student => student.class === "11").length - totalPaidFeesSem2,
            },
            "12": {
              students: students.filter(student => student.class === "12").length,
              totalFees: feeStructure["12"].sem1 + feeStructure["12"].sem2,
              totalPaidFeesSem1,
              totalPaidFeesSem2,
              totalUnpaidFeesSem1: feeStructure["12"].sem1 * students.filter(student => student.class === "12").length - totalPaidFeesSem1,
              totalUnpaidFeesSem2: feeStructure["12"].sem2 * students.filter(student => student.class === "12").length - totalPaidFeesSem2,
            },
          },
        },
      },
    });
  } catch (error) {
    console.error("Error fetching overview:", error);
    return res.status(500).json({
      status: 500,
      message: "An error occurred while fetching the overview",
    });
  }
};
