/* Haplo Research Manager (Jisc RDSS)                https://haplo.org
 * (c) Haplo Services Ltd 2006 - 2017   https://www.haplo-services.com
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.         */

var JISC = P.jisc;

var createNewObjectFromMessage = function(message) {
    var o = O.object();
    var uuid = O.uuid.fromString(message.body.objectUuid);
    o.append(uuid, A.UUID);
    buildObject(o, message);
    o.save();
    return o;
};

var updateObjectFromMessage = function(message, object) {
    var om = object.mutableCopy();
    buildObject(om, message);
    om.save();
    return om;
};

var matchPersonRecord = function(person) {
    if(person.personUuid) {
        var q1 = O.query().link(T.Person, A.Type).identifier(O.text(O.T_IDENTIFIER_UUID, person.personUuid), A.UUID).execute();
        if(q1.length) { return q1[0]; }
    }
    if(person.personMail) {
        var q2 = O.query().link(T.Person, A.Type).identifier(O.text(O.T_IDENTIFIER_EMAIL_ADDRESS, person.personMail), A.EmailAddress).execute();
        // Assumes only 1 record, matches first
        if(q2.length) {
            var personMutable = q2[0].mutableCopy();
            if(person.personUuid) {
                // if we match someone with email and don't store their UUID, append it to the record?
                personMutable.append(O.text(O.T_IDENTIFIER_UUID, person.personUuid), A.UUID);
                personMutable.save();
            }
            return q2[0];
        }
    }
};

var buildObject = function(o, message) {
    // TODO: findKey? invert loses data here where multiple haplo types map to
    // a single JISC schema resourcetype
    var typeAsStr = _.invert(JISC.mappings.resourceType)[message.body.objectResourceType];
    o.remove(A.Type);
    o.appendType(O.ref(typeAsStr));
    o.remove(A.Title);
    o.appendTitle(message.body.objectTitle);
    if(message.body.objectDescription) {
        o.remove(A.Abstract);
        o.append(O.text(O.T_TEXT_PARAGRAPH, message.body.objectDescription), A.Abstract);
    }
    if(message.body.objectIdentifier) {
        _.each(message.body.objectIdentifier, function(oi) {
            if(oi.identifierType === JISC.schema.identifierType.DOI) {
                o.remove(A.DOI); // assumes only 1 DOI, which... seems correct
                var doi;
                // TODO: exception here will prevent ingest, general
                // strategy to avoid this? try/catch?
                if(oi.identifierValue.substr(0,4) == "doi:") {
                    doi = P.DOI.create(oi.identifierValue.substr(4));
                } else {
                    doi = P.DOI.create(oi.identifierValue);
                }
                o.append(doi, A.DOI);
            }
        });
    }
    if(message.body.objectPersonRole && message.body.objectPersonRole.length) {
        _.each(message.body.objectPersonRole, function(p) {
            // don't record anyone who isn't an author
            if(p.personEntitlement !== JISC.schema.personRole.author) { return; }
            // if author, try to match to a record in system
            var match = matchPersonRecord(p);
            // don't do anything if author already an author
            if(o.has(match.ref, A.Author)) { return; }  // TODO: is ordering important?
            if(match) { 
                O.service("hres:author_citation:append_citation_to_object", o, A.Author, null, {
                    object: match
                });
            } else {
                // otherwise just add as a text citation
                if(p.personCn && p.personSn) { // if they have first/last names
                    O.service("hres:author_citation:append_citation_to_object", o, A.Author, null, {
                        // TODO: uuid?
                        first: p.personCn,
                        last: p.personSn
                    });
                }
            }
        });
    }
    if(message.body.objectDate) {
        o.remove(A.PublicationDates);
        o.remove(A.PublicationProcessDates);
        _.each(message.body.objectDate, function(d) {
            // TODO: creation/modification dates? can't override platform, nowhere to store
            var qual = parseInt(_.invert(JISC.mappings.dateType)[d.dateType.toString()], 10);
            if([Q.Print, Q.Online].indexOf(qual) !== -1) { // TODO: not very nicely mapped currently
                o.append(new Date(d.dateValue), A.PublicationDates, qual);
                return;
            }
            if([Q.Accepted, Q.Completed, Q.Deposited].indexOf(qual) !== -1) { // TODO: not very nicely mapped
                o.append(new Date(d.dateValue), A.PublicationProcessDates, qual);
                return;
            }
        });
    }
    if(message.body.objectRights) {
        o.remove(A.License);
        _.each(message.body.objectRights, function(right) {
            // TODO: rightsStatement, rightsHolder, licenceIdentifier, accessStatement
            if(right.access) {
                _.each(right.access, function(a) {
                    var at, atBehaviour = _.invert(JISC.mappings.accessType)[a.accessType];
                    if(atBehaviour) { at = O.behaviourRefMaybe(atBehaviour); }
                    if(at) {
                        // remove any access levels that aren't the last one? probably wants a different approach
                        o.remove(A.AccessLevel);
                        o.append(at, A.AccessLevel);
                    }
                });
            }
            if(right.licence) {
                _.each(right.licence, function(l) {
                    // TODO: Licence ingest... just putting the name in the attribute as text
                    // for now which isn't really correct, but no way to identify existing 'Licence' objects
                    o.append(l.licenceName, A.License);
                });
            }
        });
    }
    return o;
};

P.ingestObjectFromMessage = function(message) {
    try {
        var existingObject = O.query().identifier(O.uuid.fromString(message.body.objectUuid), A.UUID).execute();
        if(!existingObject.length) {
            console.log('Creating new object from message');
            // we don't know anything about this object, so create
            // TODO: do we want to rely on metadata 'update' vs 'create'?
            var newObject = createNewObjectFromMessage(message);
        } else {
            console.log('Updating object '+existingObject[0].ref+' from message');
            updateObjectFromMessage(message, existingObject[0]);
        }
    } catch(e) {
        // exceptions don't get printed in plugin tool, do this for debugging for now
        console.log("EXCEPTION IN MESSAGE INGEST:", e);
        throw new Error(e);
    }
};
