import TeacherAttendance from '../models/teacherAttendanceModel.js';
import Teachers from '../models/teachersModel.js';


export const recordAttendance = async (req, res) => {
  try {
    const { teacherId, date, status, checkIn, checkOut, notes } = req.body;

    // Validate required fields
    if (!teacherId || !status) {
      return res.status(400).json({ message: 'Teacher ID and status are required' });
    }

    // Check if teacher exists
    const teacher = await Teachers.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    // Check for existing attendance record for same date
    const existingAttendance = await TeacherAttendance.findOne({
      teacher: teacherId,
      date: new Date(date)
    });

    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already recorded for this date' });
    }

    const attendance = new TeacherAttendance({
      teacher: teacherId,
      date: date || new Date(),
      status,
      checkIn,
      checkOut,
      notes,
      recordedBy: req.user.id
    });

    await attendance.save();

    // Populate referenced data for response
    const populatedAttendance = await TeacherAttendance.findById(attendance._id)
      .populate('teacher', 'name email')
      .populate('recordedBy', 'name');

    res.status(201).json({
      success: true,
      data: populatedAttendance,
      date: populatedAttendance.date.toISOString().split('T')[0]
    });

  } catch (error) {
    console.error('Error recording attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export const getAttendance = async (req, res) => {
  try {
    const { from, to, teacherId } = req.query;
    const query = {};

    // Date range filter
    if (from && to) {
      query.date = {
        $gte: new Date(from),
        $lte: new Date(to)
      };
    }

    // Filter by specific teacher
    if (teacherId) {
      query.teacher = teacherId;
    }

    const attendance = await TeacherAttendance.find(query)
      .populate('teacher', 'name email phone')
      .populate('recordedBy', 'name')
      .sort({ date: -1 }); // Newest first

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

export const getTeachersAttendanceByDate = async (req, res) => {
  try {
    const { date, teacherId } = req.query;
    const query = {};

    // Validate date parameter
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required (YYYY-MM-DD format)'
      });
    }

    // Create date range for the entire day
    const startDate = new Date(date);
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 1); // Next day at 00:00:00

    query.date = {
      $gte: startDate,
      $lt: endDate
    };

    // Filter by specific teacher if provided
    if (teacherId) {
      query.teacher = teacherId;
    }

    const attendance = await TeacherAttendance.find(query)
      .populate('teacher', 'name email phone')
      .populate('recordedBy', 'name')
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      date: date,
      count: attendance.length,
      data: attendance
    });

  } catch (error) {
    console.error('Error fetching attendance by date:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance records'
    });
  }
};

export const updateAttendance = async (req, res) => {
  try {
    const { status, checkIn, checkOut, notes } = req.body;
    const attendanceId = req.params.id;

    const attendance = await TeacherAttendance.findById(attendanceId);
    if (!attendance) {
      return res.status(404).json({ message: 'Attendance record not found' });
    }

    // Update fields
    attendance.status = status || attendance.status;
    attendance.checkIn = checkIn || attendance.checkIn;
    attendance.checkOut = checkOut || attendance.checkOut;
    attendance.notes = notes || attendance.notes;

    const updatedAttendance = await attendance.save();

    res.status(200).json({
      success: true,
      data: updatedAttendance
    });

  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};


export const deleteAttendance = async (req, res) => {
  try {
    const attendance = await TeacherAttendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};