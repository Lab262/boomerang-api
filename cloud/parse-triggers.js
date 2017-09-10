var allTables = ["Interested", "Comment", "Scheme", "Chat", "Post", "Follow", "Message", "Notification", "Recommended", "Like"];
for (i = 0; i < allTables.length; i++) {
    Parse.Cloud.beforeFind(allTables[i], function (req) {
        let query = req.query;
        query.containedIn("isDeleted", [false, null]);
        return query
    });
}


Parse.Cloud.afterSave("Scheme", function (request, response) {
    var schemeObject = request.object;
    if (schemeObject.get("isDeleted") == true) {
        return
    }

    var notificationColunms = {};
    var receiver;
    var sender;

    request.object.get("post").fetch().then(function (postResult) {
        notificationColunms["post"] = postResult
        return postResult.get("author").fetch()
    }).then(function (receiverResult) {
        receiver = receiverResult
        notificationColunms["receiver"] = receiverResult
        return request.object.get("requester").fetch()
    }).then(function (senderResult) {
        sender = senderResult
        notificationColunms["sender"] = senderResult
        return request.object.get("status").fetch()
    }).then(function (statusResult) {
        let status = statusResult.get("status")
        if (status == "Negotiation") {
            createNotification(notificationColunms, response, "entrou na sua lista de espera");
        } else if (status == "Progress") {
            notificationColunms["receiver"] = sender
            notificationColunms["sender"] = receiver
            notificationColunms["scheme"] = request.object;
            createNotification(notificationColunms, response, "aceitou entrar em um esquema com você!");
        } else {
            notificationColunms["receiver"] = sender
            notificationColunms["sender"] = receiver
            notificationColunms["scheme"] = request.object;
            createNotification(notificationColunms, response, "finalizou um esquema com você");
        }
    }, function (err) {
        response.error("ERROR" + err)
    });
});

Parse.Cloud.afterSave("Comment", function (request, response) {
    var commentObject = request.object;
    if (commentObject.get("isDeleted") == true) {
        return
    }

    var notificationColunms = {};
    request.object.get("post").fetch().then(function (postResult) {
        notificationColunms["post"] = postResult
        return postResult.get("author").fetch()
    }).then(function (receiverResult) {
        notificationColunms["receiver"] = receiverResult
        return request.object.get("author").fetch()
    }).then(function (senderResult) {
        if (notificationColunms["receiver"]['id'] == senderResult['id']) {
            return
        }
        notificationColunms["sender"] = senderResult
        createNotification(notificationColunms, response, "comentou em seu post.");
    }, function (err) {
        response.error("ERROR" + err)
    });
});


Parse.Cloud.afterSave("Recommended", function (request, response) {
    var recommendedObject = request.object;
    if (recommendedObject.get("isDeleted") == true) {
        return
    }
    var notificationColunms = {};
    var titlePost;
    request.object.get("post").fetch().then(function (postResult) {
        notificationColunms["post"] = postResult
        titlePost = postResult.get("title");
        return request.object.get("receiver").fetch()
    }).then(function (receiverResult) {
        notificationColunms["receiver"] = receiverResult
        return request.object.get("sender").fetch()
    }).then(function (senderResult) {
        notificationColunms["sender"] = senderResult
        let message = "Recomendou " + titlePost;
        createNotification(notificationColunms, response, message);
    }, function (err) {
        response.error("ERROR" + err)
    });
});

function createNotification(notificationColunms, response, message) {
    var NotificationObject = Parse.Object.extend("Notification");
    var notification = new NotificationObject();
    notificationColunms["hasBeenSeen"] = false;
    notificationColunms["isDeleted"] = false;
    notificationColunms["notificationDescription"] = message

    for (colunm in notificationColunms) {
        notification.set(colunm, notificationColunms[colunm]);
    }

    notification.save({
        success: function (newNotification) {
            response.success();
        }, error: function (err) {
            response.error("Error: " + error.code + " " + error.message);
        }
    });
}

Parse.Cloud.define("likePost", function (request, response) {
    var postObject;
    fetchPost(request.params.postId).then(function (post) {
        postObject = post[0];
        return fetchProfile(request.params.profileId)
    }).then(function (profile) {
        var Like = Parse.Object.extend("Like");
        var like = new Like();
        like.set("post", postObject);
        like.set("profile", profile[0]);
        like.save({
            success: function (newNotification) {
                response.success();
            }, error: function (err) {
                response.error("Error: " + error.code + " " + error.message);
            }
        });
    });
});

Parse.Cloud.define("featuredPosts", function (request, response) {
    var query = new Parse.Query("Post");
    query.limit(request.params.pagination[0]);
    query.include(request.params.include[0]);
    query.descending('createdAt');
    query.containedIn("isAvailable", [true, null]);

    if (request.params.objectId != undefined) {
        query.greaterThanOrEqualTo("updatedAt", request.params.updatedAt[0])
        query.notContainedIn("objectId", request.params.objectId)
    }

    query.find({
        success: function (results) {
            response.success(results);
        },
        error: function () {
            response.error("Featured Posts Error");
        }
    });
});

