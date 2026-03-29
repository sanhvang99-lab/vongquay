const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.json());
app.use(express.static("public"));

let db = { users: {} };

function save(){
  fs.writeFileSync("db.json", JSON.stringify(db,null,2));
}

// LOGIN
app.post("/auth",(req,res)=>{
  let {user,pass} = req.body;

  if(!db.users[user]){
    db.users[user] = {
      pass,
      balance: 0,
      turns: 5,
      history:[]
    };
    save();
  }

  if(db.users[user].pass !== pass){
    return res.json({msg:"Sai mật khẩu"});
  }

  res.json(db.users[user]);
});

// SPIN (8 ô)
app.post("/spin",(req,res)=>{
  let {user} = req.body;
  let u = db.users[user];

  if(u.turns<=0) return res.json({msg:"Hết lượt"});

  u.turns--;

  let rewards = [0,1000,5000,10000,2000,3000,7000,9000];
  let index = Math.floor(Math.random()*8);
  let result = rewards[index];

  u.balance += result;
  u.history.push(result);

  save();

  res.json({
    index,
    result,
    balance:u.balance,
    turns:u.turns
  });
});

// WEBHOOK AUTO NẠP
app.get("/webhook",(req,res)=>{
  let {user,amount,secret} = req.query;

  if(secret !== "SANH_SECRET") return res.send("Sai key");

  if(!db.users[user]) return res.send("Không có user");

  db.users[user].balance += Number(amount);
  save();

  res.send("OK");
});

// HISTORY
app.post("/history",(req,res)=>{
  let {user} = req.body;
  res.json(db.users[user].history);
});
app.get("/admin/list",(req,res)=>{
  res.json(db.withdraws || []);
});

app.listen(process.env.PORT || 3000);()=>console.log("http://Shopmayman.vn");
