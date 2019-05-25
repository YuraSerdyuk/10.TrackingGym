var express = require('express');
var app = express();
var http = require('http').Server(app);

var cookieParser = require('cookie-parser');
var session = require('express-session')
var bodyParser = require('body-parser');
var mongoose = require('mongoose');


app.use(cookieParser());
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
}));


app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.get('/', function(req, res) {
    req.session.destroy();
    res.clearCookie('connect.sid');

    console.log('рандомна сесія з входу: ', req.cookies['connect.sid']);

    res.render('login');
});

app.post('/title', (req, res) => {
    var login_data = req.body.login_data
    var password_data = req.body.password_data;
    if (login_data) {
        if (password_data) {
            mongoose.connect('mongodb://localhost/DATA', { useNewUrlParser: true })
            .then(() => console.log("MongoDB has started ..."))
            .catch(e => console.log(e));

            try {
                User = mongoose.model("User")
            } catch (error) {
                var User = mongoose.model("User", {
                    login: String,
                    password: String
                });
            }

            
            User.find({login: login_data, password: password_data}, function (err, docs) {
                if (docs != '') {
                    console.log('Success');
                    var session = req.cookies["connect.sid"];
                    var id = docs[0]._id
                    console.log('Session: ' + session);


                    try {
                        sossion = mongoose.model("Session")
                    } catch (error) {
                        var sossion = mongoose.model("Session", {
                            session_id: String,
                            user_id: String
                        });
                    }

                    var session = new sossion({
                        session_id: session,
                        user_id: id
                    });

                    session.save(function(err){
                        mongoose.disconnect();
                    });

                    var myResponse = {
                        warning_login: "",
                        warning_password: "",
                        triger: true,
                        id: id
                    };
                    res.send(JSON.stringify(myResponse));

                } else {
                    var myResponse = {
                        warning_login: "Incorrect email or password",
                        warning_password: ""
                    };
                    res.send(JSON.stringify(myResponse));
                }
            });
            
        
        } else {
            var myResponse = {
                warning_login: "",
                warning_password: "Please, fill in this field"
            };
            res.send(JSON.stringify(myResponse));
        }
    } else {
        var myResponse = {
            warning_login: "Please, fill in this field",
            warning_password: ""
        };
        res.send(JSON.stringify(myResponse));
    }

    

    
    //є варіант запхати res.send після кожного оголошення зміної myResponse(пробував - працює)
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/signUp', (req, res) => {
    var login_data = req.body.login_data
    var password_data = req.body.password_data;
    var password_repeat_data = req.body.password_repeat_data;

    if (login_data) {
        if (password_data) {
            if (password_repeat_data) {
                if (login_data.length >= 4) {
                    if (password_data.length >= 4) {
                        if (password_data == password_repeat_data) {

                            
                            
                            mongoose.connect('mongodb://localhost/DATA', { useNewUrlParser: true })
                            .then(() => console.log("MongoDB has started ..."))
                            .catch(e => console.log(e));

                            try {
                                User = mongoose.model("User")
                            } catch (error) {
                                var User = mongoose.model("User", {
                                    login: String,
                                    password: String
                                });
                            }

                            var user = new User({
                                login: login_data,
                                password: password_data
                            });
    
                            User.find({login: login_data}, function (err, docs) {
                                if (docs != '') {
                                    var Register = {
                                        warning_login: 'This login is busy',
                                        warning_password: '',
                                        warning_password_repeat: ''
                                    }
                                    res.send(JSON.stringify(Register));
                                } else {
                                    user.save(function(err){
                                        mongoose.disconnect();  // отключение от базы данных
                                          
                                        if (err) {
                                            var Register = {
                                                warning_login: err,
                                                warning_password: '',
                                                warning_password_repeat: ''
                                            }
                                            res.send(JSON.stringify(Register));
                                        } else {
                                            console.log('redirect');
                                            var Register = {
                                                warning_login: '',
                                                warning_password: '',
                                                warning_password_repeat: '',
                                                triger: true
                                            }
                                            res.send(JSON.stringify(Register));
                                        }
                                    });
                                }
                            });
                        } else {
                            var Register = {
                                warning_login: '',
                                warning_password: '',
                                warning_password_repeat: 'Passwords do not match'
                            }
                            res.send(JSON.stringify(Register));
                        }
                    } else {
                        var Register = {
                            warning_login: '',
                            warning_password: 'Password must have 4 symbol and more',
                            warning_password_repeat: ''
                        }
                        res.send(JSON.stringify(Register));
                    }
                } else {
                    var Register = {
                        warning_login: 'Login must have 4 symbol and more',
                        warning_password: '',
                        warning_password_repeat: ''
                    }
                    res.send(JSON.stringify(Register)); 
                }
            } else {
                var Register = {
                    warning_login: '',
                    warning_password: '',
                    warning_password_repeat: 'Please, fill in this field'
                }
                res.send(JSON.stringify(Register));
            }
        } else {
            var Register = {
                warning_login: '',
                warning_password: 'Please, fill in this field',
                warning_password_repeat: ''
            }
            res.send(JSON.stringify(Register));
        }
    } else {
        var Register = {
            warning_login: 'Please, fill in this field',
            warning_password: '',
            warning_password_repeat: ''
        }
        res.send(JSON.stringify(Register));
    }
});




