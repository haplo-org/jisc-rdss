/* Haplo Research Manager (Jisc RDSS)                https://haplo.org
 * (c) Haplo Services Ltd 2006 - 2017   https://www.haplo-services.com
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.         */

var JISC = P.jisc;

var getUuidForObject = function(object) {
    var fromObject = object.first(A.UUID);
    if(fromObject) { return fromObject; }
    else {
        var uuid = O.uuid.randomUUID();
        O.impersonating(O.SYSTEM, function() {
            var mutable = object.mutableCopy();
            mutable.append(uuid, A.UUID);
            mutable.save();
        });
        return uuid; // is save() above guaranteed?
    }
};

var getUuidForFile = function(file) {
    var fromFile = file.tags["jisc_rdss:uuid"];
    if(fromFile) { return O.uuid.fromString(fromFile); }
    else {
        var uuid = O.uuid.randomUUID();
        file.changeTags({"jisc_rdss:uuid": uuid.toString()});
        return uuid;
    }
};

var getPersonIdentifiers = function(person) {
    var user = O.user(person.ref);
    if(!user) { return; }
    var identifiers = [];
    var orcid = O.serviceMaybe("hres:orcid:integration:for_user", user);
    if(orcid) {
        identifiers.push({personIdentifierValue: orcid, personIdentifierType: JISC.schema.personIdentifierType.ORCID});
    }
    if("Twitter" in A) {
        person.every(A.Twitter, function(v) {
            identifiers.push({personIdentifierValue: v, personIdentifierType: JISC.schema.personIdentifierType.Twitter});
        });
    }
    return identifiers;
};

var getPersonOrganisations = function(person) {
    // TODO: get actual organisations instead of this temp demonstration
    var organisations = [];
    var uni = O.query().link(T.University, A.Type).execute()[0];
    organisations.push({
        organisationJiscId: 0, // TODO: what is this, what do you use for test data?
        organisationName: uni.title,
        organisationType: JISC.schema.organisationType.higherEducation,
        organisationAddress: "" // don't store this on RI
    });
    return organisations;
};

var getPersonAffiliations = function(person) {
    return [JISC.schema.eduPersonScopedAffiliation.faculty]; // ??
};

P.serializePersonForBus = function(person, entitlement) {
    // TODO: non-object text based citations
    // can we even do anything in this case? UUID is required, and generating
    // and sending a random one each time doesn't feel right.
    if(person && person.ref) {
        var r = {};
        r = {
            personUuid: getUuidForObject(person).toString(),
            personIdentifier: getPersonIdentifiers(person),
            // personEntitlement in 1.1.2 asks for a an array of personRoles which are objects of 'person' and 'role'
            // however after filing an issue, we were told that it should actually be a 'number' and is for the personRole
            // enumeration type, not the personRole objects: https://github.com/JiscRDSS/rdss-message-api-docs/issues/36
            personEntitlement: entitlement || JISC.schema.personRole.other,
            personOrganisation: getPersonOrganisations(person),
            personAffiliation: getPersonAffiliations(person), // array of "eduPersonScopedAffiliation" enums
            personGivenName: person.title
        };
        var nameFields = person.firstTitle().toFields();
        if(nameFields) {
            r.personCn = nameFields.first;
            r.personSn = nameFields.last;
        }
        var tel = person.first(A.TelephoneNumber);
        if(tel) {
            r.personTelephoneNumber = tel;
        }
        var mail = person.first(A.EmailAddress);
        if(mail) {
            r.personMail = mail.toString();
        }
        r.personOu = ""; // what is personOu
        return r;
    }
};

var getObjectIdentifiers = function(object) {
    var identifiers = [];
    // TODO: other identifiers
    var doi = object.first(A.DOI);
    if(doi) {
        identifiers.push({
            identifierValue: doi.toString(),
            identifierType: JISC.schema.identifierType.DOI 
        });
    }
    return identifiers;
};

var getObjectDates = function(object) {
    // There's no specification for dateValue other than 'string'
    // passing a javascript date... they also don't specifcy a timezone
    var dates = [];
    dates.push({dateType: JISC.schema.dateType.created, dateValue: object.creationDate});
    dates.push({dateType: JISC.schema.dateType.modified, dateValue: object.lastModificationDate});
    object.every(A.PublicationDates, function(v,d,q) {
        var dateType = JISC.mappings.dateType[q];
        if(!dateType && dateType !== 0) { return; }
        dates.push({dateType: dateType, dateValue: v.start});
    });
    object.every(A.PublicationProcessDates, function(v,d,q) {
        var dateType = JISC.mappings.dateType[q];
        if(!dateType && dateType !== 0) { return; }
        dates.push({dateType: dateType, dateValue: v.start});
    });
    return dates;
};

