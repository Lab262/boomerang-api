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



Parse.Cloud.beforeSave("User", function(request, response) {
  if (request.object.isNew) {
      request.object.set("isDeleted", false);
  }
  response.success();
});

Parse.Cloud.beforeSave("Chat", function(request, response) {
     if (request.object.isNew) {
        request.object.set("isDeleted", false);
     }
    response.success();
});

Parse.Cloud.beforeSave("Comment", function(request, response) {
     if (request.object.isNew) {
        request.object.set("isDeleted", false);
     }
    response.success();
});

Parse.Cloud.beforeSave("Evaluation", function(request, response) {
     if (request.object.isNew) {
        request.object.set("isDeleted", false);
     }
    response.success();
});

Parse.Cloud.beforeSave("Follow", function(request, response) {
    if (request.object.isNew) {
        request.object.set("isDeleted", false);
    }
    response.success();
});

Parse.Cloud.beforeSave("Friend", function(request, response) {
    if (request.object.isNew) {
        request.object.set("isDeleted", false);
     }
    response.success();
});

Parse.Cloud.beforeSave("Interested", function(request, response) {
    if (request.object.isNew) {
        request.object.set("isDeleted", false);
     }
    response.success();
});

Parse.Cloud.beforeSave("Message", function(request, response) {
    if (request.object.isNew) {
        request.object.set("isDeleted", false);
    }
    response.success();
});

Parse.Cloud.beforeSave("Photo", function(request, response) {
    if (request.object.isNew) {
        request.object.set("isDeleted", false);
    }
    response.success();
});

Parse.Cloud.beforeSave("Post", function(request, response) {
    if (request.object.isNew) {
        request.object.set("isDeleted", false);
    }
    response.success();
});


// Parse.Cloud.define('editUser', function(request, response) {
//     var userId = request.params.userId;

//     var User = Parse.Object.extend('_User')
//     var user = new User({ objectId: userId });

//     var currentUser = request.user;

//     var relation = user.relation("friendsRelation");
//     relation.add(currentUser);

//     Parse.Cloud.useMasterKey();
//     user.save().then(function(user) {
//         response.success(user);
//     }, function(error) {
//         response.error(error)
//     });
// });



Parse.Cloud.beforeSave("Evaluation", function(request, response) {
    if (request.object.isNew) {
        request.object.set("isDeleted", false);
    }
    var schemeId = request.params.scheme.objectId;
    var Scheme = Parse.object.extend('Scheme');
    var scheme = new Scheme({objectId: schemeId});

    request.object.set("scheme", scheme);

    response.success();
});