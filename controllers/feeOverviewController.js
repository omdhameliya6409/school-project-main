const Admission = require('../models/Admission');
const Fee = require('../models/Fee');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

exports.getOverview = async (req, res) => {
  try {
    
    const feeStructure = {
      "9": { sem1: 5000, sem2: 4000 },
      "10": { sem1: 6000, sem2: 5000 },
      "11": { sem1: 7000, sem2: 6000 },
      "12": { sem1: 8000, sem2: 7000 },
    };

    
    const students = await Student.find();
    const totalStudents = students.length;

    let totalFees = 0;
    let totalPaidFeesSem1 = 0;
    let totalPaidFeesSem2 = 0;
    let totalAdmissionFees = 0;

    
    for (const student of students) {
      const studentClass = student.class;

    
      if (feeStructure[studentClass]) {
        totalFees += feeStructure[studentClass].sem1 + feeStructure[studentClass].sem2;
      }

     
      const studentFees = await Fee.aggregate([
        { $match: { studentId: student._id } }, 
        {
          $group: {
            _id: null,
            totalPaidSem1: { $sum: "$sem1.paid" }, 
            totalPaidSem2: { $sum: "$sem2.paid" },
          },
        },
      ]);

      if (studentFees.length > 0) {
        totalPaidFeesSem1 += studentFees[0].totalPaidSem1;
        totalPaidFeesSem2 += studentFees[0].totalPaidSem2;
      }

     
      const admission = await Admission.findOne({ studentId: student._id });
      if (admission && admission.admissionFee) {
        totalAdmissionFees += admission.admissionFee;
      }
    }

  
    const totalPaidFees = totalPaidFeesSem1 + totalPaidFeesSem2;

   
    const totalUnpaidFees = totalFees - totalPaidFees;

   
    const totalAdmissions = await Admission.countDocuments();
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


    const formattedClassSectionWise = classSectionWise.reduce((acc, curr) => {
      if (!acc[curr._id.class]) acc[curr._id.class] = [];
      acc[curr._id.class].push({ section: curr._id.section, totalStudents: curr.totalStudents });
      return acc;
    }, {});

  
    const totalTeachers = await Teacher.countDocuments();


    const teacherClassSectionWise = await Teacher.aggregate([
      {
        $group: {
         
          _id: { class: "$class" }, 
          totalTeachers: { $sum: 1 },  
        }
      },
      {
       
        $sort: { "_id.class": 1 }
      }
    ]);

    
    const formattedTeacherClassSectionWise = teacherClassSectionWise.reduce((acc, curr) => {
      if (!acc[curr._id.class]) acc[curr._id.class] = [];
      acc[curr._id.class].push({ section: curr._id.section, totalTeachers: curr.totalTeachers });
      return acc;
    }, {});

  
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
          totalAdmissionFees,
          classOverview: {
            "9": {
              students: students.filter(student => student.class === "9").length,
              totalFees: feeStructure["9"].sem1 + feeStructure["9"].sem2,
              totalPaidFeesSem1,
              totalPaidFeesSem2,
              totalUnpaidFeesSem1: feeStructure["9"].sem1 * students.filter(student => student.class === "9").length - totalPaidFeesSem1,
              totalUnpaidFeesSem2: feeStructure["9"].sem2 * students.filter(student => student.class === "9").length - totalPaidFeesSem2,
              totalAdmissionFees: students.filter(student => student.class === "9").length * 1000, 
            },
            "10": {
              students: students.filter(student => student.class === "10").length,
              totalFees: feeStructure["10"].sem1 + feeStructure["10"].sem2,
              totalPaidFeesSem1,
              totalPaidFeesSem2,
              totalUnpaidFeesSem1: feeStructure["10"].sem1 * students.filter(student => student.class === "10").length - totalPaidFeesSem1,
              totalUnpaidFeesSem2: feeStructure["10"].sem2 * students.filter(student => student.class === "10").length - totalPaidFeesSem2,
              totalAdmissionFees: students.filter(student => student.class === "10").length * 1200, 
            },
            "11": {
              students: students.filter(student => student.class === "11").length,
              totalFees: feeStructure["11"].sem1 + feeStructure["11"].sem2,
              totalPaidFeesSem1,
              totalPaidFeesSem2,
              totalUnpaidFeesSem1: feeStructure["11"].sem1 * students.filter(student => student.class === "11").length - totalPaidFeesSem1,
              totalUnpaidFeesSem2: feeStructure["11"].sem2 * students.filter(student => student.class === "11").length - totalPaidFeesSem2,
              totalAdmissionFees: students.filter(student => student.class === "11").length * 1500, 
            },
            "12": {
              students: students.filter(student => student.class === "12").length,
              totalFees: feeStructure["12"].sem1 + feeStructure["12"].sem2,
              totalPaidFeesSem1,
              totalPaidFeesSem2,
              totalUnpaidFeesSem1: feeStructure["12"].sem1 * students.filter(student => student.class === "12").length - totalPaidFeesSem1,
              totalUnpaidFeesSem2: feeStructure["12"].sem2 * students.filter(student => student.class === "12").length - totalPaidFeesSem2,
              totalAdmissionFees: students.filter(student => student.class === "12").length * 2000, 
            },
          },
        },
        teacherOverview: {
          totalTeachers,
          teacherClassSectionWise: formattedTeacherClassSectionWise, 
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
