import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ModifyVpcEndpointServicePayerResponsibilityCommand, se_ModifyVpcEndpointServicePayerResponsibilityCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class ModifyVpcEndpointServicePayerResponsibilityCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ModifyVpcEndpointServicePayerResponsibility", {})
    .n("EC2Client", "ModifyVpcEndpointServicePayerResponsibilityCommand")
    .f(void 0, void 0)
    .ser(se_ModifyVpcEndpointServicePayerResponsibilityCommand)
    .de(de_ModifyVpcEndpointServicePayerResponsibilityCommand)
    .build() {
}
