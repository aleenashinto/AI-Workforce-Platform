import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.lookup("db.xarcuonsgcexagzevwdu.supabase.co", (err, address, family) => {
  console.log("address:", address, "error:", err);
});
