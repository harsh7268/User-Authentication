require('dotenv').config();
const express = require("express");
require("./db/conn");
const path = require("path");
const hbs = require("hbs");
const Register = require("./models/register");
const bcrypt = require("bcryptjs");
const cookieParser = require("cookie-parser");
const auth = require("./middleware/auth");


const app = express();
const port = process.env.PORT || 8000;
const static_path= path.join(__dirname,"../public");
const templates_path= path.join(__dirname,"../templates/views");
const partials_path= path.join(__dirname,"../templates/partials");



app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views",templates_path);
hbs.registerPartials(partials_path);
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(cookieParser());

app.get("/",(req,res) =>{
    res.render("index");
   
});

app.get("/secret",auth, (req,res) =>{
    //console.log(` this is the cookie awsome ${req.cookies.jwt}`);
    res.render("secret",{
        firstname:req.user.firstname
    }); 
});

app.get("/logout",auth, async (req,res)  =>{
      try{ 
/*
       req.user.tokens = req.user.tokens.filter((currElement) =>{
               return currElement.token !== req.token
        })
        */
        
       req.user.tokens = [];
        res.clearCookie("jwt");
      await  req.user.save();
      res.render("login");
        console.log("logout");

      }catch(err){
        res.status(401).send(err);
        console.log(err);
      }
})

// register
app.get("/register",(req,res) =>{
    res.render("register");
});

app.post("/register", async (req,res) =>{
    try{
        const password = req.body.password;
        const cpassword = req.body.confirmpassword;
        console.log(req.body.email);
        if(password===cpassword){
              const registerEmployee = new Register({
                firstname:req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                gender:req.body.gender,
                phone:req.body.phone,
                age:req.body.age,
                password:req.body.password,
                confirmpassword:req.body.confirmpassword
              });

              // password hash (middleware)
              
              //generate token (middleware)
              console.log(`the success part ${registerEmployee}`);

              const token = await registerEmployee.generateAuthToken();
              console.log(`the token part ${token}`);

             //the res.cookie(name,value,[options]) function is use to set the cookie name to value.
             // the value parameter may be a string or object converted to JSON
       
              res.cookie("jwt",token,{
                expires:new Date(Date.now() + 30000),
                httpOnly:true
              });
              console.log(cookie);
              
              const registerd = await registerEmployee.save();
              res.status(201).render("index");

        }else{
            res.send("password is not matching");
        }
    }catch(err){
        res.status(400).send(err);
        console.log(err);
    }
});

// login

app.get("/login",(req,res) =>{
    res.render("login");
});

app.post("/login", async (req,res) =>{
    try{
        const email = req.body.email;
        const password = req.body.password;
        console.log(email);
        const userEmail  = await Register.findOne({email:email});
      console.log(userEmail);
        const isMatch = await bcrypt.compare(password,userEmail.password);

        const token = await userEmail.generateAuthToken();
        console.log(`the token part ${token}`);

        res.cookie("jwt",token,{
            expires:new Date(Date.now() + 600000),
            httpOnly:true
          });
          
          

      if(isMatch){
        res.status(201).render("index",{
            firstname:userEmail.firstname
        }); 
      }else{
        res.send("password are not matching");
      } 
     
    }catch(err){
        res.status(400).send(err);
        console.log(err);
    }
});

app.get("*",(req,res) =>{
    res.send("404 error");
});

/*
// password hashing
const securePassword = (password) =>{
    const passwordHash = bcrypt.hash(password);
    const passwordMatch = bcrypt.compare("harsh@123",passwordHash);
    if(passwordMatch){
        console.log("password is matches")
    }
    else{
        console.log("password error");
    }
}

securePassword("harsh@123");
*/

/*
//jwt authentication
const jwt = require('jsonwebtoken');

const createToken = async () =>{
  const token = await  jwt.sign({_id:"62b6616652a488f1b1cc8518"},"harshpatelbillano8underworldkadon" ,{
    expiresIn:"2 seconds"
  });
  console.log(token);

  const userVerify = await jwt.verify(token,"harshpatelbillano8underworldkadon");
  console.log(userVerify);
}

createToken();
*/



app.listen(port,() =>{
    console.log(`connected to the port no. ${port}`);
})

