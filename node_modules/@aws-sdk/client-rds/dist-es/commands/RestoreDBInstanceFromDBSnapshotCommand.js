import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_RestoreDBInstanceFromDBSnapshotCommand, se_RestoreDBInstanceFromDBSnapshotCommand, } from "../protocols/Aws_query";
export { $Command };
export class RestoreDBInstanceFromDBSnapshotCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "RestoreDBInstanceFromDBSnapshot", {})
    .n("RDSClient", "RestoreDBInstanceFromDBSnapshotCommand")
    .f(void 0, void 0)
    .ser(se_RestoreDBInstanceFromDBSnapshotCommand)
    .de(de_RestoreDBInstanceFromDBSnapshotCommand)
    .build() {
}
