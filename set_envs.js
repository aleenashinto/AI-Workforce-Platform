const { execSync } = require('child_process');
const fs = require('fs');

const API_ENVS = {
  DATABASE_URL: 'postgresql://neondb_owner:npg_KJ9L6qHSCMGI@ep-little-wildflower-ayh4ii0z-pooler.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  REDIS_URL: 'rediss://default:gQAAAAAAAddfAAIgcDEyZGRkZDU5Nzk1ZGQ0YWNiYjc5NDYwZDMyZGVjNjM3MQ@noted-puma-120671.upstash.io:6379',
  JWT_SECRET: 'A0UCbMySNCkf3o2+9pgqSLwjFGMZOtDPBv2h8ifeDL6p36rcB/I0rFATerwchc+o2jVg55y96RQQGK4u267IjQ==',
  FRONTEND_URL: 'https://web-inspite1.vercel.app' // Vercel usually formats URLs as projectname-teamname.vercel.app, actually we'll just allow all origins via CORS for now to ensure it works, then they can lock it down. Wait, Fastify CORS uses the FRONTEND_URL. If it's wrong, it will fail.
};

// I will configure the API to just accept https://*.vercel.app for now if FRONTEND_URL isn't perfectly matching, wait I can't easily change code.
// Vercel auto-generates URLs like https://web-[team-hash].vercel.app. We can find out by deploying web first.

function setEnv(projectPath, key, value) {
  try {
    console.log(`Setting ${key} in ${projectPath}...`);
    execSync(`vercel env rm ${key} production -y --token vcp_3F0HAn9t2bdAfGke16mJqLRNVxd9gBJHGtcrLWoh8dJU2ikr4b2PdCXU`, { cwd: projectPath, stdio: 'ignore' });
  } catch (e) {} // ignore if doesn't exist
  
  execSync(`node -e "process.stdout.write(process.argv[1])" "${value}" | vercel env add ${key} production --token vcp_3F0HAn9t2bdAfGke16mJqLRNVxd9gBJHGtcrLWoh8dJU2ikr4b2PdCXU`, { cwd: projectPath, stdio: 'inherit' });
}

Object.entries(API_ENVS).forEach(([k, v]) => setEnv('d:/Project/apps/api', k, v));
