import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ProvisionPublicIpv4PoolCidrCommand, se_ProvisionPublicIpv4PoolCidrCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ProvisionPublicIpv4PoolCidrCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ProvisionPublicIpv4PoolCidr", {})
    .n("EC2Client", "ProvisionPublicIpv4PoolCidrCommand")
    .f(void 0, void 0)
    .ser(se_ProvisionPublicIpv4PoolCidrCommand)
    .de(de_ProvisionPublicIpv4PoolCidrCommand)
    .build() {
}
