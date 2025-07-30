import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_RemoveRoleFromDBClusterCommand, se_RemoveRoleFromDBClusterCommand } from "../protocols/Aws_query";
export { $Command };
export class RemoveRoleFromDBClusterCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "RemoveRoleFromDBCluster", {})
    .n("RDSClient", "RemoveRoleFromDBClusterCommand")
    .f(void 0, void 0)
    .ser(se_RemoveRoleFromDBClusterCommand)
    .de(de_RemoveRoleFromDBClusterCommand)
    .build() {
}
