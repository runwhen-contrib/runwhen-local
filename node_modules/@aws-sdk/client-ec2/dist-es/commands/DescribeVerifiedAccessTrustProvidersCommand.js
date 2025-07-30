import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { DescribeVerifiedAccessTrustProvidersResultFilterSensitiveLog, } from "../models/models_5";
import { de_DescribeVerifiedAccessTrustProvidersCommand, se_DescribeVerifiedAccessTrustProvidersCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DescribeVerifiedAccessTrustProvidersCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DescribeVerifiedAccessTrustProviders", {})
    .n("EC2Client", "DescribeVerifiedAccessTrustProvidersCommand")
    .f(void 0, DescribeVerifiedAccessTrustProvidersResultFilterSensitiveLog)
    .ser(se_DescribeVerifiedAccessTrustProvidersCommand)
    .de(de_DescribeVerifiedAccessTrustProvidersCommand)
    .build() {
}
