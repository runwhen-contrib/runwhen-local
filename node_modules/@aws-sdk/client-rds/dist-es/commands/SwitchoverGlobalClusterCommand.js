import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_SwitchoverGlobalClusterCommand, se_SwitchoverGlobalClusterCommand } from "../protocols/Aws_query";
export { $Command };
export class SwitchoverGlobalClusterCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "SwitchoverGlobalCluster", {})
    .n("RDSClient", "SwitchoverGlobalClusterCommand")
    .f(void 0, void 0)
    .ser(se_SwitchoverGlobalClusterCommand)
    .de(de_SwitchoverGlobalClusterCommand)
    .build() {
}
