import multer from "multer";

export const uploader = (fileLimit: number = 2) => {
   const storage = multer.memoryStorage();
   const limit = {
      fileSize: 1024 * 1024 * fileLimit,
   };

   return multer({ storage: storage, limits: limit }); //default 2mb
};


