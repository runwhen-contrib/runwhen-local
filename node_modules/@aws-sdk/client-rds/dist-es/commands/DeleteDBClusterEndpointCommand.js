import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteDBClusterEndpointCommand, se_DeleteDBClusterEndpointCommand } from "../protocols/Aws_query";
export { $Command };
export class DeleteDBClusterEndpointCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DeleteDBClusterEndpoint", {})
    .n("RDSClient", "DeleteDBClusterEndpointCommand")
    .f(void 0, void 0)
    .ser(se_DeleteDBClusterEndpointCommand)
    .de(de_DeleteDBClusterEndpointCommand)
    .build() {
}
