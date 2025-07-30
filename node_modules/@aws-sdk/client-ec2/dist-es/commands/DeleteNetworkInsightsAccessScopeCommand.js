import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_DeleteNetworkInsightsAccessScopeCommand, se_DeleteNetworkInsightsAccessScopeCommand, } from "../protocols/Aws_ec2";
export { $Command };
export class DeleteNetworkInsightsAccessScopeCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "DeleteNetworkInsightsAccessScope", {})
    .n("EC2Client", "DeleteNetworkInsightsAccessScopeCommand")
    .f(void 0, void 0)
    .ser(se_DeleteNetworkInsightsAccessScopeCommand)
    .de(de_DeleteNetworkInsightsAccessScopeCommand)
    .build() {
}
