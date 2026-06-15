const dns = require("dns");

dns.resolveSrv(
  "_mongodb._tcp.recruitmentdatabase.a7zh1rm.mongodb.net",
  (err, records) => {
    console.log("Error:", err);
    console.log("Records:", records);
  }
);