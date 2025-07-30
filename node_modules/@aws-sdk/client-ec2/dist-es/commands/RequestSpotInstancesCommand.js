import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { RequestSpotInstancesRequestFilterSensitiveLog, RequestSpotInstancesResultFilterSensitiveLog, } from "../models/models_7";
import { de_RequestSpotInstancesCommand, se_RequestSpotInstancesCommand } from "../protocols/Aws_ec2";
export { $Command };
export class RequestSpotInstancesCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "RequestSpotInstances", {})
    .n("EC2Client", "RequestSpotInstancesCommand")
    .f(RequestSpotInstancesRequestFilterSensitiveLog, RequestSpotInstancesResultFilterSensitiveLog)
    .ser(se_RequestSpotInstancesCommand)
    .de(de_RequestSpotInstancesCommand)
    .build() {
}
