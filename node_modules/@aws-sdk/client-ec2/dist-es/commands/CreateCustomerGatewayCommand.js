import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreateCustomerGatewayCommand, se_CreateCustomerGatewayCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CreateCustomerGatewayCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreateCustomerGateway", {})
    .n("EC2Client", "CreateCustomerGatewayCommand")
    .f(void 0, void 0)
    .ser(se_CreateCustomerGatewayCommand)
    .de(de_CreateCustomerGatewayCommand)
    .build() {
}
