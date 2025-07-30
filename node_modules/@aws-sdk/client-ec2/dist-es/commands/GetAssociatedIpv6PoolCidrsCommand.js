import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_GetAssociatedIpv6PoolCidrsCommand, se_GetAssociatedIpv6PoolCidrsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class GetAssociatedIpv6PoolCidrsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "GetAssociatedIpv6PoolCidrs", {})
    .n("EC2Client", "GetAssociatedIpv6PoolCidrsCommand")
    .f(void 0, void 0)
    .ser(se_GetAssociatedIpv6PoolCidrsCommand)
    .de(de_GetAssociatedIpv6PoolCidrsCommand)
    .build() {
}
