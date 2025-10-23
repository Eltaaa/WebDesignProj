import { useState } from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { firebase_db } from './database/firebase';
import { collection, addDoc, getDocs, query, where, } from "firebase/firestore";
import { useNavigate } from "react-router-dom";


export function RegisterPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert('username and password is required.');
      return;
    }

    // pass validation
    try {
      await addDoc(collection(firebase_db, 'users'), {
        username,
        password
      });
      alert('Form submitted successfuly.');
      setUsername('');
      setPassword('');

      navigate("/login");

    } catch (error) {
      console.error(error);
      alert('error submitting form.')
    }
  }


  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2 style={{ textAlign: "center" }}>Register</h2>
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '25ch' },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onSubmit={handleRegister}
      >
        <TextField style={{ width: "100%" }}
          required
          label="Username"
          sx={{ width: '100%' }}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField style={{ width: "100%" }}
          required
          label="Password"
          sx={{ width: '100%' }}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Register</Button>
      </Box>
    </div>
  );
};

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");


  const handleLogin = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("username and password are required.");
      return;
    }


    try {
      const q = query(
        collection(firebase_db, "users"),
        where("username", "==", username),
        where("password", "==", password)
      );

      const result = await getDocs(q);

      if (!result.empty) {
        setUsername("");
        setPassword("");
      } else {
        alert("Invalid username or password.");
      }
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "auto" }}>
      <h2 style={{ textAlign: "center" }}>Login</h2>
      <Box
        component="form"
        sx={{
          '& .MuiTextField-root': { m: 1, width: '25ch' },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
        onSubmit={handleLogin}
      >
        <TextField style={{ width: "100%" }}
          required
          label="Username"
          sx={{ width: '100%' }}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField style={{ width: "100%" }}
          required
          label="Password"
          sx={{ width: '100%' }}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Login</Button>
      </Box>
    </div>
  );
};

