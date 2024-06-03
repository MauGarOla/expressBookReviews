const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
  
    const token = jwt.sign({ username }, 'secret_key', { expiresIn: '1h' });
  
    return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const token = req.headers['authorization'];

    if (!token) {
      return res.status(403).json({ message: "No token provided" });
    }
  
    jwt.verify(token, 'secret_key', (err, decoded) => {
      if (err) {
        return res.status(500).json({ message: "Failed to authenticate token" });
      }
  
      const username = decoded.username;
      const isbn = req.params.isbn;
      const review = req.body.review;
  
      if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
      }
  
      if (!books[isbn].reviews) {
        books[isbn].reviews = {};
      }
  
      books[isbn].reviews[username] = review;
  
      return res.status(200).json({ message: "Review added successfully", book: books[isbn] });
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;