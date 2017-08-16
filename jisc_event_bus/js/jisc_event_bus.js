/* Haplo Research Manager (Jisc RDSS)                https://haplo.org
 * (c) Haplo Services Ltd 2006 - 2017   https://www.haplo-services.com
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.         */

P.db.table("messages", {
    messageId: { type:"text", indexed:true, uniqueIndex:true },
    messageClass: { type:"text" },
    messageType: { type:"text" },
    sequence: { type:"text" },
    position: { type:"int" },
    // TODO: not clear if status *has* to be a string...
    //... or if we can be more sensible with ENUMs or something
    status: { type:"text" } 
});

var Bus = O.messageBus.remote("Jisc RDSS Event Bus").
    receive(function(msg) {
        var message = msg.parsedBody();
        if(!message) { 
            console.log("ERROR PARSING RECEIVED MESSAGE: "+msg); // throw maybe?
            return;
        }
        var rows = P.db.messages.select().where("messageId","=",message.header.messageId);
        if(rows.length) {
            console.log("Received already seen message: "+message.header.messageId);
        } else {
            P.db.messages.create({
                messageId: message.header.messageId,
                messageClass: message.header.messageClass,
                messageType: message.header.messageType,
                sequence: message.header.messageSequence.sequence,
                position: message.header.messageSequence.position,
                status: "RECEIVED" // SENT, TO_SEND, RECEIVED 
            }).save();
            console.log("Received new message:", JSON.stringify(msg.parsedBody(), undefined, 2));
            P.ingestObjectFromMessage(message);
        }
    }).
    deliveryReport(function(status, information, msg) {
        var message = msg.parsedBody();
        if(!message) { 
            console.log("ERROR PARSING DELIVERY REPORT: "+msg); // throw maybe?
            return;
        }
        var rows = P.db.messages.select().where("messageId","=",message.header.messageId);
        if(rows.length) {
            var row = rows[0];
            console.log("Delivery of message "+message.header.messageId+": "+status);
            if(status === "success") {
                row.status = "SENT";
                row.save();
            } else { // "failure"
                /* TODO: errors, error queue? */
            }
        } else {
            // TODO: is this what we should do if it was never 'TO_SEND'?
            console.log("Delievered message "+message.header.messageId+" that wasn't queued to be sent");
            P.db.messages.create({
                messageId: message.header.messageId,
                messageClass: message.header.messageClass,
                messageType: message.header.messageType,
                sequence: message.header.messageSequence.sequence,
                position: message.header.messageSequence.position,
                status: "SENT" // SENT, TO_SEND, RECEIVED 
            }).save();
        }
    });
    
P.hook("hPostObjectChange", function(response, object, operation, previous) {
    if(previous && O.service("hres:repository:is_repository_item", object)) {
        if(object.labels.includes(Label.AcceptedIntoRepository)) {
            // TODO: (maybe) background taskify the message bus sending?
            var isCreate = !(previous && previous.labels.includes(Label.AcceptedIntoRepository));
            var message = P.createMessageForBus(object, isCreate);
            P.db.messages.create({
                messageId: message.header.messageId,
                messageClass: message.header.messageClass,
                messageType: message.header.messageType,
                sequence: message.header.messageSequence.sequence,
                position: message.header.messageSequence.position,
                status: "TO_SEND" // SENT, TO_SEND, RECEIVED 
            }).save();
            Bus.message().body(message).send();
        }
    }
});
