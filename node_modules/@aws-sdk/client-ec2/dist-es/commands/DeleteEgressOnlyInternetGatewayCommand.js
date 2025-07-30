import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteEgressOnlyInternetGatewayCommand, se_DeleteEgressOnlyInternetGatewayCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DeleteEgressOnlyInternetGatewayCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeleteEgressOnlyInternetGateway", {})
    .n("EC2Client", "DeleteEgressOnlyInternetGatewayCommand")
    .f(void 0, void 0)
    .ser(se_DeleteEgressOnlyInternetGatewayCommand)
    .de(de_DeleteEgressOnlyInternetGatewayCommand)
    .build() {
}
