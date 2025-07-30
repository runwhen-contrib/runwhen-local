import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteNetworkAclCommand, se_DeleteNetworkAclCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DeleteNetworkAclCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeleteNetworkAcl", {})
    .n("EC2Client", "DeleteNetworkAclCommand")
    .f(void 0, void 0)
    .ser(se_DeleteNetworkAclCommand)
    .de(de_DeleteNetworkAclCommand)
    .build() {
}
