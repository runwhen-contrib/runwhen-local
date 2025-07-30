import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_RemoveFromGlobalClusterCommand, se_RemoveFromGlobalClusterCommand } from "../protocols/Aws_query";
export { $Command };
export class RemoveFromGlobalClusterCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "RemoveFromGlobalCluster", {})
    .n("RDSClient", "RemoveFromGlobalClusterCommand")
    .f(void 0, void 0)
    .ser(se_RemoveFromGlobalClusterCommand)
    .de(de_RemoveFromGlobalClusterCommand)
    .build() {
}
