const express = require("express");
const app = express();

app.use(express.static("public"));

app.listen(3002, () => {
  console.log("Pong running at http://localhost:3002");
});
