#!/usr/bin/python
# convert jisc message api schema enum definitions to something we can use in JS
#
# definitions should be present in file/schema/enumerations.json
#
# usage: python generate_enums_from_schema_definitions.py

import json

enumerations = "file/schema/enumeration.json"

output = [];
output.append("/* Haplo Research Manager (Jisc RDSS)                https://haplo.org")
output.append(" * (c) Haplo Services Ltd 2006 - 2017   https://www.haplo-services.com")
output.append(" * This Source Code Form is subject to the terms of the Mozilla Public")
output.append(" * License, v. 2.0. If a copy of the MPL was not distributed with this")
output.append(" * file, You can obtain one at http://mozilla.org/MPL/2.0/.         */")
output.append("")
output.append("// AUTO-GENERATED FILE")
output.append("")
output.append("var schema = {};")
output.append("")

with open(enumerations) as f:
    data = json.load(f)
    for attr, defn in data["definitions"].iteritems():
        output.append("schema.%s = {" % attr)
        enums_str = []
        for i, enum in enumerate(defn["enum"]):
            # TODO: should enums be converted to CAPS_UNDERSCORE_CASE ???
            enums_str.append("    %s: %s" % (enum, i))
        output.append(',\n'.join(enums_str))
        output.append("};")
        output.append("")

output.append("P.jisc = P.jisc || {};")
output.append("P.jisc.schema = Object.freeze(schema);")

# print '\n'.join(output)

with open('js/jisc_schema.js', 'w') as f:
    f.write('\n'.join(output))
