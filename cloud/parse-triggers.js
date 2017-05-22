var allTables = ["Interested", "Comment", "Scheme", "Chat", "Post"];
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


