import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_CreatePublicIpv4PoolCommand, se_CreatePublicIpv4PoolCommand } from "../protocols/Aws_ec2";
export { $Command };
export class CreatePublicIpv4PoolCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "CreatePublicIpv4Pool", {})
    .n("EC2Client", "CreatePublicIpv4PoolCommand")
    .f(void 0, void 0)
    .ser(se_CreatePublicIpv4PoolCommand)
    .de(de_CreatePublicIpv4PoolCommand)
    .build() {
}
