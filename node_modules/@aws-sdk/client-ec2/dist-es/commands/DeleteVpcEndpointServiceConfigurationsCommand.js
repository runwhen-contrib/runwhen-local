import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteVpcEndpointServiceConfigurationsCommand, se_DeleteVpcEndpointServiceConfigurationsCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DeleteVpcEndpointServiceConfigurationsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeleteVpcEndpointServiceConfigurations", {})
    .n("EC2Client", "DeleteVpcEndpointServiceConfigurationsCommand")
    .f(void 0, void 0)
    .ser(se_DeleteVpcEndpointServiceConfigurationsCommand)
    .de(de_DeleteVpcEndpointServiceConfigurationsCommand)
    .build() {
}
