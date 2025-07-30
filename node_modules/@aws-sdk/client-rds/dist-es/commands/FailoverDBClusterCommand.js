import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_FailoverDBClusterCommand, se_FailoverDBClusterCommand } from "../protocols/Aws_query";
export { $Command };
export class FailoverDBClusterCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonRDSv19", "FailoverDBCluster", {})
    .n("RDSClient", "FailoverDBClusterCommand")
    .f(void 0, void 0)
    .ser(se_FailoverDBClusterCommand)
    .de(de_FailoverDBClusterCommand)
    .build() {
}
