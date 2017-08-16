/* Haplo Research Manager (Jisc RDSS)                https://haplo.org
 * (c) Haplo Services Ltd 2006 - 2017   https://www.haplo-services.com
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.         */

// AUTO-GENERATED FILE

var schema = {};

schema.preservationEventType = {
    capture: 0,
    compression: 1,
    creation: 2,
    deaccession: 3,
    decompression: 4,
    decryption: 5,
    deletion: 6,
    digitalSignatureValidation: 7,
    download: 8,
    fixityCheck: 9,
    ingestion: 10,
    messageDigestCalculation: 11,
    migration: 12,
    normalisation: 13,
    replication: 14,
    update: 15,
    validation: 16,
    virusCheck: 17
};

schema.checksumType = {
    md5: 0,
    sha256: 1
};

schema.organisationType = {
    charity: 0,
    commerical: 1,
    funder: 2,
    furtherEducation: 3,
    government: 4,
    health: 5,
    heritage: 6,
    higherEducation: 7,
    other: 8,
    professionalBody: 9,
    research: 10,
    school: 11,
    skills: 12,
    billing: 13,
    display: 14
};

schema.resourceType = {
    artDesignItem: 0,
    article: 1,
    audio: 2,
    book: 3,
    bookSection: 4,
    conferenceWorkshopItem: 5,
    dataset: 6,
    examPaper: 7,
    image: 8,
    journal: 9,
    learningObject: 10,
    metadataRecord: 11,
    movingImage: 12,
    musicComposition: 13,
    other: 14,
    patent: 15,
    performance: 16,
    preprint: 17,
    report: 18,
    review: 19,
    showExhibition: 20,
    software: 21,
    text: 22,
    thesisDissertation: 23,
    unknown: 24,
    website: 25,
    workflow: 26,
    equipment: 27
};

schema.fileUse = {
    originalFile: 0,
    thumbnailImage: 1,
    extractedText: 2,
    preservationMasterFile: 3,
    intermediateFile: 4,
    serviceFile: 5,
    transcript: 6
};

schema.accessType = {
    open: 0,
    safeguarded: 1,
    controlled: 2,
    restricted: 3,
    closed: 4
};

schema.eduPersonScopedAffiliation = {
    student: 0,
    staff: 1,
    faculty: 2,
    employee: 3,
    member: 4,
    affiliate: 5,
    alum: 6,
    libraryWalkIn: 7
};

schema.storageType = {
    S3: 0,
    HTTP: 1
};

schema.organisationRole = {
    funder: 0,
    hostingInstitution: 1,
    rightsHolder: 2,
    sponsor: 3,
    publisher: 4,
    registrationAgency: 5,
    registrationAuthority: 6,
    distributor: 7,
    advocacy: 8,
    author: 9
};

schema.identifierType = {
    ARK: 0,
    arXiv: 1,
    bibcode: 2,
    DOI: 3,
    EAN13: 4,
    EISSN: 5,
    Handle: 6,
    ISBN: 7,
    ISSN: 8,
    ISTC: 9,
    LISSN: 10,
    LSID: 11,
    PMID: 12,
    PUID: 13,
    PURL: 14,
    UPC: 15,
    URL: 16,
    URN: 17
};

schema.relationType = {
    cites: 0,
    isCitedBy: 1,
    isSupplementTo: 2,
    isSupplementedBy: 3,
    continues: 4,
    isContinuedBy: 5,
    hasMetadata: 6,
    isMetadataFor: 7,
    isNewVersionOf: 8,
    isPreviousVersionOf: 9,
    isPartOf: 10,
    hasPart: 11,
    isReferencedBy: 12,
    references: 13,
    isDocumentedBy: 14,
    documents: 15,
    isCompiledBy: 16,
    compiles: 17,
    isVariantFormOf: 18,
    isOriginalFormOf: 19,
    isIdenticalTo: 20,
    isReviewedBy: 21,
    reviews: 22,
    isDerivedFrom: 23,
    isSourceOf: 24,
    isCommentOn: 25,
    hasComment: 26,
    isReplyTo: 27,
    hasReply: 28,
    basedOnData: 29,
    hasRelatedMaterial: 30,
    isBasedOn: 31,
    isBasisFor: 32,
    requires: 33,
    isRequiredBy: 34,
    hasParent: 35,
    isParentOf: 36
};

schema.personRole = {
    administrator: 0,
    contactPerson: 1,
    dataAnalyser: 2,
    dataCollector: 3,
    dataCreator: 4,
    dataManager: 5,
    editor: 6,
    investigator: 7,
    producer: 8,
    projectLeader: 9,
    publicationAuthor: 10,
    publisher: 11,
    projectMember: 12,
    relatedPerson: 13,
    researcher: 14,
    researcherGroup: 15,
    rightsHolder: 16,
    sponsor: 17,
    supervisor: 18,
    other: 19,
    author: 20
};

schema.storageStatus = {
    online: 0,
    nearline: 1,
    offline: 2
};

schema.dateType = {
    accepted: 0,
    approved: 1,
    available: 2,
    copyrighted: 3,
    collected: 4,
    created: 5,
    issued: 6,
    modified: 7,
    posted: 8,
    published: 9
};

schema.uploadStatus = {
    uploadStarted: 0,
    uploadComplete: 1,
    uploadAborted: 2
};

schema.personIdentifierType = {
    ORCID: 0,
    FOAF: 1,
    Twitter: 2,
    eduPersonTargetedID: 3,
    eduPersonPrincipleName: 4
};

schema.objectValue = {
    normal: 0,
    high: 1,
    veryHigh: 2
};

P.jisc = P.jisc || {};
P.jisc.schema = Object.freeze(schema);