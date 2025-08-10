import Health from "../models/healthModel.js";
import Student from "../models/studentsModel.js";



export const addHealthRecord = async (req, res) => {
  try {

    const { student , date , condition , treated , note } = req.body;


    if (!student || !date || !condition || treated === undefined) {
      return res.status(400).json({ message: "Fadlan buuxi dhammaan meelaha banan" });
    }

    const healthRecord = new Health({
      student,
      date: date ? new Date(date) : new Date(),
      condition,
      treated,
      note: note || ""
    })

    // Check if the student exists

    const existingStudent = await healthRecord.populate("student");

    if (!existingStudent.student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // push the Health record to the student's healthRecords array
    existingStudent.student.healthRecords.push(healthRecord._id);
    await existingStudent.student.save();



    await healthRecord.save();

    return res.status(201).json({ message: "Diiwaanka caafimaadka si guul leh ayaa loo abuuray", healthRecord });
    
  } catch (error) {
    console.error("Error creating Health record:", error);
    return res.status(500).json({ message: "Error creating Health record" });
  }
}



export const getStudentHealthRecords = async (req, res) => {
   const  { studentId  } = req.params;

   try {
       const student = await Student.findById(studentId).populate("healthRecords");
       if (!student) {
           return res.status(404).json({ message: "Arday lama helin" });
       }

       res.status(200).json({ studentHealthRecords: student.healthRecords });
   } catch (error) {
       console.error("Error fetching Health records:", error);
       res.status(500).json({ message: "Error fetching Health records" });
   }
}

export const getAllHealthRecords = async (req, res) => {
  try {

    const healthRecords = await Health.find({}).populate("student").sort({ createdAt: -1 });

    if (!healthRecords) {
      return 
    }


    res.status(200).json({ healthRecords });
    
  } catch (error) {
    console.error("Error fetching all Health records:", error);
    res.status(500).json({ message: "Error fetching all Health records" });
  }
}



export const updateHealthRecord = async (req, res) => {
  try {
    const { healthId } = req.params;
    const { date, condition, treated, note } = req.body;

    const existingRecord = await Health.findById(healthId);
    if (!existingRecord) {
      return res.status(404).json({ message: "Health record not found" });
    }

    const updatedData = {
      date: date ? new Date(date) : existingRecord.date,
      condition: condition || existingRecord.condition,
      treated: treated !== undefined ? treated : existingRecord.treated,
      note: note || existingRecord.note
    };

    const updated = await Health.findByIdAndUpdate(healthId, updatedData, {
      new: true
    });

    res.status(200).json({
      message: "Health record updated successfully",
      Health: updated
    });
  } catch (error) {
    console.error("Error updating Health record:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteHealthRecord = async (req, res) => {
  try {
    const { healthId } = req.params;

    const health = await Health.findById(healthId);
    if (!health) {
      return res.status(404).json({ message: "Health record not found" });
    }

    // Remove reference from Student model
    await Student.findByIdAndUpdate(health.student, {
      $pull: { healthRecords: healthId }
    });

    await Health.findByIdAndDelete(healthId);

    res.status(200).json({ message: "Health record deleted successfully" });
  } catch (error) {
    console.error("Error deleting health record:", error);
    res.status(500).json({ message: error.message });
  }
};
