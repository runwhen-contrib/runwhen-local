import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ModifyDBClusterEndpointCommand, se_ModifyDBClusterEndpointCommand } from "../protocols/Aws_query";
export { $Command };
export class ModifyDBClusterEndpointCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "ModifyDBClusterEndpoint", {})
    .n("RDSClient", "ModifyDBClusterEndpointCommand")
    .f(void 0, void 0)
    .ser(se_ModifyDBClusterEndpointCommand)
    .de(de_ModifyDBClusterEndpointCommand)
    .build() {
}
