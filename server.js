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
    const bookcollection = db.collection("books");
    const cartcollection = db.collection("cart");


    const path = url.parse(req.url).pathname;
    if (path == '/' && req.method == 'GET') {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync('./home.html'));

    } else if (path == '/login' && req.method == 'GET') {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync('./login.html'));
    } else if (path == '/signup' && req.method == 'GET') {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync('./signup.html'));
    } else if (path == '/addbook' && req.method == 'GET') {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync('./addbook.html'));
        //     }else if (path === '/favicon.ico') {
        //     res.writeHead(204); // No Content
        //     res.end();
        //     return;
    } else if (path === '/details' && req.method === 'GET') {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync('details.html'));
        return;
    } else if (path === '/edit' && req.method === 'GET') {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync('edit.html'))
    } else if (path === '/cart' && req.method == 'GET') {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync("cart.html"));
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
    if (path == '/login' && req.method == "POST") {
        let body = '';
        req.on("data", (chunks) => {
            body += chunks.toString();
            console.log(body);
        });
        req.on("end", async () => {
            try {
                const { username, password, role } = JSON.parse(body);
                const user = await usercollection.findOne({ username, password, role });
                if (user) {
                    // console.log("login succesfully:");
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({ _id: user._id, username: user.username, role: user.role, image: user.image }));
                } else {
                    console.log("something went wrong");
                    res.writeHead(401, { "Content-Type": "application/json" });
                    res.end(JSON.stringify(user));
                }
            } catch (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ error: err.message || "Internal server error" }));
            }
        })
    }

    // get profile image
    if (path == '/getimage' && req.method == 'GET') {
        try {
            const queryParams = url.parse(req.url, true).query;
            const id = queryParams.id;

            if (!id) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ err: "No ID provided" }));
            }

            const getimage = await usercollection.findOne({ _id: new ObjectId(id) });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ image: getimage.image }));
        } catch (err) {
            res.writeHead(500, { "content-type": "text/plain" });
            res.end("error to get image");
        }
    }



    //    insert Books

    if (path == '/addbook' && req.method == 'POST') {
        let body = "";
        req.on("data", (chunks) => {
            body += chunks.toString();
            console.log(body);
        });
        req.on("end", async () => {
            try {
                const bookData = JSON.parse(body);
                const addbook = await bookcollection.insertOne(bookData);

                if (addbook) {
                    console.log("successfully added books! ");
                } else {
                    console.log("failed to add book");
                }
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Book added" }));
            } catch (err) {
                res.writeHead(500, { "Content-Type": "application/json" });
                res.end(err);
            }
        })
        return;
    }


    // fetch books

    if (path == '/books' && req.method == 'GET') {
        try {
            const bookData = await bookcollection.find().toArray();
            const stringdata = JSON.stringify(bookData);
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(stringdata);
        } catch (error) {
            console.error("Error fetching books:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Internal Server Error" }));

        }
        return;
    }

    // fetch with condition
    if (path == '/getbook' && req.method == 'GET') {
        try {
            const queryParams = url.parse(req.url, true).query;
            const id = queryParams.id;

            if (!id) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ err: "No ID provided" }));
            }

            const getBook = await bookcollection.findOne({ _id: new ObjectId(id) });
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(getBook));
        } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end("error to get details");
        }
    }

    // delete

    if (path == '/delete' && req.method == 'DELETE') {
        try {
            let body = "";
            req.on("data", (chunks) => {
                body += chunks.toString();
            });

            req.on("end", async () => {
                const objectData = JSON.parse(body);

                const id = objectData._id;

                const deleteddata = await bookcollection.deleteOne({ _id: new ObjectId(id) });
                if (deleteddata) {
                    console.log("delete data successfully");
                } else {
                    console.log("data can't remove");
                }
            })
        } catch (error) {
            res.writeHead(500, { "content-type": "text/plain" });
            res.end("error deleting data");
            console.log("error deleting data " + error);
        }
    }

    // edit
    if (path === '/edit' && req.method === "PUT") {
        try {
            let body = '';
            req.on("data", chunks => {
                body += chunks.toString();
            });
            req.on("end", async () => {
                const updateData = JSON.parse(body);

                // If no new image is provided, keep the old one
                const imageData = updateData.image && updateData.image.trim() !== ""
                    ? updateData.image     // new base64 string
                    : updateData.oldImage; // keep old base64

                const result = await bookcollection.updateOne(
                    { _id: new ObjectId(updateData._id) },
                    {
                        $set: {
                            title: updateData.title,
                            fulltitle: updateData.fulltitle,
                            image: imageData,
                            author: updateData.author,
                            category: updateData.category,
                            language: updateData.language,
                            price: updateData.price,
                            description: updateData.description

                        },
                    }
                );
                res.writeHead(200, { "Content-Type": "application/json" });
                res.end(JSON.stringify({ message: "Book updated successfully", result }))
            });
        } catch (err) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ err: err.message }));
        }
    }



    // ===========CART================//

    // add to cart
    if (path === '/add-to-cart' && req.method === "POST") {
        let body = '';
        req.on("data", chunks => (body += chunks));
        req.on("end", async () => {
            try{
            const { userId, bookId } = JSON.parse(body);
            if (!userId || !bookId) {
                res.writeHead(400, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: "Missing fields" }));
            }
            // find book
            const book = await bookcollection.findOne({ _id: new ObjectId(bookId) });
            if (!book) {
                res.writeHead(404, { "Content-Type": "application/json" });
                return res.end(JSON.stringify({ error: "Book not found" }));
            }

            let cartItem = await cartcollection.findOne({ userId:new ObjectId(userId), bookId:new ObjectId(bookId) });
            if (cartItem) {
                await cartcollection.updateOne(
                    { userId:new ObjectId(userId), bookId:new ObjectId(bookId) },
                    { $inc: { qty: 1 } }
                );
            } else {
                await cartcollection.insertOne({
                    userId:new ObjectId(userId),
                    bookId:new ObjectId(bookId),
                    image: book.image,
                    title: book.title,
                    author: book.author,
                    price: book.price,
                    qty: 1
                });
            }

            const userCart = await cartcollection.find({ userId:new ObjectId(userId)}).toArray();
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ message: "Added to cart", cart: userCart }));
          }catch(err){
             res.writeHead(500, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "Server error" }));
          }  

        });
        return;
    }

    // get Cart
    if (path === "/cart-page" && req.method === "GET") {
        const parsedUrl = url.parse(req.url, true);
        const userId = parsedUrl.query.userId;
        if (!userId) {
            res.writeHead(400, { "Content-Type": "application/json" });
            return res.end(JSON.stringify({ error: "No userId" }));
        }
    try{
        const userCart = await cartcollection.find({userId:new ObjectId(userId)}).toArray();
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(userCart));
    }catch(err){
        res.writeHead(500, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Server error" }));
        }
    
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