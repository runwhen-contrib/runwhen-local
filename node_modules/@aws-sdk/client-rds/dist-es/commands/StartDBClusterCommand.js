import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_StartDBClusterCommand, se_StartDBClusterCommand } from "../protocols/Aws_query";
export { $Command };
export class StartDBClusterCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "StartDBCluster", {})
    .n("RDSClient", "StartDBClusterCommand")
    .f(void 0, void 0)
    .ser(se_StartDBClusterCommand)
    .de(de_StartDBClusterCommand)
    .build() {
}
