import fs from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";

export const saveBase64Image = async (
  base64Image: string,
  folder_name: string
): Promise<string> => {
  if (!base64Image) {
    throw new Error("No base64 image provided");
  }

  const fileName = `${uuidv4()}.png`;
  const dirPath = path.join(process.cwd(), "uploads", folder_name);
  const filePath = path.join(dirPath, fileName);

  // Ensure directory exists
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (err) {
    throw new Error(`Directory creation failed: ${err}`);
  }

  // Remove Base64 prefix
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");

  // Save image
  try {
    await fs.writeFile(filePath, base64Data, "base64");
  } catch (err) {
    throw new Error(`Image saving failed: ${err}`);
  }

  const returnPath = `uploads/${folder_name}/${fileName}`;

  // Generate thumbnail
  await generateThumbnail(returnPath, `${folder_name}/thumbnail`);

  return returnPath;
};

export const generateThumbnail = async (
  originalPath: string,
  thumbFolder: string
): Promise<string> => {
  const fileName = `thumb_${path.basename(originalPath)}`;
  const outputFolder = path.join(process.cwd(), "uploads", thumbFolder);
  const outputPath = path.join(outputFolder, fileName);

  // Ensure thumbnail directory exists
  try {
    await fs.mkdir(outputFolder, { recursive: true });
  } catch (err) {
    throw new Error(`Thumbnail directory creation failed: ${err}`);
  }

  try {
    await sharp(path.join(process.cwd(), originalPath))
      .resize(64, 64)
      .toFile(outputPath);
  } catch (err) {
    console.error("Thumbnail generation error:", err);
  }

  return `uploads/${thumbFolder}/${fileName}`;
};
