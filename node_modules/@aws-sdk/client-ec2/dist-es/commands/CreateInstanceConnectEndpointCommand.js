import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreateInstanceConnectEndpointCommand, se_CreateInstanceConnectEndpointCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CreateInstanceConnectEndpointCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateInstanceConnectEndpoint", {})
    .n("EC2Client", "CreateInstanceConnectEndpointCommand")
    .f(void 0, void 0)
    .ser(se_CreateInstanceConnectEndpointCommand)
    .de(de_CreateInstanceConnectEndpointCommand)
    .build() {
}
