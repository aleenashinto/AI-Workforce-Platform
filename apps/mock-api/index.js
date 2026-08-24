const jsonServer = require("json-server");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const server = express();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

server.use(
  cors({
    origin: true, // allow all for mock
    credentials: true,
  }),
);
server.use(cookieParser());
server.use(express.json());
server.use(middlewares);

const mockUser = {
  id: "mock-user-1",
  email: "mockuser@example.com",
  name: "Mock User",
  roles: ["owner"],
  organization: {
    id: "mock-org-1",
    name: "Mock Organization",
    website: "",
    industry: "",
    timezone: "UTC",
    language: "English",
  },
};

// Auth endpoints
server.post("/auth/login", (req, res) => {
  res.cookie("auth_token", "mock_jwt_token", {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
  });
  res.json({ success: true });
});

server.post("/auth/register", (req, res) => {
  res.cookie("auth_token", "mock_jwt_token", {
    path: "/",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7 * 1000, // 7 days
  });
  res.json({ success: true });
});

server.post("/auth/logout", (req, res) => {
  res.clearCookie("auth_token", { path: "/" });
  res.json({ success: true });
});

server.get("/auth/me", (req, res) => {
  if (req.cookies.auth_token === "mock_jwt_token") {
    res.json({ user: mockUser });
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
});

// OAuth mocks (optional, since we mock POST /auth/login directly)
server.get("/auth/google/login", (req, res) => {
  res.redirect(`http://localhost:3000/auth/google/callback?code=mock_code`);
});

server.get("/auth/microsoft/login", (req, res) => {
  res.redirect(`http://localhost:3000/auth/microsoft/callback?code=mock_code`);
});

server.get("/auth/google/callback", (req, res) => {
  res.cookie("auth_token", "mock_jwt_token", { path: "/", httpOnly: true });
  res.redirect(`http://localhost:3000/dashboard`);
});

server.get("/auth/microsoft/callback", (req, res) => {
  res.cookie("auth_token", "mock_jwt_token", { path: "/", httpOnly: true });
  res.redirect(`http://localhost:3000/dashboard`);
});

// Use json-server router for all other endpoints
server.use(router);

const PORT = process.env.PORT || 3002;
server.listen(PORT, () => {
  console.log(`Mock API Server is running on port ${PORT}`);
});
