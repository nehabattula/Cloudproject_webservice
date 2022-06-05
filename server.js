/*
This is the entry point for the application and it re-directs app.js
It listens to the port:3000 to connect to the server.
*/
import app from "./api/app.js";

const port = 3002;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
