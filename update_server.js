const fs = require('fs');
let content = fs.readFileSync('apps/api/server.ts', 'utf8');

if (!content.includes('import teamRoutes')) {
    content = content.replace(
        /import authRoutes from "\.\/routes\/auth";/,
        'import authRoutes from "./routes/auth";\nimport teamRoutes from "./routes/team";'
    );
}

if (!content.includes('fastify.register(teamRoutes')) {
    content = content.replace(
        /fastify\.register\(authRoutes\);/,
        'fastify.register(authRoutes);\n  fastify.register(teamRoutes, { prefix: "/v1/team" });'
    );
}

fs.writeFileSync('apps/api/server.ts', content, 'utf8');
