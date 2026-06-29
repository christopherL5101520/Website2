const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 8080);

const contentTypes = {
    ".css": "text/css; charset=utf-8",
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".svg": "image/svg+xml",
};

function send(response, statusCode, body, headers = {}) {
    response.writeHead(statusCode, headers);
    response.end(body);
}

function resolveRequestPath(requestUrl) {
    const url = new URL(requestUrl, `http://localhost:${port}`);
    const pathname = decodeURIComponent(url.pathname);
    const requestedPath = pathname === "/" ? "/index.html" : pathname;
    const filePath = path.resolve(root, `.${requestedPath}`);

    if (!filePath.startsWith(root)) {
        return null;
    }

    return filePath;
}

const server = http.createServer((request, response) => {
    const filePath = resolveRequestPath(request.url);

    if (!filePath) {
        send(response, 403, "Forbidden");
        return;
    }

    fs.readFile(filePath, (error, contents) => {
        if (error) {
            send(response, 404, "Not found");
            return;
        }

        send(response, 200, contents, {
            "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
        });
    });
});

server.listen(port, () => {
    console.log(`Serving ${root} at http://localhost:${port}`);
});
