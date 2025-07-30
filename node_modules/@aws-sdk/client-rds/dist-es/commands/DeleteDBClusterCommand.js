import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteDBClusterCommand, se_DeleteDBClusterCommand } from "../protocols/Aws_query";
export { $Command };
export class DeleteDBClusterCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "DeleteDBCluster", {})
    .n("RDSClient", "DeleteDBClusterCommand")
    .f(void 0, void 0)
    .ser(se_DeleteDBClusterCommand)
    .de(de_DeleteDBClusterCommand)
    .build() {
}
