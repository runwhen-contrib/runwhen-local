import { getEndpointPlugin } from "@smithy/middleware-endpoint";
import { getSerdePlugin } from "@smithy/middleware-serde";
import { Command as $Command } from "@smithy/smithy-client";
import { commonParams } from "../endpoint/EndpointParameters";
import { de_GetIpamDiscoveredAccountsCommand, se_GetIpamDiscoveredAccountsCommand } from "../protocols/Aws_ec2";
export { $Command };
export class GetIpamDiscoveredAccountsCommand extends $Command
    .classBuilder()
    .ep(commonParams)
    .m(function (Command, cs, config, o) {
    return [
        getSerdePlugin(config, this.serialize, this.deserialize),
        getEndpointPlugin(config, Command.getEndpointParameterInstructions()),
    ];
})
    .s("AmazonEC2", "GetIpamDiscoveredAccounts", {})
    .n("EC2Client", "GetIpamDiscoveredAccountsCommand")
    .f(void 0, void 0)
    .ser(se_GetIpamDiscoveredAccountsCommand)
    .de(de_GetIpamDiscoveredAccountsCommand)
    .build() {
}
