import { Router } from "express";
import multer from "multer";
import { occasions, preferences, suggestStyles } from "../services/stylist.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1, fields: 3, fieldSize: 1000 },
  fileFilter: (_req, file, cb) => {
    const valid = ["image/jpeg", "image/png", "image/webp"].includes(
      file.mimetype,
    );
    cb(
      valid
        ? null
        : Object.assign(new Error("Please upload a JPG, PNG, or WEBP image."), {
            status: 415,
          }),
      valid,
    );
  },
});

export function validImage(file) {
  const b = file.buffer;
  if (file.mimetype === "image/jpeg")
    return b.length > 3 && b[0] === 255 && b[1] === 216 && b[2] === 255;
  if (file.mimetype === "image/png")
    return b
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  return (
    file.mimetype === "image/webp" &&
    b.toString("ascii", 0, 4) === "RIFF" &&
    b.toString("ascii", 8, 12) === "WEBP"
  );
}

router.post("/", upload.single("image"), async (req, res, next) => {
  try {
    if (!req.file || !validImage(req.file))
      return res
        .status(400)
        .json({ message: "Upload a valid JPG, PNG, or WEBP clothing photo." });
    const {
      occasion = "Everyday",
      preference = "Any style",
      correction = "",
    } = req.body;
    if (
      !occasions.includes(occasion) ||
      !preferences.includes(preference) ||
      typeof correction !== "string" ||
      correction.length > 200
    )
      return res
        .status(400)
        .json({
          message:
            "Choose valid preferences and keep the garment description under 200 characters.",
        });
    res
      .set("Cache-Control", "no-store")
      .json(
        await suggestStyles(req.file, { occasion, preference, correction }),
      );
  } catch (error) {
    next(error);
  }
});
export default router;
