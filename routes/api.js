const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const flash = require('express-flash')
const ObjectID = require('mongodb').ObjectId;
require('dotenv').config();
const Razorpay = require('razorpay'); 

const instance = new Razorpay({
    key_id:  process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
});



module.exports = function (app, myDataBase) {
  app.use(flash())


  passport.use(new LocalStrategy((username, password, done) => {
    myDataBase.findOne({ username: username }).then((user, err) => {
      if (!user) {
        return done(null, false, { massage: "No user with this email" });
      }
      if (err) { return done(err); }
      if (bcrypt.compareSync(password, user.password)) {
        return done(null, user)
      } else {
        return done(null, false, { massage: ["Wrong Password"] });
      }
      ;
    })
  }));


  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser((id, done) => {
    myDataBase.findOne({ "_id": new ObjectID(id) }).then((doc, err) => {
      if (err) return console.log(err);
      done(null, doc);
    });
  });



  app.get('/', (req, res) => {
    res.render("index")
  });
  app.get('/login', (req, res) => {
    req.flash('message');
    res.render("login",)

  });
  app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render("register", { massage: '' })
  });



  app.post('/api/user', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/userPage',
    failureRedirect: '/login',
    failureFlash: true
  }))



  app.post('/api/newUser', (req, res, next) => {
    let data = req.body;
    const hash = bcrypt.hashSync(data.password, 12);
    let userData = {
      username: data.email,
      password: hash,
      name: data.name,
      phoneno: data.phoneNo,
    }

    myDataBase.findOne({ username: userData.username }).then((user, err) => {
      if (!user) {
        myDataBase.insertOne(userData).then((user) => console.log(user))
        res.render('login', { massage: "New User secssesfuly Registered" });
      }
      else if (err) {
        console.log(err)
        res.render('register', { massage: "err" });
      }
      else {
        res.render('register', { massage: "User allredy existed use some other username" });
      }


    });
  });

  app.route('/UserPage').get(ensureAuthenticated, (req, res) => {
    res.render('userPage', { user: req.user })
  });
  app.route('/plans').get(ensureAuthenticated, (req, res) => {
    res.render('plans', { user: req.user })
  });

  app.get('/api/planData',(req, res) => {
    myDataBase.findOne({"_id": new ObjectID('655c6d3bc73b29e3c6186fec')}).then((data,err)=>{ res.send(data )})
   
  });

  app.post('/api/subscribe', (req, res) => {
    let data = req.body;
    let amount
    console.log(data)
    myDataBase.findOne({ name: 'plans' }).then((plans, err) => {
      amount = plans[data.plan] * 100

      var options = {
        amount: amount,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "order_rcptid_11",

      };
      instance.orders.create(options,
        (err, order) => {
          if (!err) {

            res.status(200).send({
              success: true,
              msg: 'Order Created',
              order_id: order.id,
              amount: amount,
              key_id: process.env.KEY_ID,
              contact: "9953574281",
              name: "Mobinkhan",
              email: "mmobinkhan007@gmail.com"
            });
          }
          else {
            console.log(err)
            res.status(400).send({ success: false, msg: 'Something went wrong!' });
          }
        }
      );
    });




  }
  )


  app.post('/api/updatePlan', (req, res) => {
    let data = req.body;
    myDataBase.updateOne({ "_id": new ObjectID(data._id) }, {$set:{ plan: data.plan} });
  }
  )

  function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/login');
  };


  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/userPage')
    }
    next()
  }

  app.get('/logout', function (req, res, next) {
    req.logout(function (err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });
}