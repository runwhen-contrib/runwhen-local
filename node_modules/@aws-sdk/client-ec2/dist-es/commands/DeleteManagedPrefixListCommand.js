import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteManagedPrefixListCommand, se_DeleteManagedPrefixListCommand } from "../protocols/Aws_ec2";
export { $Command };
export class DeleteManagedPrefixListCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeleteManagedPrefixList", {})
    .n("EC2Client", "DeleteManagedPrefixListCommand")
    .f(void 0, void 0)
    .ser(se_DeleteManagedPrefixListCommand)
    .de(de_DeleteManagedPrefixListCommand)
    .build() {
}
