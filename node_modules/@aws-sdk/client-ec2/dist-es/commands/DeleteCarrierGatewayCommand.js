import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteCarrierGatewayCommand, se_DeleteCarrierGatewayCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DeleteCarrierGatewayCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeleteCarrierGateway", {})
    .n("EC2Client", "DeleteCarrierGatewayCommand")
    .f(void 0, void 0)
    .ser(se_DeleteCarrierGatewayCommand)
    .de(de_DeleteCarrierGatewayCommand)
    .build() {
}
