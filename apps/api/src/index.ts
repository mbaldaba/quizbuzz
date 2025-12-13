import express from "express";

const app = express();
const port = 4242;

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`API server is running at port: ${port}.`);
});
