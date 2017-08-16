/* Haplo Research Manager (Jisc RDSS)                https://haplo.org
 * (c) Haplo Services Ltd 2006 - 2017   https://www.haplo-services.com
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.         */

// depends on P.jisc.schema being defined so should be loaded after

// TODO: is JISC RDSS always going to depend on hres repo schema?

var JISC = P.jisc;

var mappings = {};

// -------------------------------------------------------------------------------------------------------

mappings.resourceType = {};

// -- hres_repo_schema_research_data
mappings.resourceType[T.Dataset] = JISC.schema.resourceType.dataset;

// -- hres_repo_schema_outputs
// artefact?
mappings.resourceType[T.Audio] = JISC.schema.resourceType.audio;
mappings.resourceType[T.Book] = JISC.schema.resourceType.book;
mappings.resourceType[T.BookChapter] = JISC.schema.resourceType.bookSection;
// conference items?
mappings.resourceType[T.Composition] = JISC.schema.resourceType.musicComposition;
// design?
// devices and products?
// digital or visual media?
mappings.resourceType[T.Exhibition] = JISC.schema.resourceType.showExhibition;
mappings.resourceType[T.JournalArticle] = JISC.schema.resourceType.journal;
// online educational resource?
mappings.resourceType[T.Other] = JISC.schema.resourceType.other;
mappings.resourceType[T.Patent] = JISC.schema.resourceType.patent;
mappings.resourceType[T.Performance] = JISC.schema.resourceType.performance;
mappings.resourceType[T.Report] = JISC.schema.resourceType.report;
mappings.resourceType[T.DiscussionPaper] = JISC.schema.resourceType.report; // ? subtype
mappings.resourceType[T.ProjectReport] = JISC.schema.resourceType.report; // ? subtype
mappings.resourceType[T.TechnicalReport] = JISC.schema.resourceType.report; // ? subtype
mappings.resourceType[T.WorkingPaper] = JISC.schema.resourceType.report; // ? subtype
mappings.resourceType[T.Software] = JISC.schema.resourceType.software;
mappings.resourceType[T.Thesis] = JISC.schema.resourceType.thesisDissertation;
mappings.resourceType[T.Video] = JISC.schema.resourceType.movingImage;
mappings.resourceType[T.Website] = JISC.schema.resourceType.websit;

// -------------------------------------------------------------------------------------------------------

mappings.accessType = {};

mappings.accessType["hres:list:file-access-level:safeguarded"] = JISC.schema.accessType.safeguarded;
mappings.accessType["hres:list:file-access-level:open"] = JISC.schema.accessType.open;
mappings.accessType["hres:list:file-access-level:controlled"] = JISC.schema.accessType.controlled;
mappings.accessType["hres:list:file-access-level:restricted"] = JISC.schema.accessType.restricted;
// closed?

// -------------------------------------------------------------------------------------------------------

mappings.dateType = {};
mappings.dateType[Q.Print] = JISC.schema.dateType.published;
mappings.dateType[Q.Online] = JISC.schema.dateType.posted; // TODO: not 100% clear this is correct
mappings.dateType[Q.Accepted] = JISC.schema.dateType.accepted;
mappings.dateType[Q.Completed] = JISC.schema.dateType.approved; // TODO: not 100% clear this is correct
mappings.dateType[Q.Deposited] = JISC.schema.dateType.collected; // TODO: not 100% clear this is correct

// -------------------------------------------------------------------------------------------------------

P.jisc.mappings = Object.freeze(mappings);
