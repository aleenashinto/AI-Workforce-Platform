import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.resolve6("db.xarcuonsgcexagzevwdu.supabase.co", (err, addresses) => {
  console.log("addresses resolve6:", addresses, "error:", err);
});
