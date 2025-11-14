const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(bodyParser.json());
app.use(express.static("public"));

// Supabase setup
const SUPABASE_URL = "https://uybhpjwhgseybufkhwcl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5YmhwandoZ3NleWJ1Zmtod2NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTY5NjIsImV4cCI6MjA3ODQzMjk2Mn0.7Def0ugLUEweIYVYKEyg56y9o0_x0b3e4WDH4VyyG1E";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Register
app.post("/register", async (req, res) => {
    const { username, password } = req.body;

    // Check existing user
    const { data: existing } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

    if (existing) return res.json({ message: "User already exists!" });

    const hashed = await bcrypt.hash(password, 10);

    // Insert new user
    const { error } = await supabase
        .from("users")
        .insert([{ username, password: hashed }]);

    if (error) return res.json({ message: "Error: " + error.message });

    res.json({ message: "Registered successfully!" });
});

// Login
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const { data: user } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

    if (!user) return res.json({ message: "User not found!" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ message: "Wrong password!" });

    res.json({ message: "Login successful!" });
    res.redirect("/dashboard.html");
});

// Redirect root to login
app.get("/", (req, res) => res.redirect("/login"));

app.get("/login", (req, res) => res.sendFile(__dirname + "/public/login.html"));
app.get("/register", (req, res) => res.sendFile(__dirname + "/public/register.html"));

app.listen(3000, () => console.log("Server running on http://localhost:3000"));
