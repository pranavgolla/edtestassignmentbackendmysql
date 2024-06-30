const bcrypt = require("bcrypt");
const mysql = require("mysql");
const jwt = require("jsonwebtoken");


// Create a connection to the MySQL database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'edtestzassesment'
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('userRegisterController Error connecting to MySQL database:', err);
    return;
  }
//   console.log('Connected to MySQL database');
});



// Controller function to register a new user
const createUserRegister = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Ensure password is not empty or undefined
    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password.toString(), 10);

    // Construct SQL query to check if email already exists
    const checkEmailQuery = `SELECT * FROM users WHERE email = '${email}'`;

    // Execute the SQL query to check if email already exists
    db.query(checkEmailQuery, async (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        res.status(500).json({ message: 'Internal server error' });
        return;
      }

      // If email already exists, return error response
      if (results.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }

      // Construct SQL query to insert new user registration entry
      const insertUserQuery = `INSERT INTO users (email, password) VALUES ( '${email}', '${hashedPassword}')`;

      // Execute the SQL query to insert new user registration entry
      db.query(insertUserQuery, (err, result) => {
        if (err) {
          console.error('Error executing SQL query:', err);
          res.status(500).json({ message: 'Internal server error' });
          return;
        }

        // Return success response
        res.status(201).json({ message: "Registration successful" });
        console.log("Registration successful");
      });
    });
  } catch (error) {
    console.error(`Error in controller: ${error}`);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller function to authenticate and login a user
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Construct SQL query to fetch user by email
    const query = `SELECT * FROM users WHERE email = '${email}'`;

    db.query(query, async (err, results) => {
      if (err) {
        console.error('Error executing SQL query:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      if (results.length === 0) {
        return res.status(404).json({ message: 'User not found' });
      }

      const user = results[0];

      // Convert password to string
      const stringPassword = password.toString();

      // Check if both passwords are strings
      if (typeof user.password !== 'string' || typeof stringPassword !== 'string') {
        console.error('One of the passwords is not a string');
        return res.status(500).json({ message: 'Internal server error' });
      }

      // Compare the provided password with the hashed password stored in the database
      const isPasswordValid = await bcrypt.compare(stringPassword, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid password" });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, "your_secret_key", { expiresIn: "1h" });

      // Return the token along with a success response
      res.status(200).json({ message: "Login successful", token });
      console.log("Login successful");
    });
  } catch (error) {
    console.error(`Error in login controller: ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller function to create a new appointment
const createAppointment = (req, res) => {
  const { email, date } = req.body;

  // Insert into MySQL database
  const insertAppointmentQuery = 'INSERT INTO appointments (email, date) VALUES (?, ?)';
  db.query(insertAppointmentQuery, [email, date], (err, result) => {
    if (err) {
      console.error('Error inserting appointment:', err);
      return res.status(500).json({  'Failed to create appointment.':error });
    }

    const newAppointment = {
      id: result.insertId,
      email: email,
      date: date
    };
    
    res.status(201).json(newAppointment);
  });
};

// Controller function to get all appointments for a user
const getAllUserAppointments = (req, res) => {
  const { email } = req.params;

  console.log(req.params) 

  // Fetch appointments from MySQL database
  const getAppointmentsQuery = 'SELECT * FROM appointments WHERE email = ?';
  db.query(getAppointmentsQuery, [email], (err, results) => {
    if (err) {
      console.error('Error fetching appointments:', err);
      return res.status(500).json({ error: 'Failed to fetch appointments.' });
    }

    res.status(200).json(results);
  });
};

module.exports = { createUserRegister, loginUser, createAppointment, getAllUserAppointments };

 