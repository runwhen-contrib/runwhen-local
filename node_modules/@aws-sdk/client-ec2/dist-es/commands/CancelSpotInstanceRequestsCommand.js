import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CancelSpotInstanceRequestsCommand, se_CancelSpotInstanceRequestsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CancelSpotInstanceRequestsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CancelSpotInstanceRequests", {})
    .n("EC2Client", "CancelSpotInstanceRequestsCommand")
    .f(void 0, void 0)
    .ser(se_CancelSpotInstanceRequestsCommand)
    .de(de_CancelSpotInstanceRequestsCommand)
    .build() {
}