app.get('/home', (req, res) => {
    var session = req.cookies["connect.sid"];
    var url = req.url;
    var user_id = url.split("?", 2)[1];

    mongoose.connect('mongodb://localhost/DATA', { useNewUrlParser: true })
    .then(() => console.log("MongoDB has started ..."))
    .catch(e => console.log(e));

    try {
        session_model = mongoose.model("Session")
    } catch (error) {
        var session_model = mongoose.model("Session", {
            session_id: String,
            user_id: String
        });
    }

    session_model.find({session_id: session}, function (err, docs) {
        if (docs != '') {
            var user_id = docs[0].user_id;

            try {
                group_model = mongoose.model("group")
            } catch (error) {
                var group_model = mongoose.model("group", {
                    user_id: String,
                    name_group: String
                });
            }

            group_model.find({user_id: user_id}, function (err, docs) {
                    var group_docs = docs;
                    //console.log("Number of groups: " + docs.length);

                    try {
                        exercise_model = mongoose.model("exercise")
                    } catch (error) {
                        var exercise_model = mongoose.model("exercise", {
                            user_id: String,
                            name_group: String,
                            name_exercise: String,
                            data_exercise: Object
                        });
                    }

                    exercise_model.find({user_id: user_id}, function (err, docs) {
                        var exercise_docs = docs; 
                        res.render('home', {
                            group_docs: group_docs,
                            exercise_docs: exercise_docs
                        });
                    });
                
           });
        } else {
            res.redirect('/')
        }
        
    });
})

app.post('/group_success', (req, res) => {
    var old_group_name = req.body.old_group_name;
    var new_group_name = req.body.new_group_name;
    var session = req.cookies["connect.sid"]; 
    console.log('Old group name: ' + old_group_name + '; New group name: ' + new_group_name);
    
    mongoose.connect('mongodb://localhost/DATA', { useNewUrlParser: true })
        .then(() => {console.log('MongoDB has started')})
        .catch(e => {console.log(e)})

    try {
        session_model = mongoose.model("Session")
    } catch (error) {
        var session_model = mongoose.model("Session", {
            session_id: String,
            user_id: String
        });
    }

    session_model.find({session_id: session}, function (err, docs) {
        var user_id = docs[0].user_id;

        try {
            group_model = mongoose.model("group")
        } catch (error) {
            var group_model = mongoose.model("group", {
                user_id: String,
                name_group: String
            });
        }

        if (old_group_name.length == 0) {
            var group = new group_model({
                user_id: user_id,
                name_group: new_group_name
            });
            group.save(function(err){
                mongoose.disconnect();
            });
            
            var group_success = {
                data: true
            }
            res.send(JSON.stringify(group_success));
        } else {
            group_model.findOneAndUpdate({user_id: user_id, name_group: old_group_name}, {name_group: new_group_name}, function(err, result){
                if (result) {

                    try {
                        data_model = mongoose.model("exercise")
                    } catch (error) {
                        var data_model = mongoose.model("exercise", {
                            user_id: String,
                            name_group: String,
                            name_exercise: String,
                            data_exercise: Object
                        });
                    }

                    data_model.updateMany({user_id: user_id, name_group: old_group_name}, {name_group: new_group_name}, function(err, result){
                        mongoose.disconnect();
                        if (result) {
                            var group_success = {
                                data: true
                            }
                            res.send(JSON.stringify(group_success));
                        } else if (err) {
                            var group_success = {
                                data: false
                            }
                            res.send(JSON.stringify(group_success));
                        }
                    });
                } else if (err) {
                    var group_success = {
                        data: false
                    }
                    res.send(JSON.stringify(group_success));
                }
            });
        }
        
        

    });


});

