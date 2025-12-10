const fs = require("fs");
const path = require("path");

const uploadImage = async (req, res, next) => {
  const { image } = req.body;
  if (image == undefined || image == "") {
    req.fileName = undefined;
    next();
  } else {
    try {
      const codeExtension = image.charAt(0);
      let extensionn = "";

      if (codeExtension == "/") {
        extensionn = ".jpg";
      } else if (codeExtension == "i") {
        extensionn = ".png";
      } else {
        return res.json({
          success: false,
          msg: "Must an Image jpg or png",
        });
      }

      let randomNumber = "";
      let characters = "0123456789";
      let charactersLength = characters.length;
      for (let i = 0; i < 6; i++) {
        randomNumber += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }

      let fileName = Date.now() + randomNumber + extensionn;

      // Gunakan path absolut dan pastikan folder upload ada
      const uploadDir = path.join(__dirname, '..', 'public', 'images', 'upload');
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, fileName);
      const buffer = Buffer.from(req.body.image, "base64");

      fs.writeFileSync(filePath, buffer);

      req.fileName = fileName;

      next();
    } catch (e) {
      return res.json({
        success: false,
        msg: e.message,
      });
    }
  }
};

const uploadMultipleImage = async (req, res, next) => {
  const { image } = req.body;

  if (image == undefined || image == []) {
    req.fileName = undefined;
    next();
  } else {
    try {
      for (let i = 0; i < image.length; i++) {
        const item = image[i];

        const codeExtension = item.charAt(0);
        let extensionn = "";

        if (codeExtension == "/") {
          extensionn = ".jpg";
        } else if (codeExtension == "i") {
          extensionn = ".png";
        } else {
          return res.json({
            success: false,
            msg: "Must an Image jpg or png",
          });
        }

        let randomNumber = "";
        let characters = "0123456789";
        let charactersLength = characters.length;
        for (let i = 0; i < 6; i++) {
          randomNumber += characters.charAt(
            Math.floor(Math.random() * charactersLength)
          );
        }

        let fileName = Date.now() + randomNumber + extensionn;

        // Gunakan path absolut dan pastikan folder upload ada
        const uploadDir = path.join(__dirname, '..', 'public', 'images', 'upload');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        const filePath = path.join(uploadDir, fileName);
        const buffer = Buffer.from(item, "base64");

        fs.writeFileSync(filePath, buffer);
        hasilfileName.push(fileName);
      }

      req.fileName = hasilfileName;

      next();
    } catch (e) {
      return res.json({
        success: false,
        msg: e.message,
      });
    }
  }
};

module.exports = { uploadImage, uploadMultipleImage };
