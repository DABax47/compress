const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const bodyparse = require("body-parser");
const path = require("path");
const multer = require("multer");

const imagemin = require("imagemin");
const imageminJ = require("imagemin-jpegtran");
const imageminP = require("imagemin-pngquant");

app.set("view engine", "pug");
app.use("/public", express.static(path.join(__dirname + "/public")));
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));

app.use(bodyparse.json());
app.use(bodyparse.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, "uploads");
  },
  filename: function (req, file, callback) {
    const suffix =
      Date.now() +
      Math.floor(Math.random() * 1e12) +
      path.extname(file.originalname);
    callback(null, file.fieldname + "-" + suffix);
  },
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
  res.render("index");
});
app.post("/", upload.single("img"), (req, res, next) => {
  const file = req.file;
  let ext;
  if (!file) {
    const err = new Error("please upload file");
    err.httpStatusCode = 404;
    return next(err);
  }
  if (file.mimetype == "image/jpeg") {
    ext = "jpg";
  }
  if (file.mimetype == "image/png") {
    ext = "png";
  }
  console.log(req.file);
  res.render("display", {
    ext: ext,
    url: file.path,
    name: file.filename,
  });
});

// app.post("/display/compress/:name/:ext", async (req, res, next) => {
//
//   // res.download(files[0].destinationPath);
//   res.send("Hello");
// });

app.post("/display/compress/:name/:ext", async (req, res) => {
  const files = await imagemin(["./uploads/" + req.params.name], {
    destination: "output",
    plugins: [
      imageminJ(),
      imageminP({
        quality: [0.6, 0.8],
      }),
    ],
  });
  res.download(files[0].destinationPath);
});
app.listen(PORT, () => {
  console.log(`connected to port ${PORT}`);
});
