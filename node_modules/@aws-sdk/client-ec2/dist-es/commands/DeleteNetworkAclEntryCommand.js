import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteNetworkAclEntryCommand, se_DeleteNetworkAclEntryCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DeleteNetworkAclEntryCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeleteNetworkAclEntry", {})
    .n("EC2Client", "DeleteNetworkAclEntryCommand")
    .f(void 0, void 0)
    .ser(se_DeleteNetworkAclEntryCommand)
    .de(de_DeleteNetworkAclEntryCommand)
    .build() {
}
