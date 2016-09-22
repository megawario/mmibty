
/** Super user creadentials **/
var email = "mpinto011@gmail.com";
var password="pissas";
var username="admin";

db = connect("localhost:27020/mmibty");

db.nusers.insert({"email":email,"password":password,"username":username,"admin":true});
