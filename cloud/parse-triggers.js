var allTables = ["Interested", "Comment", "Scheme", "Chat", "Post", "Follow"];
    for (i = 0; i < allTables.length; i++) { 
        Parse.Cloud.beforeFind(allTables[i], function(req) {
           let query = req.query;
           query.containedIn("isDeleted", [false, null]);
           return query
        });
    }

    Parse.Cloud.afterSave("Comment", function(request, response) {
        var notificationColunms = {};
        request.object.get("post").fetch().then(function(postResult){
            notificationColunms["post"] = postResult
            return postResult.get("author").fetch()
        }).then(function (receiverResult) {
            notificationColunms["receiver"] = receiverResult
            return request.object.get("author").fetch()
        }).then(function (senderResult) {
            notificationColunms["sender"] = senderResult
            createNotification(notificationColunms, response, "Comentou em seu post.");
        }, function (err) {
            response.error("ERROR" + err)
        });
    });

    Parse.Cloud.afterSave("Recommended", function(request, response) {
        var notificationColunms = {};
        var titlePost;
        request.object.get("post").fetch().then(function(postResult){
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
    var NotificationObject =  Parse.Object.extend("Notification");
    var notification = new NotificationObject();
    notificationColunms["hasBeenSeen"] = false;
    notificationColunms["isDeleted"] = false;
    notificationColunms["notificationDescription"] = message
    
     for (colunm in notificationColunms) {
          notification.set(colunm, notificationColunms[colunm]);
     }

     notification.save({ success: function (newNotification) {
         response.success();
         }, error: function (err) {
             response.error("Error: " + error.code + " " + error.message);
         }
    }); 
}

Parse.Cloud.define("featuredPosts", function(request, response) {
  var query = new Parse.Query("Post");

  query.limit(request.params.pagination[0]);
  query.include(request.params.include[0]);
  query.descending('createdAt');

  if (request.params.objectId != undefined) {
      query.greaterThanOrEqualTo("updatedAt", request.params.updatedAt[0])
      query.notContainedIn("objectId", request.params.objectId)
  }

  query.find({
    success: function(results) {
      response.success(results);
    },
    error: function() {
      response.error("Featured Posts Error");
    }
  });
});

Parse.Cloud.define("averageStars", function(request, response) {
  var query = new Parse.Query("Evaluation");
  query.equalTo("movie", request.params.movie);
  query.find({
    success: function(results) {
      var sum = 0;
      for (var i = 0; i < results.length; ++i) {
        sum += results[i].get("stars");
      }
      response.success(sum / results.length);
    },
    error: function() {
      response.error("movie lookup failed");
    }
  });
});



