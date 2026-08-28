import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
const regions = ["ap-south-1", "ap-southeast-1", "us-east-1", "us-west-1", "eu-west-1", "eu-central-1"];
for (const r of regions) {
  const host = `aws-0-${r}.pooler.supabase.com`;
  dns.resolve4(host, (err, addresses) => {
    console.log(host, "IPv4:", addresses, "err:", err?.code);
  });
}