app.post('/exercise_success', (req,res) => {
    var old_exercise_name = req.body.old_exercise_name;
    var new_exercise_name = req.body.new_exercise_name;
    var group_name = req.body.group_name;
    var session = req.cookies["connect.sid"]; 
    console.log('Old name exercise: ' + old_exercise_name + '; New name exercise: ' + new_exercise_name);

    mongoose.connect('mongodb://localhost/DATA', { useNewUrlParser: true })
        .then(() => {console.log('MongoDB has started')})
        .catch(e => {console.log(e)})

    try {
        session_model = mongoose.model("Session")
    } catch (error) {
        var session_model = mongoose.model("Session", {
            session_id: String,
            user_id: String
        });
    }

    session_model.find({session_id: session}, function (err, docs) {
        var user_id = docs[0].user_id;
        
        try {
            data_model = mongoose.model("exercise")
        } catch (error) {
            var data_model = mongoose.model("exercise", {
                user_id: String,
                name_group: String,
                name_exercise: String,
                data_exercise: Object
            });
        }

        if (old_exercise_name.length == 0) {
            var exercise = new data_model({
                user_id: user_id,
                name_group: group_name,
                name_exercise: new_exercise_name,
                data_exercise: []
            });
            exercise.save(function(err){
                mongoose.disconnect();
            });
            
            var exercise_success = {
                data: true
            }
            res.send(JSON.stringify(exercise_success));
        } else {
            data_model.updateMany({user_id: user_id, name_exercise: old_exercise_name}, {name_exercise: new_exercise_name}, function(err, result){
                mongoose.disconnect();
                if (result) {
                    var exercise_success = {
                        data: true
                    }
                    res.send(JSON.stringify(exercise_success));
                } else if (err) {
                    var exercise_success = {
                        data: false
                    }
                    res.send(JSON.stringify(exercise_success));
                }
            });
        }

        
        

    });

});

app.post('/cell_access', (req,res) => {
    var session = req.cookies["connect.sid"];
    var data = req.body.data;
    var input_exercise_name = req.body.input_exercise_name;
    console.log(input_exercise_name);
    console.log(data);

    mongoose.connect('mongodb://localhost/DATA', { useNewUrlParser: true })
        .then(() => {console.log('MongoDB has started')})
        .catch(e => {console.log(e)})

    try {
        session_model = mongoose.model("Session")
    } catch (error) {
        var session_model = mongoose.model("Session", {
            session_id: String,
            user_id: String
        });
    }

    session_model.find({session_id: session}, function (err, docs) {
        var user_id = docs[0].user_id;
        
        try {
            data_model = mongoose.model("exercise")
        } catch (error) {
            var data_model = mongoose.model("exercise", {
                user_id: String,
                name_group: String,
                name_exercise: String,
                data_exercise: Object
            });
        }
        data_model.find({name_exercise: input_exercise_name}, function (err, docs) {
            var old_data = docs[0].data_exercise;
            old_data.push(data[0])
            old_data.push(data[1])
            old_data.push(data[2])
            old_data.push(data[3])
            
            var new_data = old_data
            console.log(new_data);

            data_model.findOneAndUpdate({user_id: user_id, name_exercise: input_exercise_name}, {data_exercise: new_data}, function(err, result){
                
                mongoose.disconnect();
                if (result) {
                    var cell = {
                        data: new_data
                    }
                    res.send(JSON.stringify(cell));
                } else if (err) {
                    console.log(err);
                    var cell = {
                        data: false
                    }
                    res.send(JSON.stringify(cell));
                }
                
                
            });

        })

        
    });

});

app.post('/get_exercise', (req, res) => {
    var session = req.cookies["connect.sid"];
    var name_group = req.body.name_group ;

    mongoose.connect('mongodb://localhost/DATA', { useNewUrlParser: true })
        .then(() => {console.log('MongoDB has started')})
        .catch(e => {console.log(e)})

    try {
        session_model = mongoose.model("Session")
    } catch (error) {
        var session_model = mongoose.model("Session", {
            session_id: String,
            user_id: String
        });
    }

    session_model.find({session_id: session}, function (err, docs) {
        var user_id = docs[0].user_id;

        try {
            data_model = mongoose.model("exercise")
        } catch (error) {
            var data_model = mongoose.model("exercise", {
                user_id: String,
                name_group: String,
                name_exercise: String,
                data_exercise: Object
            });
        }

        data_model.find({user_id: user_id, name_group: name_group}, function (err, docs) {
            if (docs.length == 0) {
                var zero_exercise = {
                    length: docs.length,
                    exercise1: 'nothing'
                }
                res.send(JSON.stringify(zero_exercise));
            } else if (docs.length == 1) {
                var one_exercise = {
                    length: docs.length,
                    exercise1: docs[0].name_exercise
                }
                res.send(JSON.stringify(one_exercise));
            } else if (docs.length >= 2) {
                var two_exercise = {
                    length: docs.length,
                    exercise1: docs[0].name_exercise,
                    exercise2: docs[1].name_exercise
                }
                res.send(JSON.stringify(two_exercise));
            }
            
        });
    });

});

