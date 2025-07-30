import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteIpamExternalResourceVerificationTokenCommand, se_DeleteIpamExternalResourceVerificationTokenCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DeleteIpamExternalResourceVerificationTokenCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeleteIpamExternalResourceVerificationToken", {})
    .n("EC2Client", "DeleteIpamExternalResourceVerificationTokenCommand")
    .f(void 0, void 0)
    .ser(se_DeleteIpamExternalResourceVerificationTokenCommand)
    .de(de_DeleteIpamExternalResourceVerificationTokenCommand)
    .build() {
}
