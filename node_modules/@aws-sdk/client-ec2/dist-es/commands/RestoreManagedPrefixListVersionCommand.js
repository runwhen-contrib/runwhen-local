import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_RestoreManagedPrefixListVersionCommand, se_RestoreManagedPrefixListVersionCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class RestoreManagedPrefixListVersionCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "RestoreManagedPrefixListVersion", {})
    .n("EC2Client", "RestoreManagedPrefixListVersionCommand")
    .f(void 0, void 0)
    .ser(se_RestoreManagedPrefixListVersionCommand)
    .de(de_RestoreManagedPrefixListVersionCommand)
    .build() {
}