Parse.Cloud.afterSave("Interested", function (request, response) {
    var interestedObject = request.object;
    if (interestedObject.get("isDeleted") != true) {
        createChat(interestedObject);
    } else {
        let requester = interestedObject.get("user");
        var chat;

        request.object.get("post").fetch().then(function (postResult) {
            return fetchScheme(postResult, postResult.get("author"), requester);
        }).then(function (scheme) {
            chat = scheme[0].get("chat");
            return updateObjectForDelete(scheme[0]);
        }).then(function (success) {
            return updateObjectForDelete(chat);
        }).then(function (success) {
            response.success(success);
        }, function (err) {
            response.error("ERROR" + err)

        });
    }
});

var updateObjectForDelete = function (object) {
    object.set("isDeleted", true)
    return object.save();
};

function createChat(interested) {
    var ChatObject = Parse.Object.extend("Chat");
    var chat = new ChatObject();
    chat.set("requester", interested.get("user"));
    chat.set("post", interested.get("post"));

    interested.get("post").fetch().then(function (postResult) {
        return postResult.get("author").fetch()
    }).then(function (authorResult) {
        chat.set("owner", authorResult)
        chat.save({
            success: function (newChat) {
                createScheme(newChat)
            }, error: function (err) {
                response.error("Error: " + error.code + " " + error.message);
            }
        });
    }, function (err) {
        response.error("ERROR" + err)
    });
}

var fetchStatus = function (status) {
    var query = new Parse.Query("SchemeStatus");
    query.equalTo("status", status);
    return query.find();
};


var fetchScheme = function (post, owner, requester) {
    var query = new Parse.Query("Scheme");
    query.equalTo("post", post);
    query.equalTo("owner", owner);
    query.equalTo("requester", requester)
    return query.find();
};

var fetchPost = function (postId) {
    var query = new Parse.Query("Post");
    query.equalTo("objectId", postId);
    return query.find();
};

var fetchProfile = function (profileId) {
    var query = new Parse.Query("Profile");
    query.equalTo("objectId", profileId);
    return query.find();
};

function createScheme(chat) {
    var SchemeObject = Parse.Object.extend("Scheme");
    var scheme = new SchemeObject();
    scheme.set("owner", chat.get("owner"));
    scheme.set("requester", chat.get("requester"));
    scheme.set("post", chat.get("post"));
    scheme.set("chat", chat);

    fetchStatus("Negotiation").then(function (status) {
        scheme.set("status", status[0])
        scheme.save({
            success: function (newScheme) {
                response.success(newScheme);
            }, error: function (err) {
                response.error("Error: " + error.code + " " + error.message);
            }
        });
    });
}

Parse.Cloud.afterSave("Message", function (request, response) {
    var messageObject = request.object

    if (messageObject.get("isDeleted") == true) {
        return
    }

    var receiveUserProfile = messageObject.get('receiver');
    var receiverUser = new Parse.Query(Parse.User);
    receiverUser.equalTo("profile", receiveUserProfile);
    // Find devices associated with these users
    var pushQuery = new Parse.Query(Parse.Installation);
    pushQuery.matchesQuery('user', receiverUser);
    var sender = messageObject.get('sender');
    sender.fetch().then(function (senderResult) {
        senderName = senderResult.get("firstName");
        let notificationDescription = senderName + " " + "te enviou uma mensagem"
        Parse.Push.send({
            where: pushQuery,
            data: {
                alert: notificationDescription
            }
        }, {
                useMasterKey: true
            }).then(function () {
                response.success();
            }).catch(function (err) {
                response.error("ERROR" + err);
            });
    });
});


Parse.Cloud.afterSave("Notification", function (request, response) {
    var notificationObject = request.object
    if (notificationObject.get("isDeleted") == true) {
        return
    }
    var receiveUserProfile = notificationObject.get('receiver');
    var receiverUser = new Parse.Query(Parse.User);
    receiverUser.equalTo("profile", receiveUserProfile);
    // Find devices associated with these users
    var pushQuery = new Parse.Query(Parse.Installation);
    pushQuery.matchesQuery('user', receiverUser);
    var sender = notificationObject.get('sender');
    sender.fetch().then(function (senderResult) {
        senderName = senderResult.get("firstName");
        let notificationDescription = senderName + " " + notificationObject.get('notificationDescription')
        Parse.Push.send({
            where: pushQuery,
            data: {
                alert: notificationDescription
            }
        }, {
                useMasterKey: true
            }).then(function () {
                response.success();
            }).catch(function (err) {
                response.error("ERROR" + err);
            });
    });
});

Parse.Cloud.define("otherUsers", function (request, response) {
    var query = new Parse.Query("Follow");

    query.limit(request.params.pagination[0]);
    query.include(request.params.include[0]);
    query.descending('createdAt');

    if (request.params.objectId != undefined) {
        query.greaterThanOrEqualTo("updatedAt", request.params.updatedAt[0])
        query.notContainedIn("objectId", request.params.objectId)
    }

    query.find({
        success: function (results) {
            response.success(results);
        },
        error: function () {
            response.error("Featured Posts Error");
        }
    });
});

// Parse.Cloud.define("averageStars", function(request, response) {
//   var query = new Parse.Query("Evaluation");
//   query.equalTo("movie", request.params.movie);
//   query.find({
//     success: function(results) {
//       var sum = 0;
//       for (var i = 0; i < results.length; ++i) {
//         sum += results[i].get("stars");
//       }
//       response.success(sum / results.length);
//     },
//     error: function() {
//       response.error("movie lookup failed");
//     }
//   });
// });



