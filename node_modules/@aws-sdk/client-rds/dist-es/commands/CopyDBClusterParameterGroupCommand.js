import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CopyDBClusterParameterGroupCommand, se_CopyDBClusterParameterGroupCommand } from "../protocols/Aws_query";
export { $Command };
export class CopyDBClusterParameterGroupCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "CopyDBClusterParameterGroup", {})
    .n("RDSClient", "CopyDBClusterParameterGroupCommand")
    .f(void 0, void 0)
    .ser(se_CopyDBClusterParameterGroupCommand)
    .de(de_CopyDBClusterParameterGroupCommand)
    .build() {
}
