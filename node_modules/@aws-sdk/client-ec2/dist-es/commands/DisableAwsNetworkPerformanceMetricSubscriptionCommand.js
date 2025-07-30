import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DisableAwsNetworkPerformanceMetricSubscriptionCommand, se_DisableAwsNetworkPerformanceMetricSubscriptionCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DisableAwsNetworkPerformanceMetricSubscriptionCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DisableAwsNetworkPerformanceMetricSubscription", {})
    .n("EC2Client", "DisableAwsNetworkPerformanceMetricSubscriptionCommand")
    .f(void 0, void 0)
    .ser(se_DisableAwsNetworkPerformanceMetricSubscriptionCommand)
    .de(de_DisableAwsNetworkPerformanceMetricSubscriptionCommand)
    .build() {
}
