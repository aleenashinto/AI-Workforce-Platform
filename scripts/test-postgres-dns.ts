import * as dotenv from "dotenv";
import * as path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });
import postgres from "postgres";
import dns from "dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const originalLookup = dns.lookup;
dns.lookup = function(hostname: string, options: any, callback: any) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (hostname === "db.xarcuonsgcexagzevwdu.supabase.co") {
    console.log("Hijacked DNS lookup options:", options);
    dns.resolve6(hostname, (err, addresses) => {
      if (err || !addresses || addresses.length === 0) {
        dns.resolve4(hostname, (err4, addresses4) => {
          if (err4 || !addresses4 || addresses4.length === 0) {
            callback(err4 || new Error("Not found"));
          } else {
            if (options.all) {
              callback(null, [{ address: addresses4[0], family: 4 }]);
            } else {
              callback(null, addresses4[0], 4);
            }
          }
        });
      } else {
        if (options.all) {
          callback(null, [{ address: addresses[0], family: 6 }]);
        } else {
          callback(null, addresses[0], 6);
        }
      }
    });
  } else {
    originalLookup(hostname, options, callback);
  }
} as any;

const sql = postgres(process.env.DATABASE_URL!, {
  max: 1
});

async function main() {
  const r = await sql`SELECT 1 as result`;
  console.log("Database result:", r);
  await sql.end();
}
main().catch(console.error);
