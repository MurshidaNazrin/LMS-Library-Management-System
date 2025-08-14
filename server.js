const http = require('http');
const fs = require('fs');
const url = require('url');
const { MongoClient, ObjectId } = require("mongodb");


// client instance -> to connect mongoDB server
const client = new MongoClient("mongodb://127.0.0.1:27017/");
const port = 5000;

// create server
const server = http.createServer(async (req, res) => {
    // database
    const db = client.db("LMS");
    // user collection
    const usercollection = db.collection("users");


    const path = url.parse(req.url).pathname;
    if (path == '/' && req.method == 'GET') {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync('home.html'));
    } else if (path == '/login' && req.method == 'GET') {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync('login.html'));
    } else if (path == '/signup' && req.method == 'GET') {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync('signup.html'));
    }


    // Registration api
    if (path == '/signup' && req.method == 'POST') {

        let body = '';
        req.on("data", (chunks) => {
            body += chunks.toString();
            console.log(body);
        });
        req.on("end", async () => {
            try {

                const userData = JSON.parse(body);
                console.log(userData);

                const insertData = await usercollection.insertOne(userData);
                if (insertData) {
                    console.log("Account created");
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ _id: insertData.insertedId }));
                } else {
                    console.log("something went wrong");
                    res.writeHead(500, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ error: "Insert failed" }));
                }
            } catch (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: err.message || "Internal server error" }));
            }
        });

    }


    // login api
   if(path == '/login' && req.method == "POST"){
    let body = '';
    req.on("data", (chunks) =>{
        body += chunks.toString();
        console.log(body);
    });
    req.on("end",async ()=>{
        try{
            const {username,password} = JSON.parse(body);
            const user = await usercollection.findOne({username,password});
              if (user) {
                    // console.log("login succesfully:");
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({_id:user._id,username:user.username,role:user.role}));
                } else {
                    console.log("something went wrong");
                    res.writeHead(401, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(user));
                }
        }catch(err){
             res.writeHead(500, { "Content-Type": "application/json" });
             res.end(JSON.stringify({ error: err.message || "Internal server error" }));
        }
    })
   }

});

client.connect()
    .then(() => {
        console.log("MongoDB connected");

        server.listen(port, () => {
            console.log(`server created at http://localhost:${port}`);
        });

    })
    .catch(() => {
        console.log("can't connect database");
    });