import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ProvisionIpamPoolCidrCommand, se_ProvisionIpamPoolCidrCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ProvisionIpamPoolCidrCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ProvisionIpamPoolCidr", {})
    .n("EC2Client", "ProvisionIpamPoolCidrCommand")
    .f(void 0, void 0)
    .ser(se_ProvisionIpamPoolCidrCommand)
    .de(de_ProvisionIpamPoolCidrCommand)
    .build() {
}
