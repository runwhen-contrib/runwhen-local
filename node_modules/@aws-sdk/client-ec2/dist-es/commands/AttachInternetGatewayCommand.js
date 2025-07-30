import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_AttachInternetGatewayCommand, se_AttachInternetGatewayCommand } from "../protocols/Aws_ec2";
export { $Command };
export class AttachInternetGatewayCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "AttachInternetGateway", {})
    .n("EC2Client", "AttachInternetGatewayCommand")
    .f(void 0, void 0)
    .ser(se_AttachInternetGatewayCommand)
    .de(de_AttachInternetGatewayCommand)
    .build() {
}
