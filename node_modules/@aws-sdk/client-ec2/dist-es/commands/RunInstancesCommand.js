import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { RunInstancesRequestFilterSensitiveLog } from "../models/models_8";
import { de_RunInstancesCommand, se_RunInstancesCommand } from "../protocols/Aws_ec2";
export { $Command };
export class RunInstancesCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "RunInstances", {})
    .n("EC2Client", "RunInstancesCommand")
    .f(RunInstancesRequestFilterSensitiveLog, void 0)
    .ser(se_RunInstancesCommand)
    .de(de_RunInstancesCommand)
    .build() {
}
