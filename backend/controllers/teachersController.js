import Teachers from "../models/teachersModel.js";
import cloudinary from "../lib/cloudinary.js";

// Helper function to extract the public ID from a Cloudinary URL.
const getPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.includes('cloudinary.com')) {
    return null;
  }
  const parts = url.split('/');
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex === -1) {
    return null;
  }
  
  // The path starts after 'upload/v...'
  const pathParts = parts.slice(uploadIndex + 2);
  const filenameWithExtension = pathParts.pop();
  const filename = filenameWithExtension.split('.')[0];
  
  // Reconstruct the public ID with the folder path
  const folderPath = pathParts.join('/');
  return folderPath ? `${folderPath}/${filename}` : filename;
};

// 1. Abuur Macallin Cusub
export const createTeacher = async (req, res) => {
  try {
    const { name, number, email, subject } = req.body;
    const profilePictureFile = req.files?.profilePicture?.[0];
    const certificateFile = req.files?.certificate?.[0];

    if (!name || !number || !email || !subject) {
      return res.status(400).json({ message: "Fadlan buuxi dhammaan meelaha loo baahan yahay" });
    }

    const existingTeacher = await Teachers.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Macallin email-kan hore ayaa loo diiwaangaliyay" });
    }

    // ✅ Upload profile picture
    let uploadedProfile = "no profile picture";
    if (profilePictureFile) {
      const uploadResponse = await cloudinary.uploader.upload(
        `data:${profilePictureFile.mimetype};base64,${profilePictureFile.buffer.toString('base64')}`,
        {
          folder: 'teachers/profiles',
          resource_type: 'image'
        }
      );
      uploadedProfile = uploadResponse.secure_url;
    }

    // ✅ Upload certificate
    let uploadedCertificate = "no certificate";
    if (certificateFile) {
      // Determine resource type based on file mimetype
      const isPdf = certificateFile.mimetype === 'application/pdf';
      const resourceType = isPdf ? 'raw' : 'image';
      
      const certUpload = await cloudinary.uploader.upload(
        `data:${certificateFile.mimetype};base64,${certificateFile.buffer.toString('base64')}`,
        {
          folder: 'teachers/certificates',
          resource_type: resourceType,
          format: isPdf ? 'pdf' : undefined
        }
      );
      
      uploadedCertificate = certUpload.secure_url;
    }

    const teacher = new Teachers({
      name,
      number,
      email,
      subject,
      profilePicture: uploadedProfile,
      certificate: uploadedCertificate
    });

    await teacher.save();
    res.status(201).json({ message: "Macallinka si guul leh ayaa loo abuuray", teacher });

  } catch (error) {
    console.error("Error in createTeacher function:", error);
    res.status(500).json({ message: error.message });
  }
};


// 2. Hel Dhammaan Macallimiinta
export const getAllTeachers = async (req, res) => {
  try {
    const teacher = await Teachers.find({}).sort({ createdAt: -1 });
    res.status(200).json({ message: "Macallimiinta si guul leh ayaa loo helay", teachers: teacher });
  } catch (error) {
    console.error("Error in getAllTeachers function: ", error);
    res.status(500).json({ message: error.message });
  }
};


// 3. Hel Macallin Hal Qof ah (ID)
export const getTeacherById = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const teacher = await Teachers.findById(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Macallin lama helin" });
    }

    res.status(200).json({ message: "Macallinka si guul leh ayaa loo helay", teacher });
  } catch (error) {
    console.error("Error in getTeacherById function: ", error);
    res.status(500).json({ message: error.message });
  }
};


// 4. Cusboonaysii Macallin
export const updateTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { name, number, email, subject } = req.body;
    const profilePictureFile = req.files?.profilePicture?.[0];
    const certificateFile = req.files?.certificate?.[0];

    const teacher = await Teachers.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Macallin lama helin" });
    }

    // ✅ Update profile picture if provided
    if (profilePictureFile) {
      try {
        // Delete old picture if it exists
        if (teacher.profilePicture && teacher.profilePicture !== "no profile picture") {
          const publicId = getPublicIdFromUrl(teacher.profilePicture);
          console.log('Attempting to delete profile picture with publicId:', publicId);
          if (publicId) {
            const deleteResult = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
            console.log('Profile picture deletion result:', deleteResult);
          }
        }
        
        // Upload new picture
        const uploadRes = await cloudinary.uploader.upload(
          `data:${profilePictureFile.mimetype};base64,${profilePictureFile.buffer.toString('base64')}`,
          {
            folder: 'teachers/profiles',
            resource_type: 'image'
          }
        );
        console.log('New profile picture uploaded:', uploadRes.secure_url);
        teacher.profilePicture = uploadRes.secure_url;
      } catch (error) {
        console.error("Error updating profile picture:", error);
        throw new Error("Failed to update profile picture");
      }
    }

    // ✅ Update certificate if provided
    if (certificateFile) {
      try {
        // Delete old certificate if it exists
        if (teacher.certificate && teacher.certificate !== "no certificate") {
          const publicId = getPublicIdFromUrl(teacher.certificate);
          console.log('Attempting to delete certificate with publicId:', publicId);
          if (publicId) {
            const resourceType = teacher.certificate.includes('.pdf') ? 'raw' : 'image';
            const deleteResult = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
            console.log('Certificate deletion result:', deleteResult);
          }
        }
        
        // Upload new certificate
        const isPdf = certificateFile.mimetype === 'application/pdf';
        const resourceType = isPdf ? 'raw' : 'image';
        
        const certRes = await cloudinary.uploader.upload(
          `data:${certificateFile.mimetype};base64,${certificateFile.buffer.toString('base64')}`,
          {
            folder: 'teachers/certificates',
            resource_type: resourceType,
            format: isPdf ? 'pdf' : undefined
          }
        );
        console.log('New certificate uploaded:', certRes.secure_url);
        teacher.certificate = certRes.secure_url;
      } catch (error) {
        console.error("Error updating certificate:", error);
        throw new Error("Failed to update certificate");
      }
    }

    // Update text fields
    teacher.name = name || teacher.name;
    teacher.number = number || teacher.number;
    teacher.email = email || teacher.email;
    teacher.subject = subject || teacher.subject;

    await teacher.save();

    res.status(200).json({ 
      message: "Macallinka si guul leh ayaa loo cusboonaysiiyay", 
      teacher 
    });

  } catch (error) {
    console.error("Error in updateTeacher function:", error);
    res.status(500).json({ 
      message: error.message || "Khalad ayaa dhacay marka la cusboonaysiinayay",
      errorDetails: error.response?.data || error
    });
  }
};


// 5. Tirtir Macallin
export const deleteTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const teacher = await Teachers.findByIdAndDelete(teacherId);

    if (!teacher) {
      return res.status(404).json({ message: "Macallin lama helin" });
    }

    // Tirtir sawirka haddii uu jiro
    if (teacher.profilePicture && teacher.profilePicture !== "no profile picture") {
      const publicId = getPublicIdFromUrl(teacher.profilePicture);
      if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    }
    // Tirtir shahaadada haddii ay jirto
    if (teacher.certificate && teacher.certificate !== "no certificate") {
      const publicId = getPublicIdFromUrl(teacher.certificate);
      if (publicId) await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    }

    res.status(200).json({ message: "Macallinka si guul leh ayaa loo tirtiray" });
  } catch (error) {
    console.error("Error in deleteTeacher function: ", error);
    res.status(500).json({ message: error.message });
  }
};