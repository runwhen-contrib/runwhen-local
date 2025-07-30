import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_ResetEbsDefaultKmsKeyIdCommand, se_ResetEbsDefaultKmsKeyIdCommand } from "../protocols/Aws_ec2";
export { $Command };
export class ResetEbsDefaultKmsKeyIdCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "ResetEbsDefaultKmsKeyId", {})
    .n("EC2Client", "ResetEbsDefaultKmsKeyIdCommand")
    .f(void 0, void 0)
    .ser(se_ResetEbsDefaultKmsKeyIdCommand)
    .de(de_ResetEbsDefaultKmsKeyIdCommand)
    .build() {
}
