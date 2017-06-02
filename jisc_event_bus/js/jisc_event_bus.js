/* Haplo Research Manager (Jisc RDSS)                https://haplo.org
 * (c) Haplo Services Ltd 2006 - 2017   https://www.haplo-services.com
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.         */


var Bus = O.messageBus.remote("Jisc RDSS Event Bus").
    receive(function(msg) {
        console.log("Received message:", JSON.stringify(msg.parsedBody(), undefined, 2));
    });
    
P.hook("hPostObjectChange", function(response, object, operation, previous) {
    if(O.service("hres:repository:is_repository_item", object)) {
        
        if(object.labels.includes(Label.AcceptedIntoRepository)) {
            
            var isCreate = !previous.labels.includes(Label.AcceptedIntoRepository);
            var body = {
                datasetUUID: object.ref.toString(),
                datasetTitle: object.title,
                datasetDescription: object.first(A.Abstract) ? object.first(A.Abstract).toString : null,
                datasetResourceType: "dataset"
            };
            if(object.first(A.File)) {
                body.datasetFile = _.map(object.every(A.File), function(fileId) {
                    
                    var file = O.file(fileId);
                    return {                        
                        fileUUID: fileId.digest,
                        fileIdentifier: fileId.digest,
                        fileName: fileId.filename,
                        fileSize: fileId.fileSize,
                        fileDate: file.createdAt,
                        fileUse: 0,     // Enum: OriginalFile
                        preservationEvent: {
                            preservationEventValue: isCreate ? "create" : "update",
                            preservationEventType: 0 // Enum: capture
                        },
                        uploadStatus: 1, // Enum: uploadComplete,
                        storageStatus: 0, // Enum: online
                        fileStorageLocation: file.url({
                            asFullURL: true
                        })
                    };
                });
            }
            
            Bus.message().body({
                header: {
                    messageId: 1,
                    messageClass: "Event",
                    messageType: isCreate ? "MetadataCreate" : "MetadataUpdate",
                    messageTimings: {
                        publishedTimestamp: new Date()
                    },
                    messageSequence: {
                        sequence: "test",
                        position: 1,
                        total: 1
                    }
                },
                body: body
            }).send();
            
        }
        
    }
});
