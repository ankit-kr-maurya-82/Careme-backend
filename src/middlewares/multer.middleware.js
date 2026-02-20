import multer from "multer";
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.fieldname === "avatar") {
    if (/image\/(jpeg|png|jpg)/.test(file.mimetype)) cb(null, true);
    else cb(new Error("Avatar must be an image (jpeg, jpg, png)"));
  } else cb(new Error("Unknown field"));
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
});
