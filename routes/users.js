var express = require('express');
const bcrypt = require('bcrypt');
var router = express.Router();

/* GET users listing. */
router.get('/getadminlist/:token', function(req, res, next) {

  // console.log(req.params.token);
  // console.log(req);
  token = req.params.token;
  if (token === undefined) {
    res.status(200).send('Invalid Data');
    return false;
  }

  authCheckSql = "SELECT * FROM tbl__super_admin WHERE admin_authToken='" + token+"'";
  // console.log(authCheckSql);
  db.query(authCheckSql, function name(err, checkData) {
    if (err) {
      console.log(err);
    }
    // console.log(checkData);
    if (checkData.length > 0) {
    
    let adminListSql = "SELECT * FROM tbl__admin WHERE admin_status='1'";
    db.query(adminListSql, function (err, data) {

      if (err) {
        console.log(err);
      }

      res.status(200).json(data);
    });

    } else {
      res.status(200).json('Invalid Auth Token');
    }

  }) 
});

router.post('/getadminrole',function(req,res,next) {
  
  if (req.body.token === undefined ||
    req.body.admin_id === undefined) {

    res.status(200).json('Invalid Data');
    return false;
  }
  token = req.body.token;
  adminId = req.body.admin_id;

  authCheckSql = "SELECT * FROM tbl__super_admin WHERE admin_authToken='" + token + "'";
  db.query(authCheckSql, function name(err, checkData) {
    if (err) {
      console.log(err);
    }
    
    if (checkData.length > 0) {

      let adminPermissionSql = "SELECT * FROM tbl__admin_permission WHERE admin_id ='" +adminId+ "'";
      db.query(adminPermissionSql, function (err, data) {

        if (err) {
          console.log(err);
        }

        res.status(200).json(data);
      });

    } else {
      res.status(200).json('Invalid Auth Token');
    }

  });




});

router.post('/updateadminrole', function (req, res, next) {

  //console.log(req.body);
  if (req.body.token === undefined ||
    req.body.admin_id === undefined || 
    req.body.enq_read === undefined ||
    req.body.enq_write === undefined ||
    req.body.ins_read === undefined ||
    req.body.ins_write === undefined ||
    req.body.ven_read === undefined ||
    req.body.ven_write === undefined ||
    req.body.user_read === undefined ||
    req.body.user_write === undefined ||
    req.body.rate_read === undefined ||
    req.body.rate_write === undefined) {

    res.status(200).json('Invalid Data');
    return false;
  }
  token = req.body.token;
  adminId = req.body.admin_id;
  enqRead = req.body.enq_read;
  enqWrite = req.body.enq_write;
  insRead = req.body.ins_read;
  insWrite = req.body.ins_write;
  venRead = req.body.ven_read;
  venWrite = req.body.ven_write;
  userRead = req.body.user_read;
  userWrite = req.body.user_write;
  rateRead = req.body.rate_read;
  rateWrite = req.body.rate_write;
  

  authCheckSql = "SELECT * FROM tbl__super_admin WHERE admin_authToken='" + token + "'";
  db.query(authCheckSql, function name(err, checkData) {
    if (err) {
      console.log(err);
    }

    if (checkData.length > 0) {

      updatePerSql = "UPDATE tbl__admin_permission SET enq_read='" + enqRead 
        + "', enq_write='" + enqWrite + "', ins_read='" + insRead + "', ins_write='" + insWrite 
        + "', ven_read='" + venRead + "', ven_write='" + venWrite + "', user_read='" + userRead 
        + "', user_write='" + userWrite + "', rate_read='" + rateRead + "', rate_write='" + rateWrite 
        +"' WHERE admin_id='" + adminId + "'";
      db.query(updatePerSql, function (err, data) {
        if (err) {
          console.log(err);
        }

        res.status(200).json(data);
      });

    } else {
      res.status(200).json('Invalid Auth Token');
    }

  });




});

router.post('/register', function(req,res,next) {
  if (req.body.firstName === undefined ||
      req.body.lastName === undefined ||
      req.body.email === undefined ||
      req.body.password === undefined ) {

    res.status(200).json('Invalid Data');
    return false;
  }
  salt = 4;

  firstName = req.body.firstName;
  lastName = req.body.lastName;
  email = req.body.email;
  password = req.body.password;

  bcrypt.hash(req.body.password, salt, (err, encrypted) => {
    password = encrypted
    registerSql = "INSERT INTO tbl__super_admin(`admin_name`,`admin_password`,`admin_first_name`,`admin_last_name`,`admin_status`) VALUES('" + email
      + "','" + password + "','" + firstName + "','" + lastName + "','1')";
    db.query(registerSql, function (err, data) {
      if (err) {
        console.log(err);
        res.status(200).json(err);
        
      };
      res.status(200).json(data);
    });
  })

});

router.post('/login',function(req,res,next) {
  // validArray = ['admin_name', 'admin_password'];
  // userObject = req.body;
  // keys = Object.keys(userObject);
  // console.log(keys);
  // keys.map(function(value, index, array){
  //   indexValue = validArray.indexOf(value);
  //   if (indexValue == -1) {
  //     res.json('Invalid Data');
  //     return false;
  //   }
  // })

  if (req.body.admin_name === undefined || req.body.admin_password === undefined) {
    res.status(200).json('Invalid Data');
    return false;
  }
  let admin_name = req.body.admin_name;
  let admin_password = req.body.admin_password;
  let salt = 4;
  let loginSql = "SELECT * FROM tbl__super_admin WHERE admin_name='" + admin_name
    + "' AND admin_status='1'";
  db.query(loginSql,function name(err,data) {
    
    if(err) {
      console.log(err);
    }
    
    //console.log(data.length);

    //  console.log(admin_password);

      if(data.length == 0) {
        res.json([]);
        return false;
      }
      bcrypt.compare(admin_password, data[0].admin_password, function (err, result) {
          if (result == true) {
            console.log('came inside of result');
            var rand = function () {
              return Math.random().toString(36).substr(2); // remove `0.`
            };

            var token = function () {
              return rand() + rand(); // to make it longer
            };
            token = token();

            update_sql = "UPDATE tbl__super_admin SET admin_authToken='"+token+"' WHERE admin_id='"+
              data[0].admin_id+"'";
            db.query(update_sql, function name(err, updateData) {
              if (err) {
                console.log(err);
              }

              var newData = Object.assign({}, data);
              newData[0]['admin_authToken'] = token;
              res.json(newData);
            });        
            // redirect to location
          } else {
            res.json([]);
            // redirect to login page
          }
        })  
    
    
  });

});

module.exports = router;
