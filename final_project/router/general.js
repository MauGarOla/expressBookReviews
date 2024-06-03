const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    return userswithsamename.length > 0;
};

public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (username && password) {
        if (!doesExist(username)) {
            users.push({ "username": username, "password": password });
            return res.status(200).json({ message: "User successfully registered. Now you can login" });
        } else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }
    return res.status(404).json({ message: "Unable to register user." });
});

// Task 10: Get the book list available in the shop using Promise callbacks or async-await with Axios
public_users.get('/', async (req, res) => {
    try {
        const response = await axios.get('http://localhost:5000/books');
        res.send(JSON.stringify(response.data, null, 4));
    } catch (error) {
        res.status(500).json({ message: "Error fetching book list", error: error.message });
    }
});

// Task 11: Get book details based on ISBN using Promise callbacks or async-await with Axios
public_users.get('/isbn/:isbn', async (req, res) => {
    const isbn = req.params.isbn;
    try {
        const response = await axios.get(`http://localhost:5000/books/isbn/${isbn}`);
        res.send(response.data);
    } catch (error) {
        res.status(500).json({ message: "Error fetching book details", error: error.message });
    }
});

// Task 12: Get book details based on author using Promise callbacks or async-await with Axios
public_users.get('/author/:author', async (req, res) => {
    const author = req.params.author;
    try {
        const response = await axios.get(`http://localhost:5000/books/author/${author}`);
        const booksByAuthor = response.data.filter(book => book.author.includes(author));
        if (booksByAuthor.length > 0) {
            res.status(200).json(booksByAuthor);
        } else {
            res.status(404).json({ message: "No books found by this author" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching book details", error: error.message });
    }
});

// Task 13: Get all books based on title using Promise callbacks or async-await with Axios
public_users.get('/title/:title', async (req, res) => {
    const title = req.params.title.toLowerCase();
    try {
        const response = await axios.get(`http://localhost:5000/books/title/${title}`);
        const booksByTitle = response.data.filter(book => book.title.toLowerCase().includes(title));
        if (booksByTitle.length > 0) {
            res.status(200).json(booksByTitle);
        } else {
            res.status(404).json({ message: "No books found with this title" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error fetching book details", error: error.message });
    }
});

//  Get book review
public_users.get('/review/:isbn', (req, res) => {
    const isbn = req.params.isbn;

    if (books[isbn] && books[isbn].review) {
        return res.status(200).json(books[isbn].review);
    } else {
        return res.status(404).json({ message: "No review found for this book" });
    }
});

module.exports.general = public_users;