app.post('/remove_group', (req, res) => {
    var session = req.cookies["connect.sid"];
    var name_group = req.body.name_group ;

    mongoose.connect('mongodb://localhost/DATA', { useNewUrlParser: true })
        .then(() => {console.log('MongoDB has started')})
        .catch(e => {console.log(e)})

    try {
        session_model = mongoose.model("Session")
    } catch (error) {
        var session_model = mongoose.model("Session", {
            session_id: String,
            user_id: String
        });
    }

    session_model.find({session_id: session}, function (err, docs) {
        var user_id = docs[0].user_id;

        try {
            group_model = mongoose.model("group")
        } catch (error) {
            var group_model = mongoose.model("group", {
                user_id: String,
                name_group: String
            });
        }

        group_model.deleteOne({name_group: name_group, user_id: user_id}, function(err, result) {
            console.log("Remove groups: " + result.deletedCount);
            
            if (result.deletedCount == 0) {
                var result = {
                    result: false
                }
                res.send(JSON.stringify(result));
            } else if (err) {
                console.log(err);
                var result = {
                    result: false
                }
                res.send(JSON.stringify(result));
            } else {

                try {
                    data_model = mongoose.model("exercise")
                } catch (error) {
                    var data_model = mongoose.model("exercise", {
                        user_id: String,
                        name_group: String,
                        name_exercise: String,
                        data_exercise: Object
                    });
                }

                data_model.deleteMany({name_group: name_group, user_id: user_id}, function(err, result) {
                    console.log("Remove exercises: " + result.deletedCount);

                    if(err){
                        console.log(err);
                        var result = {
                            result: false
                        }
                        res.send(JSON.stringify(result));
                    } else {
                        var result = {
                            result: true
                        }
                        res.send(JSON.stringify(result));
                    }

                });


                
            }
        })
        
    });
});

app.post('/remove_exercise', (req, res) => {
    var session = req.cookies["connect.sid"];
    var name_exercise = req.body.name_exercise ;

    mongoose.connect('mongodb://localhost/DATA', { useNewUrlParser: true })
        .then(() => {console.log('MongoDB has started')})
        .catch(e => {console.log(e)})

    try {
        session_model = mongoose.model("Session")
    } catch (error) {
        var session_model = mongoose.model("Session", {
            session_id: String,
            user_id: String
        });
    }

    session_model.find({session_id: session}, function (err, docs) {
        var user_id = docs[0].user_id;

        try {
            data_model = mongoose.model("exercise")
        } catch (error) {
            var data_model = mongoose.model("exercise", {
                user_id: String,
                name_group: String,
                name_exercise: String,
                data_exercise: Object
            });
        }

        data_model.deleteOne({name_exercise: name_exercise, user_id: user_id}, function(err, result) {
            console.log("Remove exercise: " + result.deletedCount);

            if (result.deletedCount == 1) {
                var result = {
                    result: true
                }
                res.send(JSON.stringify(result));
            } else if(err){
                console.log(err);
                var result = {
                    result: false
                }
                res.send(JSON.stringify(result));
            } else {
                var result = {
                    result: false
                }
                res.send(JSON.stringify(result));
            }

        });

    });
});

http.listen(5000, function(){
    console.log('listening on: 5000 port');
});










// // ПОЧАТОК   РОБОТА З MONGODB через MONGOOSE 
// //CONNECT до бд "DATA", якщо її нема то автоматично створює
// mongoose.connect('mongodb://localhost/DATA', { useNewUrlParser: true })
// .then(() => console.log("MongoDB has started ..."))
// .catch(e => console.log(e));

// //ОПРАЦЮВАННЯ ПОМИЛКИ. АДЖЕ СТВОРЕНУ МОДЕЛЬ "USER" ДВА РАЗИ СТВОРЮВАТИ НЕ МОЖНА, В САМОМУ КОДІ ЛЕГКО РОЗІБРАТИСЬ
// try {
//     User = mongoose.model("User")
// } catch (error) {
//     var User = mongoose.model("User", {
//         login: String,
//         password: String
//     });
// }

// //В НОВОСТВОРЕНУ СХЕМУ(МОДУЛЬ) ПОДАЮТЬСЯ ДАННІ
// var user = new User({
//     login: login_data,
//     password: password_data
// });

// //ДАННІ ЗБЕРІГАЮТЬСЯ І ВІДПРАВЛЯЮТЬСЯ ДО MONGODB
// user.save(function(err){
//     mongoose.disconnect();  // отключение от базы данных
        
//     if(err) return console.log(err);
//     console.log("Об'єкт збережено: ", user);
// });
// //КІНЕЦЬ   РОБОТИ З MONGODB через MONGOOSE