Parse.Cloud.define('testehuallyd', function (req, res) {


    if (testehuallydfuncao("oi")) {
    res.success({msg:"foi"})

    } else {
    res.error({error:"error oi nao tcahu"})

    }
});

function testehuallydfuncao(variavelGAMBIRA) {
    if(variavelGAMBIRA == "oi") {
        return true
    } else {
        return false
    }
}

Parse.Cloud.beforeSave("Comment", function(request, response) {
  request.object.set("isDeleted", false);
  response.success();
});

Parse.Cloud.define('editUser', function(request, response) {
    var userId = request.params.userId;

    var User = Parse.Object.extend('_User'),
        user = new User({ objectId: userId });

    var currentUser = request.user;

    var relation = user.relation("friendsRelation");
    relation.add(currentUser);

    Parse.Cloud.useMasterKey();
    user.save().then(function(user) {
        response.success(user);
    }, function(error) {
        response.error(error)
    });
});