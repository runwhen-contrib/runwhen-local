import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreateDBClusterEndpointCommand, se_CreateDBClusterEndpointCommand } from "../protocols/Aws_query";
export { $Command };
export class CreateDBClusterEndpointCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "CreateDBClusterEndpoint", {})
    .n("RDSClient", "CreateDBClusterEndpointCommand")
    .f(void 0, void 0)
    .ser(se_CreateDBClusterEndpointCommand)
    .de(de_CreateDBClusterEndpointCommand)
    .build() {
}
