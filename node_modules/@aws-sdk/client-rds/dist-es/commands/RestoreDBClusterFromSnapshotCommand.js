import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_RestoreDBClusterFromSnapshotCommand, se_RestoreDBClusterFromSnapshotCommand } from "../protocols/Aws_query";
export { $Command };
export class RestoreDBClusterFromSnapshotCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "RestoreDBClusterFromSnapshot", {})
    .n("RDSClient", "RestoreDBClusterFromSnapshotCommand")
    .f(void 0, void 0)
    .ser(se_RestoreDBClusterFromSnapshotCommand)
    .de(de_RestoreDBClusterFromSnapshotCommand)
    .build() {
}
