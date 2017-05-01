var allTables = ["Interested", "Comment", "Scheme", "Chat"];
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
            createNotification(notificationColunms, response);
        }, function (err) {
            response.error("ERROR" + err)
        });
    });


function createNotification(notificationColunms, response) {
    var NotificationObject =  Parse.Object.extend("Notification");
    var notification = new NotificationObject();
    notificationColunms["hasBeenSeen"] = false;
    notificationColunms["isDeleted"] = false;
    notificationColunms["notificationDescription"] = "Comentou em seu post."
    
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


