import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeletePublicIpv4PoolCommand, se_DeletePublicIpv4PoolCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DeletePublicIpv4PoolCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeletePublicIpv4Pool", {})
    .n("EC2Client", "DeletePublicIpv4PoolCommand")
    .f(void 0, void 0)
    .ser(se_DeletePublicIpv4PoolCommand)
    .de(de_DeletePublicIpv4PoolCommand)
    .build() {
}