P.serializeObjectForBus = function(object, isCreate) {
    var body = {
        objectUuid: getUuidForObject(object).toString(),
        objectTitle: object.title,
        objectDescription: object.first(A.Abstract) ? object.first(A.Abstract).toString() : "",
        objectPersonRole: _.compact(_.map(object.every(A.Author), function(res) {
            return P.serializePersonForBus(res.load(), JISC.schema.personRole.author);
        })),
        objectRights: [{
            rightsStatement: [""], // TODO
            rightsHolder: [""], // TODO
            licence: [{ 
                licenceName: object.first(A.License) ? object.first(A.License).load().title : "",
                licenceIdentifier: "" // TODO
            }],
            access: [{
                // accessStatement: "" // OPTIONAL
                accessType: object.first(A.AccessLevel) ?
                    JISC.mappings.accessType[object.first(A.AccessLevel).behaviour] :
                    JISC.schema.accessType.closed // TODO: is this a sensible fallback?
            }]
        }],
        objectDate: getObjectDates(object),
        objectResourceType: JISC.mappings.resourceType[object.first(A.Type)] || 
            JISC.schema.resourceType.other, // TODO: better fallback then 'other'?
        objectValue: JISC.schema.objectValue.normal, // TODO: what does value mean
        // objectKeywords: [""] // OPTIONAL
        objectIdentifier: getObjectIdentifiers(object)
    };
    if(object.first(A.File)) {
        body.objectFile = _.map(object.every(A.File), function(fileId) {
            var file = O.file(fileId);
            return {                        
                fileUuid: getUuidForFile(file).toString(),
                fileIdentifier: fileId.digest, // no specification what identifier should be
                fileName: fileId.filename,
                fileSize: fileId.fileSize,
                fileChecksum: { 
                    checksumType: JISC.schema.checksumType.sha256,
                    checksumValue: fileId.digest // digests are sha-256
                },
                fileCompositionLevel: "", // TODO: what does this string mean
                fileDateCreated: { 
                    dateValue: file.createdAt,
                    dateType: JISC.schema.dateType.created // spec asks for these dates to be 'date' objects, so have to specify type(?)
                },
                fileDateModified: { 
                    dateValue: file.createdAt, // TODO: can't easily get the actual modification time right now...
                    // ...look at history of object and work out? easier to add ways to track this. 
                    dateType: JISC.schema.dateType.modified // spec asks for these dates to be 'date' objects, so have to specify type(?)
                }, 
                fileUse: JISC.schema.fileUse.originalFile, // Enum: OriginalFile
                filePreservationEvent: {
                    preservationEventValue: isCreate ? "create" : "update", // TODO: what does this string mean?
                    preservationEventType: JISC.schema.preservationEventType.capture // TODO: does this need to be 'created' or 'update'?
                },
                fileUploadStatus: JISC.schema.uploadStatus.uploadComplete, // Enum: uploadComplete,
                fileStorageStatus: JISC.schema.storageStatus.online, // Enum: online
                fileStorageType: JISC.schema.storageType.HTTP,
                fileStorageLocation: file.url({
                        asFullURL: true,
                        authenticationSignatureValidForSeconds: 86400 // one day
                    })
            };
        });
    }
    return body;
};

P.createHeaderForBus = function(object, isCreate) {
    return {
        messageId: O.uuid.randomUUID().toString(),
        messageClass: "Event",
        messageType: isCreate ? "MetadataCreate" : "MetadataUpdate",
        // returnAddress:
        messageTimings: {
            publishedTimestamp: new Date()
            // expirationTimestamp:
        },
        messageSequence: {
            sequence: O.uuid.randomUUID().toString(), // TODO: is this ok? need to store it if more than 1 msg
            position: 1,
            total: 1
        },
        // messageHistory: {
        //     machineId: "",
        //     machineAddress: "",
        //     timestamp: ""
        // },
        version: "1.1.2"
    };
};

P.createMessageForBus = function(object, isCreate) {
    var header = P.createHeaderForBus(object, isCreate);
    var body = P.serializeObjectForBus(object, isCreate);
    return {
        header: header,
        body: body
    };
};
