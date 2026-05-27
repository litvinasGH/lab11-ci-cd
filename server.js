const http = require("http");
const fs = require("fs");
const path = require("path");

const port = Number(process.env.PORT) || 3000;
const publicFiles = {
  "/": { file: "index.html", type: "text/html; charset=utf-8" },
  "/index.html": { file: "index.html", type: "text/html; charset=utf-8" },
  "/style.css": { file: "style.css", type: "text/css; charset=utf-8" },
  "/script.js": { file: "script.js", type: "text/javascript; charset=utf-8" },
};

const server = http.createServer((request, response) => {
  const resource = publicFiles[request.url];

  if (!resource) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  fs.readFile(path.join(__dirname, resource.file), (error, content) => {
    if (error) {
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Server error");
      return;
    }

    response.writeHead(200, { "Content-Type": resource.type });
    response.end(content);
  });
});

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
