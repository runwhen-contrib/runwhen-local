import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { RunScheduledInstancesRequestFilterSensitiveLog, } from "../models/models_8";
import { de_RunScheduledInstancesCommand, se_RunScheduledInstancesCommand } from "../protocols/Aws_ec2";
export { $Command };
export class RunScheduledInstancesCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "RunScheduledInstances", {})
    .n("EC2Client", "RunScheduledInstancesCommand")
    .f(RunScheduledInstancesRequestFilterSensitiveLog, void 0)
    .ser(se_RunScheduledInstancesCommand)
    .de(de_RunScheduledInstancesCommand)
    .build() {
}
